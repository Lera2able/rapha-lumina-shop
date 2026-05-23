
-- Create stock_notifications table
CREATE TABLE IF NOT EXISTS stock_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  notified_at timestamptz,
  UNIQUE(product_id, customer_email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stock_notifications_product_id ON stock_notifications(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_notifications_email ON stock_notifications(customer_email);
CREATE INDEX IF NOT EXISTS idx_stock_notifications_notified ON stock_notifications(notified_at) WHERE notified_at IS NULL;

-- Allow anyone to insert notification requests
CREATE POLICY "Anyone can request stock notifications"
ON stock_notifications FOR INSERT
TO public
WITH CHECK (true);

-- Allow public to view their own notifications
CREATE POLICY "Users can view their own notifications"
ON stock_notifications FOR SELECT
TO public
USING (true);

-- Allow admins to view all notifications
CREATE POLICY "Admins can view all notifications"
ON stock_notifications FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'email') IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

-- Allow admins to update notifications (mark as notified)
CREATE POLICY "Admins can update notifications"
ON stock_notifications FOR UPDATE
TO authenticated
USING (
  (auth.jwt() ->> 'email') IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

-- Allow admins to delete notifications
CREATE POLICY "Admins can delete notifications"
ON stock_notifications FOR DELETE
TO authenticated
USING (
  (auth.jwt() ->> 'email') IN (
    SELECT email FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'admin'
  )
);

-- Enable RLS
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;
