import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageMeta from '@/components/common/PageMeta';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen">
      <PageMeta
        title="Returns & Exchanges | Rapha Lumina"
        description="Read Rapha Lumina's returns and exchange policy, including return conditions, refund timing, and how to start a return."
      />
      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-balance">Returns & Exchange Policy</h1>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Return Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-pretty">
                We want you to be completely satisfied with your purchase. If you're not happy with your order, you may return it within 30 days of delivery for a full refund or exchange.
              </p>
              <div>
                <h3 className="font-semibold mb-2">Conditions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Items must be unworn, unwashed, and in original condition with tags attached</li>
                  <li>• Items must be returned in original packaging</li>
                  <li>• Proof of purchase required</li>
                  <li>• Sale items are final sale and cannot be returned</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exchange Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-pretty">
                We're happy to exchange items for a different size or color. Exchanges are subject to availability. If the item you want is not available, we'll issue a full refund.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Return</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Contact our support team at support@raphalumina.com</li>
                <li>Include your order number and reason for return</li>
                <li>We'll provide you with return instructions and a return label</li>
                <li>Pack your items securely and ship them back to us</li>
                <li>Refunds will be processed within 5-7 business days of receiving your return</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refund Method</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-pretty">
                Refunds will be issued to the original payment method. Please allow 5-10 business days for the refund to appear in your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
