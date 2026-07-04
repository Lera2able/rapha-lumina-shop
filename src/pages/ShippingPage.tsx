import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageMeta from '@/components/common/PageMeta';

export default function ShippingPage() {
  return (
    <div className="min-h-screen">
      <PageMeta
        title="Shipping & Delivery | Rapha Lumina"
        description="Shipping rates, delivery times, and order tracking information for Rapha Lumina orders within South Africa."
      />
      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-balance">Shipping Information</h1>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">South Africa</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Flat rate shipping on orders under R700: R 70</li>
                    <li>• Free shipping on orders of R700 or more</li>
                    <li>• Delivery usually takes 3-7 business days after dispatch</li>
                    <li>• We currently ship within South Africa only</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Times</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-pretty">
              Orders are usually processed within 1-2 business days. Delivery times are calculated from the date of dispatch, not the date the order was placed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-pretty">
                Once your order ships, you will receive a tracking number via email. You can track your order status in your account dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
