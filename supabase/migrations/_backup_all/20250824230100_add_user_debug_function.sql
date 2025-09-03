-- supabase/migrations/20250824230100_add_user_debug_function.sql

-- Create a function to debug user account issues

CREATE OR REPLACE FUNCTION public.debug_user_account(p_email text)
RETURNS TABLE (
    auth_exists boolean,
    public_exists boolean,
    auth_email text,
    auth_confirmed boolean,
    public_email text,
    public_role text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = p_email)) as auth_exists,
        (SELECT EXISTS(SELECT 1 FROM public.users WHERE email = p_email)) as public_exists,
        (SELECT au.email FROM auth.users au WHERE au.email = p_email LIMIT 1) as auth_email,
        (SELECT au.email_confirmed_at IS NOT NULL FROM auth.users au WHERE au.email = p_email LIMIT 1) as auth_confirmed,
        (SELECT pu.email FROM public.users pu WHERE pu.email = p_email LIMIT 1) as public_email,
        (SELECT pu.role FROM public.users pu WHERE pu.email = p_email LIMIT 1) as public_role;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.debug_user_account(text) TO authenticated;
