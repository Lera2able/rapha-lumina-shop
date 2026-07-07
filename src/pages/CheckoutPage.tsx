import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import PageMeta from '@/components/common/PageMeta';
import { toast } from 'sonner';
import type { ShippingAddress } from '@/types/types';
import { AlertTriangle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, grandTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [testingNoticeOpen, setTestingNoticeOpen] = useState(true);
  const [confirmEmail, setConfirmEmail] = useState(user?.email || '');
  const [confirmDetails, setConfirmDetails] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    email: user?.email || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'South Africa',
    phone: '',
  });

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateCustomerDetails = () => {
    const email = shippingAddress.email.trim().toLowerCase();
    const emailConfirm = confirmEmail.trim().toLowerCase();
    const phoneDigits = shippingAddress.phone.replace(/\D/g, '');
    const postalCode = shippingAddress.postal_code.trim();

    if (!shippingAddress.name.trim() || shippingAddress.name.trim().length < 4) {
      return 'Please enter the customer’s full name.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address.';
    }

    if (email !== emailConfirm) {
      return 'Email address and confirmation email must match.';
    }

    if (phoneDigits.length < 10) {
      return 'Please enter a valid phone number so delivery can reach the customer.';
    }

    if (shippingAddress.address_line1.trim().length < 8) {
      return 'Please enter a fuller street address.';
    }

    if (shippingAddress.city.trim().length < 2 || shippingAddress.state.trim().length < 2) {
      return 'Please enter a valid city and province/state.';
    }

    if (!/^[A-Za-z0-9 -]{4,10}$/.test(postalCode)) {
      return 'Please enter a valid postal code.';
    }

    if (!confirmDetails) {
      return 'Please confirm that the customer details are accurate before proceeding.';
    }

    return null;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateCustomerDetails();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      // Validate stock before proceeding
      const productIds = items.map(i => i.product_id);
      const { data: freshProducts } = await supabase
        .from('products')
        .select('id, stock, name')
        .in('id', productIds);

      for (const item of items) {
        const fresh = freshProducts?.find(p => p.id === item.product_id);
        if (!fresh || fresh.stock < item.quantity) {
          toast.error(`Sorry, "${item.product.name}" is no longer available in that quantity`);
          setLoading(false);
          return;
        }
      }

      // Subscribe to newsletter if checkbox is checked
      if (subscribeNewsletter && shippingAddress.email) {
        try {
          await supabase.rpc('subscribe_newsletter', {
            p_email: shippingAddress.email,
          });
          // Fire and forget the welcome email — don't block checkout if it fails
          supabase.functions
            .invoke('send_newsletter_welcome', {
              body: { email: shippingAddress.email },
            })
            .catch((welcomeErr) => console.error('Welcome email error:', welcomeErr));
        } catch (newsletterError) {
          // Don't block checkout if newsletter subscription fails
          console.error('Newsletter subscription error:', newsletterError);
        }
      }

      // Format items for Paystack
      const orderItems = items.map(item => ({
        name: item.product.name,
        price: Number(item.product.price),
        quantity: item.quantity,
        image_url: item.product.image_url || '',
        product_id: item.product_id,
        size: item.size || '',
      }));

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const userId = session?.user?.id ?? null;

      // Call Supabase Edge Function (checkout-v2)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/checkout-v2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            items: orderItems,
            email: shippingAddress.email.trim().toLowerCase(),
            currency: 'ZAR',
            shippingAddress: {
              ...shippingAddress,
              email: shippingAddress.email.trim().toLowerCase(),
              phone: shippingAddress.phone.trim(),
              postal_code: shippingAddress.postal_code.trim(),
            },
            shippingCost: shippingCost,
            userId,
          }),
        }
      );

      const data = await response.json();
      const error = !response.ok ? data : null;

      if (error) {
        console.error('Checkout error:', error);
        const errorMessage =
          (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
            ? error.message
            : null) || 'Failed to create checkout session';
        toast.error(errorMessage);
        return;
      }

      const authUrl = data?.data?.authorization_url || data?.authorization_url;
      
      if (authUrl) {
        window.location.href = authUrl;
        toast.success('Redirecting to payment...');
      } else {
        console.error('No authorization URL in response');
        toast.error('Failed to get checkout URL');
      }
    } catch (err) {
      console.error('Checkout exception:', err);
      toast.error('An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const freeShippingRemaining = subtotal < 700 ? 700 - subtotal : 0;

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Checkout | Rapha Lumina"
        description="Complete your Rapha Lumina order with secure checkout, shipping details, and payment confirmation."
        canonicalPath="/checkout"
        ogImage="https://raphalumina.com/og-support.svg"
        ogImageAlt="Rapha Lumina checkout social preview card"
        robots="noindex,nofollow"
      />
      <Dialog open={testingNoticeOpen} onOpenChange={setTestingNoticeOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Testing mode notice
            </DialogTitle>
            <DialogDescription className="pt-2">
              This website is not live yet. Checkout is currently in testing mode, so please do not treat this as a live customer order flow.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Use test payment details only, and double-check every customer detail before completing a test order.
          </div>
          <DialogFooter>
            <Button onClick={() => setTestingNoticeOpen(false)}>I understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="container py-8">
        <div className="flex flex-col gap-3 mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground mt-2">
              Your stock is checked again before payment, and you’ll receive order confirmation by email.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/cart">Back to Cart</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-900">Testing mode</p>
                    <p className="text-sm text-amber-800 mt-1">
                      This checkout is still in testing. Use test payments only and verify every customer detail carefully before submitting.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={shippingAddress.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Order confirmation and shipping updates will be sent here.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirm-email">Confirm Email Address *</Label>
                    <Input
                      id="confirm-email"
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="e.g. 0821234567"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Needed in case delivery needs to confirm directions or availability.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="address1">Address Line 1 *</Label>
                    <Input
                      id="address1"
                      value={shippingAddress.address_line1}
                      onChange={(e) => handleInputChange('address_line1', e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Include street number, street name, suburb or area if possible.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input
                      id="address2"
                      value={shippingAddress.address_line2}
                      onChange={(e) => handleInputChange('address_line2', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postal">Postal Code *</Label>
                      <Input
                        id="postal"
                        value={shippingAddress.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 p-4 bg-muted/30 rounded-lg">
                    <Checkbox
                      id="confirm-details"
                      checked={confirmDetails}
                      onCheckedChange={(checked) => setConfirmDetails(checked as boolean)}
                    />
                    <div className="grid gap-1 leading-none">
                      <label
                        htmlFor="confirm-details"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        I confirm that the email, phone number, and delivery address are accurate
                      </label>
                      <p className="text-sm text-muted-foreground">
                        This helps reduce failed delivery attempts and missed order emails.
                      </p>
                    </div>
                  </div>

                  {!user && (
                    <div className="flex items-start space-x-2 p-4 bg-muted/30 rounded-lg">
                      <Checkbox
                        id="newsletter"
                        checked={subscribeNewsletter}
                        onCheckedChange={(checked) => setSubscribeNewsletter(checked as boolean)}
                      />
                      <div className="grid gap-1 leading-none">
                        <label
                          htmlFor="newsletter"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Subscribe to our newsletter
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Get updates on new products, exclusive offers, and inspiring content. Unsubscribe anytime.
                        </p>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>

                  <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Delivery</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Usually dispatched in 1-2 business days.</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <RotateCcw className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Returns</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Easy returns and exchanges on eligible items.</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Secure payment</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Paystack-secured payment with email confirmation.</p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-sm font-medium">Before you pay</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We verify stock one more time before redirecting you to payment.
                  </p>
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={`${item.product_id}-${item.size}`} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} {item.size && `(${item.size})`} x {item.quantity}
                      </span>
                      <span>R {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shippingCost === 0 ? "text-primary font-medium" : ""}>
                      {shippingCost === 0 ? "FREE" : `R ${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal < 700 && (
                    <p className="text-xs text-muted-foreground">
                      Add R {(700 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R {grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {freeShippingRemaining > 0 && (
                  <div className="rounded-lg border border-dashed border-border p-4">
                    <p className="text-sm font-medium">Still below free shipping</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add R {freeShippingRemaining.toFixed(2)} more in the cart to qualify for free delivery.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
