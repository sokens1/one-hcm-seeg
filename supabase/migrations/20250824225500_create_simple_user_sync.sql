-- supabase/migrations/20250824225500_create_simple_user_sync.sql

-- Create a simplified user sync function that doesn't cause errors

CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert without complex logic that might cause errors
  INSERT INTO public.users (id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    'candidat', -- Default role
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_simple
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();
