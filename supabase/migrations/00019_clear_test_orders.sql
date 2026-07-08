-- Remove all test orders from the project.
-- refund_requests rows cascade automatically via FK to orders(id).

delete from public.orders;
