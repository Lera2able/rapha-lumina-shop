
-- Drop the existing welcome email trigger that might be causing issues
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON profiles;
DROP FUNCTION IF EXISTS send_welcome_email();

-- We'll handle welcome emails from the frontend instead
-- This ensures user signup doesn't fail if email sending fails
