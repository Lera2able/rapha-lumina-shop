import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShippingPage() {
  return (
    <div className="min-h-screen">
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
                    <li>• Standard Delivery (5-7 business days): R 80</li>
                    <li>• Express Delivery (2-3 business days): R 150</li>
                    <li>• Free shipping on orders over R 1000</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">International</h3>
                  <p className="text-sm text-muted-foreground text-pretty">
                    International shipping rates vary by destination and weight. Rates will be calculated at checkout.
                  </p>
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
                Orders are processed within 1-2 business days. Delivery times are calculated from the date of shipment, not the date of order placement.
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
