import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import type { Product } from '@/types/types';
import { normaliseProduct, normaliseProducts } from '@/lib/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Heart, Minus, Plus, ShoppingCart, Check } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddedDialog, setShowAddedDialog] = useState(false);
  const [addedItemDetails, setAddedItemDetails] = useState<{ name: string; quantity: number; size: string | null }>({ name: '', quantity: 0, size: null });
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationSubmitting, setNotificationSubmitting] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadProduct();
      checkFavorite();
    }
  }, [id, user]);

  const loadProduct = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      const product = normaliseProduct(data);
      setProduct(product);
      if (product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      loadRelatedProducts(product.collection);
    }
  };

  const loadRelatedProducts = async (collection: string) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('collection', collection)
      .neq('id', id)
      .limit(4);

    setRelatedProducts(normaliseProducts(data));
  };

  const checkFavorite = async () => {
    if (!user || !id) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .single();

    setIsFavorite(!!data);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (product.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    addItem(product, quantity, selectedSize || null);
    setAddedItemDetails({
      name: product.name,
      quantity: quantity,
      size: selectedSize || null,
    });
    setShowAddedDialog(true);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    if (!product) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      setIsFavorite(false);
      toast.success('Removed from favorites');
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: product.id });
      setIsFavorite(true);
      toast.success('Added to favorites');
    }
  };

  const handleStockNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !notificationEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificationEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setNotificationSubmitting(true);

    try {
      const { error } = await supabase
        .from('stock_notifications')
        .insert({
          product_id: product.id,
          customer_email: notificationEmail.toLowerCase().trim(),
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('You are already registered for notifications on this product');
        } else {
          throw error;
        }
      } else {
        toast.success('You will be notified when this item is back in stock!');
        setNotificationEmail('');
      }
    } catch (error) {
      console.error('Error registering notification:', error);
      toast.error('Failed to register notification. Please try again.');
    } finally {
      setNotificationSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const productImages = [product.image_url];
  if (product.additional_images && Array.isArray(product.additional_images)) {
    productImages.push(...product.additional_images);
  }

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <ProductImageGallery images={productImages} productName={product.name} />

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-balance">{product.name}</h1>
              <p className="text-2xl font-bold text-primary">R {product.price.toFixed(2)}</p>
            </div>

            <p className="text-muted-foreground text-pretty">{product.description}</p>

            {product.sizes.length > 0 && (
              <div>
                <Label className="mb-2 block">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map(size => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="mb-2 block">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </div>

            {product.stock === 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">This item is currently out of stock</p>
                  <p className="text-sm text-muted-foreground">
                    Enter your email address to be notified when this item is back in stock
                  </p>
                </div>
                <form onSubmit={handleStockNotification} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit" disabled={notificationSubmitting}>
                      {notificationSubmitting ? 'Submitting...' : 'Notify Me'}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-balance">{relatedProduct.name}</h3>
                      <p className="text-lg font-bold">R {relatedProduct.price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Added to Cart Dialog */}
      <Dialog open={showAddedDialog} onOpenChange={setShowAddedDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-left">Added to Cart</DialogTitle>
            </div>
            <DialogDescription className="text-left">
              <span className="font-medium text-foreground">{addedItemDetails.name}</span>
              {addedItemDetails.size && (
                <span className="text-muted-foreground"> (Size: {addedItemDetails.size})</span>
              )}
              <br />
              <span className="text-muted-foreground">Quantity: {addedItemDetails.quantity}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddedDialog(false)}
              className="w-full sm:w-auto"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => {
                setShowAddedDialog(false);
                navigate('/cart');
              }}
              className="w-full sm:w-auto"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Go to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
