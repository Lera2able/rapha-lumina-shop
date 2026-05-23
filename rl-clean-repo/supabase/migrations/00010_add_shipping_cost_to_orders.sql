
-- Add shipping_cost column to orders table
ALTER TABLE public.orders
ADD COLUMN shipping_cost numeric DEFAULT 0 NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.orders.shipping_cost IS 'Shipping cost in the order currency. Free shipping (0) for orders >= 700, otherwise 100.';
