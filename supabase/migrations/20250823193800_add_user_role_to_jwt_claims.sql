-- 1. Create the function to update user claims
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('user_role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- 2. Create the trigger to call the function
-- Drop trigger if it exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_user_role_change ON public.users;

CREATE TRIGGER on_user_role_change
AFTER INSERT OR UPDATE OF role ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();
