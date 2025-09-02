-- Redefine verify_matricule to use only the matricule column (no dependency on 'active' or 'email')
DO $$ BEGIN
  -- Drop prior single-arg function if exists
  PERFORM 1 FROM pg_proc WHERE proname = 'verify_matricule' AND pronargs = 1;
  IF FOUND THEN
    DROP FUNCTION public.verify_matricule(TEXT);
  END IF;
END $$;

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
  ) INTO v_match;

  RETURN COALESCE(v_match, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT) TO anon;
