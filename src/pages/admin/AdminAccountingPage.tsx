import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/db/supabase';
import { getEffectivePrice } from '@/lib/product';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/types';
import { Banknote, Boxes, CreditCard, Package, ReceiptText, Truck } from 'lucide-react';

type AccountingOrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'failed'
  | 'refund_requested'
  | 'refunded';

interface AccountingOrder {
  id: string;
  status: AccountingOrderStatus;
  total_amount: number;
  shipping_cost: number | null;
  created_at: string;
}

interface RefundRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  refund_amount: number;
  created_at: string;
}

interface AccountingMetrics {
  grossRevenue: number;
  shippingCollected: number;
  netMerchandiseRevenue: number;
  activeOrderCount: number;
  pendingOrderValue: number;
  refundedOrderValue: number;
  refundRequestValue: number;
  inventoryUnits: number;
  inventoryRetailValue: number;
  inventoryFullPriceValue: number;
}

const ACTIVE_ORDER_STATUSES: AccountingOrderStatus[] = ['processing', 'shipped', 'delivered', 'completed'];
const FINANCIAL_ORDER_STATUSES: AccountingOrderStatus[] = [
  'pending',
  'processing',
  'completed',
  'shipped',
  'delivered',
  'cancelled',
  'failed',
  'refund_requested',
  'refunded',
];

function statusVariant(status: string) {
  if (status === 'completed' || status === 'delivered' || status === 'processed') return 'default';
  if (status === 'processing' || status === 'shipped' || status === 'approved') return 'secondary';
  if (status === 'pending' || status === 'refund_requested') return 'outline';
  return 'destructive';
}

export default function AdminAccountingPage() {
  const [orders, setOrders] = useState<AccountingOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountingData();
  }, []);

  const loadAccountingData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, refundsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status, total_amount, shipping_cost, created_at')
          .in('status', FINANCIAL_ORDER_STATUSES)
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('*')
          .order('collection', { ascending: true }),
        supabase
          .from('refund_requests')
          .select('id, status, refund_amount, created_at')
          .order('created_at', { ascending: false }),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (refundsRes.error) throw refundsRes.error;

      const { normaliseProducts } = await import('@/lib/product');
      setOrders((ordersRes.data as AccountingOrder[]) ?? []);
      setProducts(normaliseProducts(productsRes.data));
      setRefunds((refundsRes.data as RefundRequest[]) ?? []);
    } catch (error) {
      console.error('Failed to load accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo<AccountingMetrics>(() => {
    const activeOrders = orders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status));
    const grossRevenue = activeOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const shippingCollected = activeOrders.reduce((sum, order) => sum + Number(order.shipping_cost || 0), 0);
    const netMerchandiseRevenue = grossRevenue - shippingCollected;
    const pendingOrderValue = orders
      .filter((order) => order.status === 'pending')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const refundedOrderValue = orders
      .filter((order) => order.status === 'refunded')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const refundRequestValue = refunds
      .filter((refund) => refund.status !== 'rejected')
      .reduce((sum, refund) => sum + Number(refund.refund_amount || 0), 0);
    const inventoryUnits = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
    const inventoryRetailValue = products.reduce(
      (sum, product) => sum + getEffectivePrice(product) * Number(product.stock || 0),
      0,
    );
    const inventoryFullPriceValue = products.reduce(
      (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
      0,
    );

    return {
      grossRevenue,
      shippingCollected,
      netMerchandiseRevenue,
      activeOrderCount: activeOrders.length,
      pendingOrderValue,
      refundedOrderValue,
      refundRequestValue,
      inventoryUnits,
      inventoryRetailValue,
      inventoryFullPriceValue,
    };
  }, [orders, products, refunds]);

  const statusRows = useMemo(() => {
    return FINANCIAL_ORDER_STATUSES.map((status) => {
      const matching = orders.filter((order) => order.status === status);
      const gross = matching.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
      const shipping = matching.reduce((sum, order) => sum + Number(order.shipping_cost || 0), 0);
      return {
        status,
        count: matching.length,
        gross,
        shipping,
        net: gross - shipping,
      };
    }).filter((row) => row.count > 0);
  }, [orders]);

  const collectionRows = useMemo(() => {
    const grouped = new Map<string, { units: number; retail: number; full: number; count: number }>();

    for (const product of products) {
      const current = grouped.get(product.collection) ?? { units: 0, retail: 0, full: 0, count: 0 };
      current.units += Number(product.stock || 0);
      current.retail += getEffectivePrice(product) * Number(product.stock || 0);
      current.full += Number(product.price || 0) * Number(product.stock || 0);
      current.count += 1;
      grouped.set(product.collection, current);
    }

    return [...grouped.entries()].map(([collection, value]) => ({
      collection,
      ...value,
    }));
  }, [products]);

  const monthlyRows = useMemo(() => {
    const grouped = new Map<string, { orders: number; gross: number; shipping: number }>();

    for (const order of orders.filter((entry) => ACTIVE_ORDER_STATUSES.includes(entry.status))) {
      const date = new Date(order.created_at);
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const current = grouped.get(key) ?? { orders: 0, gross: 0, shipping: 0 };
      current.orders += 1;
      current.gross += Number(order.total_amount || 0);
      current.shipping += Number(order.shipping_cost || 0);
      grouped.set(key, current);
    }

    return [...grouped.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([key, value]) => ({
        month: new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric',
        }),
        orders: value.orders,
        gross: value.gross,
        shipping: value.shipping,
        net: value.gross - value.shipping,
      }));
  }, [orders]);

  if (loading) {
    return <p className="text-muted-foreground">Loading accounting…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Accounting</h1>
        <p className="text-muted-foreground">
          Financial totals, shipping deductions, inventory value, and order-status accounting in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross sales</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.grossRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Processing, shipped, delivered, and completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shipping collected</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.shippingCollected)}</div>
            <p className="text-xs text-muted-foreground mt-1">Deduct this from gross to isolate merchandise sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net merchandise sales</CardTitle>
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.netMerchandiseRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Gross sales less shipping collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory retail value</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.inventoryRetailValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{metrics.inventoryUnits} units currently in stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Active orders</p>
            <p className="text-2xl font-bold mt-2">{metrics.activeOrderCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Orders contributing to active sales totals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Pending order value</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(metrics.pendingOrderValue)}</p>
            <p className="text-sm text-muted-foreground mt-1">Orders not yet financially recognised</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Refunded order value</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(metrics.refundedOrderValue)}</p>
            <p className="text-sm text-muted-foreground mt-1">Orders already marked refunded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Refund pipeline</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(metrics.refundRequestValue)}</p>
            <p className="text-sm text-muted-foreground mt-1">Pending, approved, and processed refund requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Order status accounting
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Orders</th>
                  <th className="p-3 text-right">Gross</th>
                  <th className="p-3 text-right">Shipping</th>
                  <th className="p-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {statusRows.map((row) => (
                  <tr key={row.status} className="border-b">
                    <td className="p-3">
                      <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                    </td>
                    <td className="p-3 text-right">{row.count}</td>
                    <td className="p-3 text-right">{formatPrice(row.gross)}</td>
                    <td className="p-3 text-right">{formatPrice(row.shipping)}</td>
                    <td className="p-3 text-right font-medium">{formatPrice(row.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Inventory by collection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="p-3 text-left">Collection</th>
                  <th className="p-3 text-right">Products</th>
                  <th className="p-3 text-right">Units</th>
                  <th className="p-3 text-right">Retail value</th>
                  <th className="p-3 text-right">Full-price value</th>
                </tr>
              </thead>
              <tbody>
                {collectionRows.map((row) => (
                  <tr key={row.collection} className="border-b">
                    <td className="p-3 capitalize">{row.collection}</td>
                    <td className="p-3 text-right">{row.count}</td>
                    <td className="p-3 text-right">{row.units}</td>
                    <td className="p-3 text-right">{formatPrice(row.retail)}</td>
                    <td className="p-3 text-right">{formatPrice(row.full)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent monthly sales view</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-right">Orders</th>
                <th className="p-3 text-right">Gross sales</th>
                <th className="p-3 text-right">Shipping</th>
                <th className="p-3 text-right">Net merchandise</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No financially recognised orders yet.
                  </td>
                </tr>
              ) : (
                monthlyRows.map((row) => (
                  <tr key={row.month} className="border-b">
                    <td className="p-3">{row.month}</td>
                    <td className="p-3 text-right">{row.orders}</td>
                    <td className="p-3 text-right">{formatPrice(row.gross)}</td>
                    <td className="p-3 text-right">{formatPrice(row.shipping)}</td>
                    <td className="p-3 text-right font-medium">{formatPrice(row.net)}</td>
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
