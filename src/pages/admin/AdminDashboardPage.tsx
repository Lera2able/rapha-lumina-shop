import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { formatPrice } from '@/lib/utils';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface DashboardMetrics {
  monthRevenue: number;
  monthOrderCount: number;
  averageOrderValue: number;
  totalCustomers: number;
  lowStockProducts: { id: string; name: string; stock: number }[];
  topProduct: { name: string; quantity: number; revenue: number } | null;
  recentOrders: {
    id: string;
    customer_name: string | null;
    customer_email: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: {
      name: string;
      quantity: number;
      image_url?: string;
    }[] | null;
  }[];
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      // First of current month, in UTC. Close enough — we're not doing tax filings off this.
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const monthStartIso = monthStart.toISOString();

      const [monthOrdersRes, customerCountRes, lowStockRes, recentOrdersRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, total_amount, items')
          .in('status', ['processing', 'shipped', 'delivered', 'completed'])
          .gte('created_at', monthStartIso),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('products')
          .select('id, name, stock')
          .lt('stock', 5)
          .order('stock', { ascending: true }),
        supabase
          .from('orders')
          .select('id, customer_name, customer_email, total_amount, status, created_at, items')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const monthOrders = monthOrdersRes.data ?? [];
      const monthRevenue = monthOrders.reduce(
        (sum, o) => sum + Number(o.total_amount || 0),
        0,
      );
      const monthOrderCount = monthOrders.length;
      const averageOrderValue = monthOrderCount > 0 ? monthRevenue / monthOrderCount : 0;

      // Top product: aggregate items across completed orders this month
      const productTotals = new Map<string, { name: string; quantity: number; revenue: number }>();
      for (const order of monthOrders) {
        const items = (order as any).items as any[] | null;
        if (!Array.isArray(items)) continue;
        for (const item of items) {
          if (!item?.name) continue;
          const key = item.product_id ?? item.name;
          const existing = productTotals.get(key) ?? {
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
          existing.quantity += Number(item.quantity || 0);
          existing.revenue += Number(item.line_total ?? item.price * item.quantity ?? 0);
          productTotals.set(key, existing);
        }
      }
      const topProduct =
        [...productTotals.values()].sort((a, b) => b.quantity - a.quantity)[0] ?? null;

      setMetrics({
        monthRevenue,
        monthOrderCount,
        averageOrderValue,
        totalCustomers: customerCountRes.count ?? 0,
        lowStockProducts: lowStockRes.data ?? [],
        topProduct,
        recentOrders: recentOrdersRes.data ?? [],
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading dashboard…</p>;
  }

  if (!metrics) {
    return <p className="text-muted-foreground">Could not load dashboard.</p>;
  }

  const monthLabel = new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Overview for {monthLabel}</p>
      </div>

      {/* Top metric tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue ({monthLabel.split(' ')[0]})
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.monthRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed orders only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthOrderCount}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg order value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered profiles</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low stock */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Low stock
              </CardTitle>
              <Link to="/admin/products" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Everything's well stocked. Nice.
              </p>
            ) : (
              metrics.lowStockProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/admin/products/${p.id}/edit`}
                  className="flex items-center justify-between text-sm hover:bg-muted/50 -mx-2 px-2 py-1 rounded"
                >
                  <span className="truncate flex-1 mr-2">{p.name}</span>
                  <Badge variant={p.stock === 0 ? 'destructive' : 'outline'}>
                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top product */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Top product this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topProduct ? (
              <div className="space-y-2">
                <p className="font-medium">{metrics.topProduct.name}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{metrics.topProduct.quantity} sold</span>
                  <span>{formatPrice(metrics.topProduct.revenue)} revenue</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No sales yet this month.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent orders</CardTitle>
              <Link to="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              metrics.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  to={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:bg-muted/50 -mx-2 px-2 py-2 rounded"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {o.items?.[0]?.image_url ? (
                      <img
                        src={o.items[0].image_url}
                        alt={o.items[0].name}
                        className="h-10 w-10 rounded-md border object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                        Item
                      </div>
                    )}
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="truncate font-medium">{o.customer_name || o.customer_email}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {o.items?.[0]?.name ?? 'No item details'}
                        {o.items && o.items.length > 1 ? ` · +${o.items.length - 1} more` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(Number(o.total_amount))}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {o.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
