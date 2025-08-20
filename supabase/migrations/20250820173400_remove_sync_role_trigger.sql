-- Remove sync trigger/function to avoid recursive updates causing stack depth exceeded

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS trg_sync_role_to_auth ON public.users;
DROP TRIGGER IF EXISTS trg_sync_role_to_auth_insert ON public.users;

-- Drop function if exists
DROP FUNCTION IF EXISTS public.sync_role_to_auth();
