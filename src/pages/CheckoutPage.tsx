import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import type { ShippingAddress } from '@/types/types';

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, grandTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Call Supabase Edge Function (checkout-v2)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/checkout-v2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            items: orderItems,
            email: shippingAddress.email,
            currency: 'ZAR',
            shippingAddress: shippingAddress,
            shippingCost: shippingCost,
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

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
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
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address1">Address Line 1 *</Label>
                    <Input
                      id="address1"
                      value={shippingAddress.address_line1}
                      onChange={(e) => handleInputChange('address_line1', e.target.value)}
                      required
                    />
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
