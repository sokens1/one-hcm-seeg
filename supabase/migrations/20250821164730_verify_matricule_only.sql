-- Update verify_matricule to check only matricule (no email)
-- 1) Drop previous two-argument RPC if it exists to avoid ambiguity
DO $$ BEGIN
  PERFORM 1 FROM pg_proc WHERE proname = 'verify_matricule' AND pronargs = 2;
  IF FOUND THEN
    DROP FUNCTION public.verify_matricule(TEXT, TEXT);
  END IF;
END $$;

-- 2) Create single-argument RPC
CREATE OR REPLACE FUNCTION public.verify_matricule(p_matricule TEXT)
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
    WHERE trim(sa.matricule) = trim(p_matricule)
      AND sa.active = true
  ) INTO v_match;

  RETURN COALESCE(v_match, false);
END;
$$;

-- 3) Grant execution to anon
GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT) TO anon;
