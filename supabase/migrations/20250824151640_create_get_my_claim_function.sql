-- Goal: Define the get_my_claim function required by RLS policies.
-- Problem: A subsequent migration fails because this function does not exist.
-- This function extracts a specific claim from the currently authenticated user's JWT.

CREATE OR REPLACE FUNCTION public.get_my_claim(claim TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT
    coalesce(current_setting('request.jwt.claims', true)::jsonb ->> claim, nullif(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> claim, null))::text;
$$;

-- This second function is a more specific version to get the user's role, which is often nested.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT public.get_my_claim('user_role');
$$;
