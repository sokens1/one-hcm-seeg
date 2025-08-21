-- Recreate users policies to rely on DB role (public.users.role) rather than JWT metadata
-- This avoids needing to sync app_metadata.role and prevents recursion issues

-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_admin_or_self') THEN
    DROP POLICY users_select_admin_or_self ON public.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_insert_admin_only') THEN
    DROP POLICY users_insert_admin_only ON public.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_update_admin_or_self_limited') THEN
    DROP POLICY users_update_admin_or_self_limited ON public.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_delete_admin_only') THEN
    DROP POLICY users_delete_admin_only ON public.users;
  END IF;
END $$;

-- Helper: check if current user is admin according to DB
create or replace function public.is_admin_db()
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
  );
$$;

-- Select: admin can see all, others can see themselves
CREATE POLICY users_select_admin_or_self
ON public.users
FOR SELECT
TO authenticated
USING (
  public.is_admin_db() OR id = auth.uid()
);

-- Insert: admin only
CREATE POLICY users_insert_admin_only
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_db()
);

-- Update: admin can update any; users can update themselves (but not escalate role)
CREATE POLICY users_update_admin_or_self_limited
ON public.users
FOR UPDATE
TO authenticated
USING (
  public.is_admin_db() OR id = auth.uid()
)
WITH CHECK (
  public.is_admin_db() OR (
    -- Prevent self role escalation by ensuring new role equals stored role
    id = auth.uid() AND role = (
      SELECT u.role FROM public.users AS u WHERE u.id = auth.uid()
    )
  )
);

-- Delete: admin only
CREATE POLICY users_delete_admin_only
ON public.users
FOR DELETE
TO authenticated
USING (
  public.is_admin_db()
);
