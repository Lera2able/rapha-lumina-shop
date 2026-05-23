
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated admins to upload product images
CREATE POLICY "Admin upload access for product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (auth.jwt() ->> 'email') IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

-- Allow authenticated admins to update product images
CREATE POLICY "Admin update access for product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (auth.jwt() ->> 'email') IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

-- Allow authenticated admins to delete product images
CREATE POLICY "Admin delete access for product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (auth.jwt() ->> 'email') IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'admin'
  )
);
