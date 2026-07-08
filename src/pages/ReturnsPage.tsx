import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageMeta from '@/components/common/PageMeta';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen">
      <PageMeta
        title="Returns & Exchanges | Rapha Lumina"
        description="Read Rapha Lumina's returns and exchange policy, including return conditions, refund timing, and how to start a return."
        canonicalPath="/returns"
        ogImage="https://raphalumina.com/og-support.svg"
        ogImageAlt="Rapha Lumina returns social preview card"
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
                We want you to feel confident shopping with Rapha Lumina. If something is not right, you may request a return within 14 days of delivery.
              </p>
              <div>
                <h3 className="font-semibold mb-2">Conditions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Items must be unworn, unwashed, and in original condition with tags attached</li>
                  <li>• Items must be returned in original packaging</li>
                  <li>• Proof of purchase required</li>
                  <li>• Final-sale, clearance, personalized, and worn items cannot be returned</li>
                  <li>• Return shipping for change-of-mind returns is the customer’s responsibility</li>
                  <li>• Original shipping charges are not refunded once an order has shipped</li>
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
                If you need a different size, please email us within 14 days of delivery. Exchanges are subject to stock availability. If the replacement item is unavailable, we will process a refund once the original item is returned and approved.
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
                <li>Wait for return approval and instructions before sending the parcel back</li>
                <li>Pack your items securely and use a trackable courier service if you are arranging the return</li>
                <li>Once received and approved, refunds are processed within 5-7 business days</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Damaged or Incorrect Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-pretty">
                If your order arrives damaged, defective, or incorrect, please email support@raphalumina.com within 7 days of delivery with your order number and clear photos. In these cases, we will arrange a replacement or refund and cover the return shipping where applicable.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
