
-- Update order_status enum to include refund statuses
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'refund_requested';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'refunded';

-- Update orders table for Paystack
ALTER TABLE orders 
  DROP COLUMN IF EXISTS stripe_session_id,
  DROP COLUMN IF EXISTS stripe_payment_intent_id,
  ADD COLUMN IF NOT EXISTS paystack_reference text UNIQUE,
  ADD COLUMN IF NOT EXISTS paystack_access_code text,
  ADD COLUMN IF NOT EXISTS payment_method text;

-- Create refund_requests table
CREATE TABLE IF NOT EXISTS refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  admin_notes text,
  refund_amount numeric(12,2) NOT NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for refund_requests
CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);

-- Enable RLS on refund_requests
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for refund_requests
CREATE POLICY "Users can view their own refund requests"
  ON refund_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create refund requests for their orders"
  ON refund_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.user_id = auth.uid()
      AND orders.status IN ('completed', 'pending')
    )
  );

CREATE POLICY "Admins can view all refund requests"
  ON refund_requests FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update refund requests"
  ON refund_requests FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update orders RLS to allow admins to manage all orders
CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
