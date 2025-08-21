-- Create seeg_agents table if it doesn't exist, and a secure RPC for matricule verification
-- This migration is idempotent where possible

-- 1) Table seeg_agents (minimal schema)
CREATE TABLE IF NOT EXISTS public.seeg_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  matricule TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER seeg_agents_updated_at
  BEFORE UPDATE ON public.seeg_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
  -- trigger already exists
  NULL;
END $$;

-- 3) Enable RLS and keep restrictive by default
ALTER TABLE public.seeg_agents ENABLE ROW LEVEL SECURITY;

-- Optionally, you can add specific policies for authenticated/admin later.
-- No anon SELECT policy on purpose; we will use a SECURITY DEFINER RPC below.

-- 4) Secure RPC to verify matricule without exposing table data
-- Returns true if there is an active agent with the given email and matching matricule
CREATE OR REPLACE FUNCTION public.verify_matricule(p_email TEXT, p_matricule TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.seeg_agents sa
    WHERE lower(sa.email) = lower(trim(p_email))
      AND trim(sa.matricule) = trim(p_matricule)
      AND sa.active = true
  ) INTO v_match;

  RETURN COALESCE(v_match, false);
END;
$$;

-- 5) Grant execute on the function to anon so the signup form can call it before authentication
GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT, TEXT) TO anon;
