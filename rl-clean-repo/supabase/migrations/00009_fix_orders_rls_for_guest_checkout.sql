
-- Drop the existing service role policy that's not working
DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;

-- Create a new policy that properly allows service role to bypass RLS
-- Service role connections automatically bypass RLS, so we don't need a policy for it
-- But we need to ensure the Edge Function can create orders

-- Add a policy to allow INSERT for anyone (since Edge Function uses service role, it will bypass RLS anyway)
-- But for safety, we'll create a policy that allows inserts when using service role
CREATE POLICY "Allow service role to manage orders"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Also add a policy to allow authenticated users to create their own orders
CREATE POLICY "Users can create own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
