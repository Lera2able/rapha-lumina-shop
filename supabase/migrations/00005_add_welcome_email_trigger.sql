
-- Create function to send welcome email via Edge Function
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
  user_first_name text;
BEGIN
  -- Get user email and first name
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  user_first_name := NEW.first_name;
  
  -- Call Edge Function to send welcome email (async, non-blocking)
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send_email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'type', 'welcome',
      'to', user_email,
      'data', jsonb_build_object(
        'firstName', COALESCE(user_first_name, 'there')
      )
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to send welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send welcome email after profile creation
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON profiles;
CREATE TRIGGER send_welcome_email_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();
