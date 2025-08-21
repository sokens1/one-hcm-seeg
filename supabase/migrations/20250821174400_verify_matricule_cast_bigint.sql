-- Redefine verify_matricule to work with seeg_agents.matricule as INT8 (BIGINT)
-- Keep RPC signature as TEXT for client simplicity; cast inside function
DO $$ BEGIN
  -- Drop possible existing variants to avoid ambiguity
  PERFORM 1 FROM pg_proc WHERE proname = 'verify_matricule' AND pronargs = 1 AND proargtypes::regtype[] @> ARRAY['text'::regtype];
  IF FOUND THEN
    DROP FUNCTION public.verify_matricule(TEXT);
  END IF;
  PERFORM 1 FROM pg_proc WHERE proname = 'verify_matricule' AND pronargs = 1 AND proargtypes::regtype[] @> ARRAY['bigint'::regtype];
  IF FOUND THEN
    DROP FUNCTION public.verify_matricule(BIGINT);
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
  -- Cast input to BIGINT; returns false if cast fails
  BEGIN
    SELECT EXISTS (
      SELECT 1
      FROM public.seeg_agents sa
      WHERE sa.matricule = (p_matricule)::BIGINT
    ) INTO v_match;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN FALSE;
  END;

  RETURN COALESCE(v_match, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT) TO anon;
