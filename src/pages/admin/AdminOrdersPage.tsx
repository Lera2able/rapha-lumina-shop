import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/db/supabase';
import { formatPrice } from '@/lib/utils';
import { Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'failed'
  | 'refunded';

interface AdminOrder {
  id: string;
  status: OrderStatus;
  customer_name: string | null;
  customer_email: string;
  total_amount: number;
  shipping_cost: number | null;
  created_at: string;
  tracking_number: string | null;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const BULK_TARGETS: { value: OrderStatus; label: string }[] = [
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function statusBadgeVariant(status: string) {
  if (status === 'completed' || status === 'delivered') return 'default';
  if (status === 'shipped' || status === 'processing') return 'secondary';
  if (status === 'cancelled' || status === 'failed' || status === 'refunded') return 'destructive';
  return 'outline';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('processing');
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          'id, status, customer_name, customer_email, total_amount, shipping_cost, created_at, tracking_number',
        )
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setOrders((data as AdminOrder[]) ?? []);
      setSelected(new Set());
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const hit =
          o.id.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          (o.customer_name?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }
      if (dateFrom) {
        if (new Date(o.created_at) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        // Include the whole "to" day
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(o.created_at) > end) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchTerm, dateFrom, dateTo]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((o) => o.id)));
    }
  };

  const runBulkUpdate = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Update ${selected.size} order(s) to "${bulkStatus}"?`)) return;

    setBulkBusy(true);
    try {
      const ids = [...selected];

      const updatePayload: any = {
        status: bulkStatus,
        updated_at: new Date().toISOString(),
      };
      if (bulkStatus === 'shipped') updatePayload.shipped_at = new Date().toISOString();
      if (bulkStatus === 'delivered') updatePayload.delivered_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('orders')
        .update(updatePayload)
        .in('id', ids);

      if (updateError) throw updateError;

      // If moving to shipped, fire a notification per order (only those that already
      // have a tracking number — bulk-shipping orders without tracking is unusual).
      if (bulkStatus === 'shipped') {
        const eligible = orders.filter((o) => selected.has(o.id) && o.tracking_number);
        if (eligible.length > 0) {
          await Promise.allSettled(
            eligible.map((o) =>
              supabase.functions.invoke('send_shipping_notification', {
                body: { order_id: o.id },
              }),
            ),
          );
          toast.success(
            `${ids.length} updated. Sent ${eligible.length} shipping email${eligible.length === 1 ? '' : 's'}.`,
          );
        } else {
          toast.success(`${ids.length} order(s) marked shipped. Add a tracking number to send emails.`);
        }
      } else {
        toast.success(`${ids.length} order(s) updated`);
      }

      await loadOrders();
    } catch (err) {
      console.error('Bulk update failed:', err);
      toast.error('Could not update orders');
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-1">Orders</h1>
          <p className="text-muted-foreground">{filtered.length} of {orders.length} orders</p>
        </div>
        <Button onClick={loadOrders} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Search</Label>
              <Input
                placeholder="Email, name, or order ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md flex-wrap">
              <span className="text-sm font-medium">{selected.size} selected</span>
              <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as OrderStatus)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BULK_TARGETS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      Mark as {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={runBulkUpdate} disabled={bulkBusy}>
                {bulkBusy ? 'Updating…' : 'Apply'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="p-3 text-left w-8">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-left">Tracking</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading orders…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No orders match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Checkbox
                        checked={selected.has(o.id)}
                        onCheckedChange={() => toggleSelect(o.id)}
                      />
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{o.customer_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant={statusBadgeVariant(o.status) as any}>{o.status}</Badge>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatPrice(Number(o.total_amount))}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {o.tracking_number ?? '—'}
                    </td>
                    <td className="p-3">
                      <Link to={`/admin/orders/${o.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
