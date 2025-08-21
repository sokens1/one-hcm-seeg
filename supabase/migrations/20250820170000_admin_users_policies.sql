-- Add missing column 'sexe' if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'sexe'
  ) THEN
    ALTER TABLE public.users ADD COLUMN sexe text NULL;
  END IF;
END $$;

-- Create helper to read role from JWT claims
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  select coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    (auth.jwt() -> 'app_metadata' ->> 'role')
  );
$$;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
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

-- Select: admin can see all, others can see themselves
CREATE POLICY users_select_admin_or_self
ON public.users
FOR SELECT
TO authenticated
USING (
  public.current_role() = 'admin' OR id = auth.uid()
);

-- Insert: admin only
CREATE POLICY users_insert_admin_only
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_role() = 'admin'
);

-- Update: admin can update any; users can update themselves (but not escalate role)
CREATE POLICY users_update_admin_or_self_limited
ON public.users
FOR UPDATE
TO authenticated
USING (
  public.current_role() = 'admin' OR id = auth.uid()
)
WITH CHECK (
  public.current_role() = 'admin' OR (
    -- Prevent self role escalation by ensuring the new role equals the currently stored role
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
  public.current_role() = 'admin'
);
