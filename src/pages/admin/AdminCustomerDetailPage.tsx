import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface OrderSummary {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: any[];
}

interface CustomerSummary {
  email: string;
  name: string | null;
  user_id: string | null;
  total_orders: number;
  total_spent: number;
  first_order_at: string;
  last_order_at: string;
}

function statusVariant(s: string) {
  if (s === 'completed' || s === 'delivered') return 'default';
  if (s === 'shipped' || s === 'processing') return 'secondary';
  if (s === 'cancelled' || s === 'failed' || s === 'refunded') return 'destructive';
  return 'outline';
}

export default function AdminCustomerDetailPage() {
  const { email: emailParam } = useParams<{ email: string }>();
  const email = emailParam ? decodeURIComponent(emailParam).toLowerCase() : '';
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (email) load(email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const load = async (em: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, customer_name, customer_email, user_id, total_amount, items, created_at')
        .eq('customer_email', em)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const list = (data as any[]) ?? [];
      if (list.length === 0) {
        setSummary(null);
        setOrders([]);
        return;
      }

      const total_spent = list
        .filter((o) => ['completed', 'shipped', 'delivered'].includes(o.status))
        .reduce((s, o) => s + Number(o.total_amount), 0);

      setSummary({
        email: em,
        name: list[0].customer_name,
        user_id: list[0].user_id,
        total_orders: list.length,
        total_spent,
        first_order_at: list[list.length - 1].created_at,
        last_order_at: list[0].created_at,
      });
      setOrders(list);
    } catch (err) {
      console.error('Failed to load customer:', err);
      toast.error('Could not load customer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading customer…</p>;
  }

  if (!summary) {
    return (
      <div className="space-y-4">
        <Link to="/admin/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to customers
          </Button>
        </Link>
        <p className="text-muted-foreground">No customer found with that email.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/customers">
          <Button variant="ghost" size="sm" className="-ml-3 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to customers
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">{summary.name || summary.email}</h1>
          {!summary.user_id && (
            <Badge variant="outline" className="text-xs">guest</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{summary.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Lifetime spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(summary.total_spent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.total_orders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">First order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {new Date(summary.first_order_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order history</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Items</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const itemCount = Array.isArray(o.items)
                  ? o.items.reduce((s: number, it: any) => s + Number(it.quantity || 0), 0)
                  : 0;
                return (
                  <tr key={o.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3">{itemCount} item{itemCount === 1 ? '' : 's'}</td>
                    <td className="p-3">
                      <Badge variant={statusVariant(o.status) as any}>{o.status}</Badge>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatPrice(Number(o.total_amount))}
                    </td>
                    <td className="p-3">
                      <Link to={`/admin/orders/${o.id}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
