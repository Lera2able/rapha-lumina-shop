import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import PageMeta from '@/components/common/PageMeta';
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, shippingCost, grandTotal } = useCart();
  const freeShippingRemaining = subtotal < 700 ? 700 - subtotal : 0;
  const freeShippingProgress = subtotal > 0 ? Math.min((subtotal / 700) * 100, 100) : 0;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageMeta
          title="Your Cart | Rapha Lumina"
          description="Review your selected Rapha Lumina items and continue shopping or proceed to checkout."
          canonicalPath="/cart"
          ogImage="https://raphalumina.com/og-support.svg"
          ogImageAlt="Rapha Lumina cart social preview card"
        />
        <div className="text-center space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some products to get started!</p>
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageMeta
        title="Your Cart | Rapha Lumina"
        description="Review your selected Rapha Lumina items and continue to secure checkout."
        canonicalPath="/cart"
        ogImage="https://raphalumina.com/og-support.svg"
        ogImageAlt="Rapha Lumina cart social preview card"
      />
      <div className="container py-8">
        <div className="flex flex-col gap-3 mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground mt-2">
              Review your items, adjust quantities, and head to secure checkout when you’re ready.
            </p>
          </div>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Free shipping progress</p>
                    <p className="text-sm text-muted-foreground">
                      {freeShippingRemaining > 0
                        ? `Add R ${freeShippingRemaining.toFixed(2)} more to unlock free delivery.`
                        : 'You’ve unlocked free shipping on this order.'}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {freeShippingProgress.toFixed(0)}%
                  </p>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            {items.map(item => (
              <Card key={`${item.product_id}-${item.size}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 shrink-0 overflow-hidden rounded-lg border">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        loading="lazy"
                        decoding="async"
                        sizes="96px"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 text-balance">{item.product.name}</h3>
                      {item.size && (
                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      )}
                      <p className="text-lg font-bold mt-2">R {item.product.price.toFixed(2)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product_id, item.size)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Order Summary</h2>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shippingCost === 0 ? "text-primary font-medium" : ""}>
                      {shippingCost === 0 ? "FREE" : `R ${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal < 700 && subtotal > 0 && (
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

                <Link to="/checkout">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex gap-3">
                    <Truck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">R70 shipping under R700. Free shipping from R700.</p>
                  </div>
                  <div className="flex gap-3">
                    <RotateCcw className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">Easy returns and exchanges on eligible items.</p>
                  </div>
                  <div className="flex gap-3">
                    <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">Secure payment with order confirmation sent by email.</p>
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
