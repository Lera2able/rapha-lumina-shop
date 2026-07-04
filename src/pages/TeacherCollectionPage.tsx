import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import type { Product } from '@/types/types';
import { normaliseProducts } from '@/lib/product';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import PageMeta from '@/components/common/PageMeta';

export default function TeacherCollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, categoryFilter, priceRange, sortBy]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('collection', 'teacher')
      .order('created_at', { ascending: false });

    const normalised = normaliseProducts(data);
    setProducts(normalised);
    const max = normalised.length > 0 ? Math.max(...normalised.map(p => p.price), 1000) : 1000;
    setMaxPrice(max);
    setPriceRange([0, max]);
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    filtered = filtered.filter(
      p => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setCategoryFilter('all');
    setPriceRange([0, maxPrice]);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen teacher-section">
      <PageMeta
        title="Teacher Collection | Rapha Lumina"
        description="Shop the Rapha Lumina Teacher Collection for practical, joyful classroom accessories and everyday educator essentials."
        canonicalPath="/teacher"
        ogImage="https://raphalumina.com/og-teacher.svg"
        ogImageAlt="Teacher Collection social preview card"
      />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance teacher-heading">The Teacher Collection</h1>
          <p className="text-lg text-foreground/90 text-pretty">
            Because teaching is hard enough without struggling with your gear. Practical, fun accessories that make classroom life easier and more joyful.
          </p>
          <div className="flex flex-wrap gap-2 mt-4 text-xs tracking-[0.14em] uppercase text-foreground/70">
            <span className="rounded-full border border-border px-3 py-1">Built for busy classrooms</span>
            <span className="rounded-full border border-border px-3 py-1">Free shipping over R700</span>
            <span className="rounded-full border border-border px-3 py-1">Useful everyday picks</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="space-y-6">
            <Card className="glass-card">
              <CardContent className="p-4">
                <Label className="mb-2 block">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="apron">Teacher Aprons</SelectItem>
                    <SelectItem value="crossbody_bag">Crossbody Bags</SelectItem>
                    <SelectItem value="tote_bag">Tote Bags</SelectItem>
                    <SelectItem value="lanyard">Lanyards</SelectItem>
                    <SelectItem value="desk_organizer">Desk Organizers</SelectItem>
                    <SelectItem value="planner">Planners</SelectItem>
                    <SelectItem value="water_bottle">Water Bottles</SelectItem>
                    <SelectItem value="polo_shirt">Polo Shirts</SelectItem>
                    <SelectItem value="wheelie_bag">Wheelie Bags</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <Label className="mb-2 block">
                  Price Range: R{priceRange[0]} - R{priceRange[1]}
                </Label>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <Label className="mb-2 block">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="price-low">Price: low to high</SelectItem>
                    <SelectItem value="price-high">Price: high to low</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" onClick={clearFilters}>
              Clear Filters
            </Button>
          </aside>

          <div className="md:col-span-3">
            <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of{' '}
                <span className="font-medium text-foreground">{products.length}</span> products
              </p>
              <p className="text-sm text-muted-foreground">
                Classroom-ready essentials that save time and feel joyful to use
              </p>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your filters.</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map(product => {
                  const soldOut = product.stock === 0;
                  return (
                    <Link key={product.id} to={`/product/${product.id}`}>
                      <Card className="h-full overflow-hidden glass-card hover:scale-105 transition-all duration-300 relative">
                        <div className="aspect-square overflow-hidden relative">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className={`w-full h-full object-cover hover:scale-110 transition-transform duration-500 ${soldOut ? 'opacity-60 grayscale' : ''}`}
                          />
                          {soldOut && (
                            <span className="absolute top-3 right-3 bg-foreground text-background text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 font-body">
                              Sold Out
                            </span>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 text-balance text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2 text-pretty">
                            {product.description}
                          </p>
                          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">
                            {product.stock > 0 ? `${product.stock} available` : 'Restock notification available'}
                          </p>
                          {soldOut ? (
                            <>
                              <p className="text-lg font-bold text-muted-foreground line-through">
                                R {product.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-secondary mt-2 font-medium">
                                Notify me when available →
                              </p>
                            </>
                          ) : (
                            <p className="text-lg font-bold text-secondary">R {product.price.toFixed(2)}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
