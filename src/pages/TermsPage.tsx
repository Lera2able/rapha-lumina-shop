import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import PageMeta from '@/components/common/PageMeta';

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12">
      <PageMeta
        title="Terms & Conditions | Rapha Lumina"
        description="Review the Rapha Lumina terms and conditions for orders, payments, shipping, returns, and customer responsibilities."
      />
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 text-primary text-center">
          Terms and Conditions
        </h1>
        <p className="text-sm text-center text-muted-foreground mb-8">
          Last updated: 24 May 2026
        </p>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">About these terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              These terms set out the agreement between you and Rapha Lumina (Pty) Ltd
              when you buy something on raphalumina.com. By placing an order with us
              you agree to be bound by these terms, so please take a moment to read
              them.
            </p>
            <p className="text-pretty">
              We have tried to keep the language plain and the terms fair. If anything
              is unclear, email us at{' '}
              <a href="mailto:support@raphalumina.com" className="text-primary underline">
                support@raphalumina.com
              </a>{' '}
              before you order.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Who we are</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-foreground/90">
            <p className="text-pretty">Rapha Lumina (Pty) Ltd</p>
            <p className="text-pretty">Registration number: 2024/620336/07</p>
            <p className="text-pretty">28 Heide Street, Highveld Park, Witbank, 1034</p>
            <p className="text-pretty">Phone: 079 333 0455</p>
            <p className="text-pretty">
              Email:{' '}
              <a href="mailto:support@raphalumina.com" className="text-primary underline">
                support@raphalumina.com
              </a>
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              You must be at least 18 years old to place an order with us, or have
              the permission of a parent or legal guardian who is able to enter into
              a binding contract on your behalf.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Prices and currency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              All prices are shown in South African Rand (ZAR) and include any
              applicable taxes. Shipping is charged separately and shown at checkout.
              We charge a flat shipping rate of R70 within South Africa, and shipping
              is free on orders of R700 or more.
            </p>
            <p className="text-pretty">
              We try our best to keep all prices accurate, but mistakes do happen. If
              we discover a pricing error after you have placed an order, we will
              contact you to confirm whether you still wish to proceed at the
              corrected price, or to cancel the order with a full refund.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Placing an order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              When you submit an order on the site, you are making us an offer to buy
              the products in your basket. We accept your offer once we send you an
              order confirmation email. Until then, no contract exists between us.
            </p>
            <p className="text-pretty">
              We reserve the right to refuse or cancel any order, for example if a
              product is out of stock, if there has been a pricing error, or if we
              suspect the order is fraudulent. If we cancel an order after payment,
              we will refund you in full.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              Payments are processed through Paystack. We accept the cards and payment
              methods supported by Paystack at the time of your purchase. Your card
              details are entered on Paystack's secure checkout page and are never
              stored by us.
            </p>
            <p className="text-pretty">
              Your order will only be processed once payment has been successfully
              received. If payment fails, your order will be marked as failed and no
              charge will be made.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Shipping and delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              We ship within South Africa. Once your order has shipped you will
              receive an email with a tracking number. Delivery times vary by area
              but we aim to dispatch within 2-3 working days of payment.
            </p>
            <p className="text-pretty">
              Risk in the goods passes to you on delivery. If your parcel does not
              arrive within a reasonable time after the courier marks it dispatched,
              please contact us.
            </p>
            <p className="text-pretty">
              For more detail see our{' '}
              <Link to="/shipping" className="text-primary underline">Shipping page</Link>.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Your right to cancel (cooling-off)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              Section 44 of the Consumer Protection Act gives you the right to cancel
              your order without penalty within 7 working days of receiving it,
              provided the goods are in their original condition and packaging.
            </p>
            <p className="text-pretty">
              You bear the cost of returning the goods. Once we receive the returned
              items in good condition we will refund the purchase price within 30
              days.
            </p>
            <p className="text-pretty">
              The cooling-off right does not apply to goods that have been
              personalised for you or that may deteriorate quickly.
            </p>
            <p className="text-pretty">
              For full details on returns and refunds see our{' '}
              <Link to="/returns" className="text-primary underline">Returns page</Link>{' '}
              and{' '}
              <Link to="/refund-policy" className="text-primary underline">
                Refund Policy
              </Link>.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Defective or wrong items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              If you receive a damaged, defective, or incorrect item, please email us
              within 7 days of delivery with photos and your order number. We will
              arrange a replacement or a refund at our cost, in line with the
              Consumer Protection Act.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Limitation of liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              Nothing in these terms limits or excludes any rights you have under
              the Consumer Protection Act or any other law that cannot be excluded
              by agreement.
            </p>
            <p className="text-pretty">
              Subject to that, we are not liable for any indirect or consequential
              loss arising out of your use of the site or our products, and our
              total liability for any single order will not exceed the amount you
              paid for it.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Intellectual property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              The Rapha Lumina name, logo, designs, product photography and all
              other content on the site belong to Rapha Lumina (Pty) Ltd. You may
              not copy, reproduce or use any of it for commercial purposes without
              our written permission.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              Your privacy matters to us. How we handle your personal information is
              set out in our{' '}
              <Link to="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>
              , which forms part of these terms.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Governing law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              These terms are governed by the laws of the Republic of South Africa.
              Any dispute that cannot be resolved between us will be subject to the
              jurisdiction of the South African courts.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Changes to these terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <p className="text-pretty">
              We may update these terms from time to time. The "Last updated" date
              at the top of the page tells you when the current version was
              published. The terms that apply to your order are the ones in force at
              the time you place it.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
