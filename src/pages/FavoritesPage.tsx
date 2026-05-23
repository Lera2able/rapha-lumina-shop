import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types/types';
import { normaliseProduct } from '@/lib/product';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('product_id, products(*)')
      .eq('user_id', user?.id);

    if (data) {
      setFavorites(
        data
          .map((f: any) => f.products)
          .filter(Boolean)
          .map(normaliseProduct)
      );
    }
    setLoading(false);
  };

  const handleRemove = async (productId: string) => {
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user?.id)
      .eq('product_id', productId);

    setFavorites(prev => prev.filter(p => p.id !== productId));
    toast.success('Removed from favorites');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">You haven't saved any favorites yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Favorites</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {favorites.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <Link to={`/product/${product.id}`}>
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 text-balance">{product.name}</h3>
              <p className="text-lg font-bold mb-2">R {product.price.toFixed(2)}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleRemove(product.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
