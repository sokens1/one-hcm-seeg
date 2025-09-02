-- Create a secure RPC to check if an email exists without exposing user data
-- This function queries auth.users and returns a boolean.
-- It is defined as SECURITY DEFINER and grants EXECUTE to anon/authenticated roles only.

create or replace function public.email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    where lower(u.email) = lower(p_email)
  );
$$;

comment on function public.email_exists(text) is 'Returns true if a user with the given email exists. Does not expose any user information.';

-- Restrict function permissions
revoke all on function public.email_exists(text) from public;
grant execute on function public.email_exists(text) to anon, authenticated;
