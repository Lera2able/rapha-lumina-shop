import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageMeta from '@/components/common/PageMeta';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen py-12">
      <PageMeta
        title="Refund Policy | Rapha Lumina"
        description="Review Rapha Lumina's refund and cancellation policy, including eligibility, timelines, and the refund request process."
      />
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-primary text-center">
          Refund & Cancellation Policy
        </h1>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Our Commitment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p className="text-pretty">
              At Rapha Lumina, we want you to be completely satisfied with your purchase. 
              If you're not happy with your order, we're here to help with our straightforward 
              refund and cancellation policy.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Cancellation Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <div>
              <h3 className="font-semibold text-lg mb-2">Before Shipment</h3>
              <p className="text-pretty">
                You may cancel your order at no charge within 24 hours of placing it, 
                provided it has not yet been shipped. To cancel, please contact us immediately 
                through your account dashboard or email us at orders@raphalumina.com.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">After Shipment</h3>
              <p className="text-pretty">
                Once your order has been shipped, it cannot be cancelled. However, you may 
                return the items following our return policy below.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Refund Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p className="text-pretty">
              We accept refund requests under the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Items must be returned within 14 days of delivery</li>
              <li>Products must be unused, unworn, and in original condition</li>
              <li>All original tags and packaging must be intact</li>
              <li>Items must not show signs of wear or damage</li>
              <li>Proof of purchase (order number) must be provided</li>
            </ul>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <h4 className="font-semibold mb-2">Non-Refundable Items:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>Personalized or custom-made products</li>
                <li>Items marked as final sale or clearance</li>
                <li>Products damaged due to misuse or negligence</li>
                <li>Items without original packaging or tags</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Refund Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <div>
              <h3 className="font-semibold text-lg mb-2">Step 1: Submit Request</h3>
              <p className="text-pretty">
                Log in to your account and navigate to your order history. Click on the order 
                you wish to return and select "Request Refund". Fill out the refund form with 
                your reason for return.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Step 2: Approval</h3>
              <p className="text-pretty">
                Our team will review your request within 2-3 business days. You'll receive 
                an email notification with approval status and return instructions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Step 3: Return Shipping</h3>
              <p className="text-pretty">
                Once approved, ship the items back to us using the provided return address. 
                We recommend using a trackable shipping service. Return shipping costs are 
                the responsibility of the customer unless the item is defective or incorrect.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Step 4: Inspection & Processing</h3>
              <p className="text-pretty">
                Upon receiving your return, we'll inspect the items to ensure they meet our 
                refund criteria. This process typically takes 3-5 business days.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Step 5: Refund Issued</h3>
              <p className="text-pretty">
                If approved, your refund will be processed to your original payment method 
                within 5-10 business days. You'll receive a confirmation email once the 
                refund has been issued.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Defective or Incorrect Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p className="text-pretty">
              If you receive a defective, damaged, or incorrect item, please contact us 
              immediately at support@raphalumina.com with photos of the issue. We will:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide a prepaid return shipping label</li>
              <li>Process your refund or replacement immediately upon receipt</li>
              <li>Cover all return shipping costs</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Exchanges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p className="text-pretty">
              We currently do not offer direct exchanges. If you need a different size or 
              product, please request a refund for the original item and place a new order 
              for the desired product.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Partial Refunds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p className="text-pretty">
              In certain situations, partial refunds may be granted:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Items with obvious signs of use</li>
              <li>Items returned more than 14 days after delivery</li>
              <li>Items missing original packaging or tags</li>
            </ul>
            <p className="text-pretty mt-4">
              The refund amount will be determined based on the condition of the returned item.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p className="text-pretty">
              If you have any questions about our refund or cancellation policy, please 
              don't hesitate to reach out:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> support@raphalumina.com</p>
              <p><strong>Phone:</strong> +27 (0) 123 456 789</p>
              <p><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM SAST</p>
            </div>
            <p className="text-pretty mt-4 text-sm text-muted-foreground">
              This policy was last updated on May 9, 2026. We reserve the right to modify 
              this policy at any time. Changes will be effective immediately upon posting 
              to our website.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
