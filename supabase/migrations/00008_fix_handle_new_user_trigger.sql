-- Drop and recreate the trigger function with proper type casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile with proper type casting for role
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    'user'::user_role,  -- Cast to user_role enum type
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;