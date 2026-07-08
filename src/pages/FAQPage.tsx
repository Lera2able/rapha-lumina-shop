import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Phone, MapPin, Package, CreditCard, RefreshCw, Shield, Truck } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <PageMeta
        title="FAQ | Rapha Lumina"
        description="Answers about shipping, returns, payment, sizing, and shopping with Rapha Lumina."
        canonicalPath="/faq"
        ogImage="https://raphalumina.com/og-support.svg"
        ogImageAlt="Rapha Lumina FAQ social preview card"
      />
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Everything you need to know about shopping with Rapha Lumina
            </p>
          </div>

          {/* Quick Contact Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Need More Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href="mailto:support@raphalumina.com" className="text-primary hover:underline">
                  support@raphalumina.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Available Monday - Friday, 9am - 5pm SAST</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Based in South Africa, shipping nationwide</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="shipping-cost">
                  <AccordionTrigger>What are the shipping costs?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    We offer <strong className="text-foreground">FREE shipping</strong> on all orders of <strong className="text-foreground">R700</strong> or more. For orders under R700, a flat rate of <strong className="text-foreground">R70</strong> applies within South Africa.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping-time">
                  <AccordionTrigger>How long does shipping take?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Standard shipping within South Africa typically takes 3-7 business days after dispatch. You will receive a tracking number via email once your order ships. Please allow 1-2 business days for order processing before shipment.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tracking">
                  <AccordionTrigger>How can I track my order?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Once your order ships, you'll receive an email with your tracking number. You can use this number to track your package with our courier partner. If you have an account, you can also view your order status in the "My Account" section.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="international">
                  <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Currently, we ship within South Africa only. We're working on expanding our shipping to other countries soon. Sign up for our newsletter to be notified when international shipping becomes available.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Returns & Exchanges */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Returns & Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="return-policy">
                  <AccordionTrigger>What is your return policy?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    We accept return requests within <strong className="text-foreground">14 days</strong> of delivery. Items must be unworn, unwashed, and in original condition with all tags attached. Final-sale and personalized items are not eligible for return. To begin a return, email support@raphalumina.com with your order number.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="exchange">
                  <AccordionTrigger>Can I exchange an item?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Yes, size exchanges are possible if stock is available. Please contact us within 14 days of receiving your order. If the replacement item is unavailable, we will refund the returned item instead.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="refund">
                  <AccordionTrigger>How long do refunds take?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Once we receive your returned item, we'll inspect it and process your refund within 5-7 business days. The refund will be credited to your original payment method. Please allow an additional 5-10 business days for the refund to appear in your account.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="damaged">
                  <AccordionTrigger>What if my item arrives damaged?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Please contact us within 7 days at support@raphalumina.com with photos of the issue and your order number. If the item is damaged, defective, or incorrect, we will arrange a replacement or refund and cover the return shipping where applicable.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Payment & Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="payment-methods">
                  <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure payment partner, Paystack. We also accept instant EFT and mobile money payments. All transactions are encrypted and secure.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="security">
                  <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Absolutely! We use <strong className="text-foreground">Paystack</strong>, a PCI-DSS compliant payment processor, to handle all transactions. Your payment information is encrypted and never stored on our servers. We take your security seriously and use industry-standard SSL encryption throughout our site.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="guest-checkout">
                  <AccordionTrigger>Can I checkout without creating an account?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Yes! We offer guest checkout for your convenience. Simply add items to your cart and proceed to checkout. You can complete your purchase without creating an account. However, creating an account allows you to track orders, save addresses, and view order history.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Products & Care */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Products & Care
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sizing">
                  <AccordionTrigger>How do I choose the right size?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Each product page includes detailed size information. Our apparel generally runs true to size. If you're between sizes, we recommend sizing up for a more relaxed fit. If you need help choosing a size, please contact us and we'll be happy to assist.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="care">
                  <AccordionTrigger>How should I care for my items?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Care instructions are included with each item. Generally, we recommend washing apparel in cold water and hanging to dry to preserve the quality and longevity of the fabric and prints. Avoid bleach and harsh detergents. For accessories, wipe clean with a soft cloth.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="restock">
                  <AccordionTrigger>When will out-of-stock items be restocked?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    Restock times vary by product. If an item you want is out of stock, please sign up for our newsletter or contact us at support@raphalumina.com to be notified when it becomes available again. We're constantly working to keep our most popular items in stock.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="materials">
                  <AccordionTrigger>What materials are your products made from?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    We prioritize quality and comfort in all our products. Our apparel is made from premium cotton blends and sustainable materials. Specific material information is listed on each product page. We're committed to conscious creation and ethical sourcing.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Account & Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account & Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="account">
                  <AccordionTrigger>Do I need an account to shop?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    No, you can checkout as a guest. However, creating an account offers benefits like order tracking, saved addresses, order history, and faster checkout for future purchases. It's free and takes just a minute to set up.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="order-history">
                  <AccordionTrigger>How can I view my order history?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    If you have an account, simply log in and go to "My Account" to view all your past orders, track current shipments, and access order details. Guest orders can be tracked using the tracking number sent to your email.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cancel">
                  <AccordionTrigger>Can I cancel or modify my order?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    If you need to cancel or modify your order, please contact us immediately at support@raphalumina.com. If your order hasn't been processed yet, we'll do our best to accommodate your request. Once an order has shipped, you'll need to follow our return process.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="newsletter">
                  <AccordionTrigger>How do I sign up for your newsletter?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">
                    You can sign up for our newsletter at checkout or by entering your email in the footer of any page. Newsletter subscribers receive exclusive updates, special offers, new product announcements, and spiritual insights. We respect your privacy and won't spam you.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Still Have Questions */}
          <div className="mt-12 text-center p-8 bg-muted/30 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6 text-pretty">
              We're here to help! Reach out to us and we'll get back to you as soon as possible.
            </p>
            <a href="mailto:support@raphalumina.com">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
