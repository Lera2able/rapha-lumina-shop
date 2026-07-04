import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/db/supabase';
import { formatPrice } from '@/lib/utils';
import { Eye, Users } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerRow {
  email: string;
  customer_name: string | null;
  user_id: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
  is_guest: boolean;
}

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      // We aggregate customers from completed orders rather than the profiles table —
      // that way guest checkouts also count and the spend figures reflect real revenue.
      const { data: orders, error } = await supabase
        .from('orders')
        .select('user_id, customer_email, customer_name, total_amount, created_at, status')
        .in('status', ['processing', 'shipped', 'delivered', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const map = new Map<string, CustomerRow>();
      for (const o of orders ?? []) {
        const email = (o as any).customer_email?.toLowerCase();
        if (!email) continue;
        const existing = map.get(email);
        if (existing) {
          existing.total_orders += 1;
          existing.total_spent += Number((o as any).total_amount || 0);
          if (new Date((o as any).created_at) > new Date(existing.last_order_at)) {
            existing.last_order_at = (o as any).created_at;
            existing.customer_name = (o as any).customer_name ?? existing.customer_name;
          }
        } else {
          map.set(email, {
            email,
            customer_name: (o as any).customer_name ?? null,
            user_id: (o as any).user_id ?? null,
            total_orders: 1,
            total_spent: Number((o as any).total_amount || 0),
            last_order_at: (o as any).created_at,
            is_guest: !(o as any).user_id,
          });
        }
      }

      const list = [...map.values()].sort((a, b) => b.total_spent - a.total_spent);
      setRows(list);
    } catch (err) {
      console.error('Failed to load customers:', err);
      toast.error('Could not load customers');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase().trim();
    return rows.filter(
      (r) =>
        r.email.includes(q) || (r.customer_name?.toLowerCase().includes(q) ?? false),
    );
  }, [rows, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
          <Users className="h-7 w-7" /> Customers
        </h1>
        <p className="text-muted-foreground">
          Built from completed orders. Guests included.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Label className="text-xs">Search</Label>
          <Input
            placeholder="Email or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-right">Orders</th>
                <th className="p-3 text-right">Lifetime spend</th>
                <th className="p-3 text-left">Last order</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Loading customers…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No customers yet.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.email} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{c.customer_name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                        {c.is_guest && (
                          <Badge variant="outline" className="text-[10px]">guest</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">{c.total_orders}</td>
                    <td className="p-3 text-right font-medium">{formatPrice(c.total_spent)}</td>
                    <td className="p-3 whitespace-nowrap">
                      {new Date(c.last_order_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3">
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/admin/customers/${encodeURIComponent(c.email)}`} aria-label={`View customer ${c.email}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
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
