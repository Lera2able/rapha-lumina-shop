import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { normaliseProduct } from '@/lib/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';
import type { Product, CollectionType } from '@/types/types';


export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    collection: 'enlightened' as CollectionType,
    category: '',
    price: '',
    stock: '',
    sizes: [] as string[],
    featured: false,
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const product = normaliseProduct(data);
        setFormData({
          name: product.name,
          description: product.description,
          collection: product.collection,
          category: product.category,
          price: product.price.toString(),
          stock: product.stock.toString(),
          sizes: product.sizes,
          featured: product.featured,
        });

        const productImages = product.image_url ? [product.image_url] : [];
        productImages.push(...product.additional_images);
        setImages(productImages);

        // Load existing video URL if any. The Product type may not have it yet,
        // so we read it from the raw data row.
        setVideoUrl((data as any).video_url ?? '');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    }
  };

  const uploadImageToStorage = async (base64Image: string, fileName: string): Promise<string> => {
    const base64Data = base64Image.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    const filePath = `${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleVideoFile = async (file: File) => {
    if (!file) return;

    // Sanity check before we hit the server
    const maxBytes = 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error('Video is too large. Maximum size is 50 MB.');
      return;
    }
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(file.type)) {
      toast.error('Only MP4, WebM, or MOV videos are supported.');
      return;
    }

    setVideoFile(file);
    setVideoUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const filePath = `${Date.now()}_product.${ext}`;
      const { error } = await supabase.storage
        .from('product-videos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('product-videos')
        .getPublicUrl(filePath);

      setVideoUrl(urlData.publicUrl);
      toast.success('Video uploaded. Click Update to save it to the product.');
    } catch (err: any) {
      console.error('Video upload failed:', err);
      toast.error(`Video upload failed: ${err.message || 'unknown error'}`);
      setVideoFile(null);
    } finally {
      setVideoUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
    setVideoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    setLoading(true);

    try {
      const uploadedImageUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image.startsWith('data:')) {
          try {
            const uploadedUrl = await uploadImageToStorage(image, `product_${i}.jpg`);
            uploadedImageUrls.push(uploadedUrl);
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            toast.error(`Failed to upload image ${i + 1}. Please check your permissions.`);
            throw uploadError;
          }
        } else {
          uploadedImageUrls.push(image);
        }
      }

      const [primaryImage, ...additionalImages] = uploadedImageUrls;

      const productData = {
        name: formData.name,
        description: formData.description,
        collection: formData.collection,
        category: formData.category,
        price: parseFloat(formData.price),
        image_url: primaryImage,
        additional_images: additionalImages.length > 0 ? additionalImages : null,
        video_url: videoUrl || null,
        stock: parseInt(formData.stock),
        sizes: formData.sizes.length > 0 ? formData.sizes : null,
        featured: formData.featured,
      };

      if (id) {
        // Get current stock before update
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock')
          .eq('id', id)
          .single();

        const wasOutOfStock = currentProduct && currentProduct.stock === 0;
        const isNowInStock = parseInt(formData.stock) > 0;

        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) {
          console.error('Database update error:', error);
          toast.error(`Failed to update product: ${error.message}`);
          throw error;
        }

        // If product was out of stock and is now in stock, send notifications
        if (wasOutOfStock && isNowInStock) {
          try {
            const { data: notificationResult, error: notificationError } = await supabase.functions.invoke(
              'send_stock_notifications',
              {
                body: { productId: id },
              }
            );

            if (notificationError) {
              console.error('Error sending notifications:', notificationError);
            } else if (notificationResult && notificationResult.success > 0) {
              toast.success(`Product updated! Sent notifications to ${notificationResult.success} customers.`);
            } else {
              toast.success('Product updated successfully');
            }
          } catch (notificationError) {
            console.error('Error sending notifications:', notificationError);
            toast.success('Product updated successfully');
          }
        } else {
          toast.success('Product updated successfully');
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) {
          console.error('Database insert error:', error);
          toast.error(`Failed to create product: ${error.message}`);
          throw error;
        }
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-primary">
          {id ? 'Edit Product' : 'Add Product'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="collection">Collection *</Label>
                <Select
                  value={formData.collection}
                  onValueChange={(value: CollectionType) =>
                    setFormData({ ...formData, collection: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enlightened">Enlightened</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., T-Shirts, Bags"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (ZAR) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sizes">Sizes (comma-separated, e.g., S, M, L, XL)</Label>
              <Input
                id="sizes"
                type="text"
                placeholder="S, M, L, XL"
                value={formData.sizes.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Feature this product on homepage
              </Label>
            </div>

            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              maxSizeMB={5}
            />

            <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <Label className="font-semibold">Product Video (optional)</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                MP4, WebM, or MOV. Maximum 50 MB. Plays on the product detail page below the images.
              </p>

              {videoUrl && !videoUploading && (
                <div className="space-y-2">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full max-w-md rounded-md border bg-black"
                  >
                    Your browser does not support video playback.
                  </video>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveVideo}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove video
                  </Button>
                </div>
              )}

              {videoUploading && (
                <p className="text-sm text-muted-foreground">Uploading video…</p>
              )}

              {!videoUrl && !videoUploading && (
                <Input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleVideoFile(f);
                  }}
                />
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
