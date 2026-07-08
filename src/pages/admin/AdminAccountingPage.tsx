import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/db/supabase';
import { getEffectivePrice, normaliseProducts } from '@/lib/product';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/types';
import { Banknote, Boxes, CreditCard, Download, Package, ReceiptText, RefreshCw, Truck } from 'lucide-react';

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
  items: Array<{
    product_id?: string;
    quantity: number;
    price?: number;
    name?: string;
    size?: string;
  }> | null;
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
  estimatedCogs: number;
  estimatedGrossProfit: number;
  profitMargin: number;
  inventoryUnits: number;
  inventoryRetailValue: number;
  inventoryFullPriceValue: number;
  inventoryCostValue: number;
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadAccountingData();
  }, []);

  const loadAccountingData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, refundsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status, total_amount, shipping_cost, created_at, items')
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

      setOrders((ordersRes.data as AccountingOrder[]) ?? []);
      setProducts(normaliseProducts(productsRes.data));
      setRefunds((refundsRes.data as RefundRequest[]) ?? []);
    } catch (error) {
      console.error('Failed to load accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(order.created_at) > end) return false;
      }
      return true;
    });
  }, [orders, dateFrom, dateTo]);

  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      if (dateFrom && new Date(refund.created_at) < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(refund.created_at) > end) return false;
      }
      return true;
    });
  }, [refunds, dateFrom, dateTo]);

  const metrics = useMemo<AccountingMetrics>(() => {
    const activeOrders = filteredOrders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status));
    const grossRevenue = activeOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const shippingCollected = activeOrders.reduce((sum, order) => sum + Number(order.shipping_cost || 0), 0);
    const netMerchandiseRevenue = grossRevenue - shippingCollected;
    const pendingOrderValue = filteredOrders
      .filter((order) => order.status === 'pending')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const refundedOrderValue = filteredOrders
      .filter((order) => order.status === 'refunded')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const refundRequestValue = filteredRefunds
      .filter((refund) => refund.status !== 'rejected')
      .reduce((sum, refund) => sum + Number(refund.refund_amount || 0), 0);
    const productCostMap = new Map(products.map((product) => [product.id, Number(product.cost_price || 0)]));
    const estimatedCogs = activeOrders.reduce((sum, order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      return (
        sum +
        items.reduce((itemSum, item) => {
          const unitCost = item.product_id ? productCostMap.get(item.product_id) ?? 0 : 0;
          return itemSum + unitCost * Number(item.quantity || 0);
        }, 0)
      );
    }, 0);
    const estimatedGrossProfit = netMerchandiseRevenue - estimatedCogs;
    const profitMargin = netMerchandiseRevenue > 0 ? (estimatedGrossProfit / netMerchandiseRevenue) * 100 : 0;
    const inventoryUnits = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
    const inventoryRetailValue = products.reduce(
      (sum, product) => sum + getEffectivePrice(product) * Number(product.stock || 0),
      0,
    );
    const inventoryFullPriceValue = products.reduce(
      (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
      0,
    );
    const inventoryCostValue = products.reduce(
      (sum, product) => sum + Number(product.cost_price || 0) * Number(product.stock || 0),
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
      estimatedCogs,
      estimatedGrossProfit,
      profitMargin,
      inventoryUnits,
      inventoryRetailValue,
      inventoryFullPriceValue,
      inventoryCostValue,
    };
  }, [filteredOrders, filteredRefunds, products]);

  const statusRows = useMemo(() => {
    return FINANCIAL_ORDER_STATUSES.map((status) => {
      const matching = filteredOrders.filter((order) => order.status === status);
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
  }, [filteredOrders]);

  const collectionRows = useMemo(() => {
    const grouped = new Map<string, { units: number; retail: number; full: number; cost: number; count: number }>();

    for (const product of products) {
      const current = grouped.get(product.collection) ?? { units: 0, retail: 0, full: 0, cost: 0, count: 0 };
      current.units += Number(product.stock || 0);
      current.retail += getEffectivePrice(product) * Number(product.stock || 0);
      current.full += Number(product.price || 0) * Number(product.stock || 0);
      current.cost += Number(product.cost_price || 0) * Number(product.stock || 0);
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

    for (const order of filteredOrders.filter((entry) => ACTIVE_ORDER_STATUSES.includes(entry.status))) {
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
  }, [filteredOrders]);

  const exportAccountingCsv = () => {
    const lines: string[] = [];
    const pushRow = (row: Array<string | number>) => {
      lines.push(
        row
          .map((value) => {
            const text = String(value ?? '');
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(','),
      );
    };

    pushRow(['Summary metric', 'Value']);
    pushRow(['Gross sales', metrics.grossRevenue.toFixed(2)]);
    pushRow(['Shipping collected', metrics.shippingCollected.toFixed(2)]);
    pushRow(['Net merchandise sales', metrics.netMerchandiseRevenue.toFixed(2)]);
    pushRow(['Estimated COGS', metrics.estimatedCogs.toFixed(2)]);
    pushRow(['Estimated gross profit', metrics.estimatedGrossProfit.toFixed(2)]);
    pushRow(['Profit margin %', metrics.profitMargin.toFixed(2)]);
    pushRow(['Pending order value', metrics.pendingOrderValue.toFixed(2)]);
    pushRow(['Refunded order value', metrics.refundedOrderValue.toFixed(2)]);
    pushRow(['Refund pipeline', metrics.refundRequestValue.toFixed(2)]);
    pushRow(['Inventory units', metrics.inventoryUnits]);
    pushRow(['Inventory retail value', metrics.inventoryRetailValue.toFixed(2)]);
    pushRow(['Inventory full-price value', metrics.inventoryFullPriceValue.toFixed(2)]);
    pushRow(['Inventory cost value', metrics.inventoryCostValue.toFixed(2)]);
    lines.push('');

    pushRow(['Order status accounting']);
    pushRow(['Status', 'Orders', 'Gross', 'Shipping', 'Net']);
    statusRows.forEach((row) => pushRow([row.status, row.count, row.gross.toFixed(2), row.shipping.toFixed(2), row.net.toFixed(2)]));
    lines.push('');

    pushRow(['Inventory by collection']);
    pushRow(['Collection', 'Products', 'Units', 'Retail value', 'Full-price value', 'Cost value']);
    collectionRows.forEach((row) =>
      pushRow([row.collection, row.count, row.units, row.retail.toFixed(2), row.full.toFixed(2), row.cost.toFixed(2)]),
    );
    lines.push('');

    pushRow(['Monthly sales']);
    pushRow(['Month', 'Orders', 'Gross', 'Shipping', 'Net']);
    monthlyRows.forEach((row) => pushRow([row.month, row.orders, row.gross.toFixed(2), row.shipping.toFixed(2), row.net.toFixed(2)]));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapha-lumina-accounting.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

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

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <Button variant="outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                Clear range
              </Button>
              <Button variant="outline" onClick={loadAccountingData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportAccountingCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Date filters affect order and refund calculations. Inventory figures remain a current stock snapshot.
          </p>
        </CardContent>
      </Card>

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
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Estimated COGS</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(metrics.estimatedCogs)}</p>
            <p className="text-sm text-muted-foreground mt-1">Estimated using current product cost prices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Estimated gross profit</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(metrics.estimatedGrossProfit)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Margin {metrics.profitMargin.toFixed(1)}% after shipping deduction
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Inventory cost value</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(metrics.inventoryCostValue)}</p>
            <p className="text-sm text-muted-foreground mt-1">Estimated cost tied up in current stock</p>
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
                  <th className="p-3 text-right">Cost value</th>
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
                    <td className="p-3 text-right">{formatPrice(row.cost)}</td>
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
