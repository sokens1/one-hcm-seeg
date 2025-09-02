-- Créer une fonction RPC pour que les candidats puissent voir leurs propres candidatures
CREATE OR REPLACE FUNCTION public.get_candidate_application(p_application_id uuid)
RETURNS TABLE (
  application_details jsonb,
  job_offer_details jsonb,
  candidate_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security: candidat peut seulement voir ses propres candidatures
  IF NOT EXISTS(
    SELECT 1 FROM public.applications
    WHERE id = p_application_id AND candidate_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'access denied for application_id=% uid=%', p_application_id, auth.uid();
  END IF;

  RETURN QUERY
  SELECT
    -- Application details
    to_jsonb(a.*) AS application_details,

    -- Job offer details
    to_jsonb(jo.*) AS job_offer_details,

    -- Candidate details (basic user + embedded candidate_profiles)
    to_jsonb(u.*) || jsonb_build_object(
      'candidate_profiles', to_jsonb(cp.*)
    ) AS candidate_details
  FROM public.applications a
  JOIN public.job_offers jo ON jo.id = a.job_offer_id
  JOIN public.users u ON u.id = a.candidate_id
  LEFT JOIN public.candidate_profiles cp ON cp.user_id = u.id
  WHERE a.id = p_application_id AND a.candidate_id = auth.uid();
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_candidate_application(uuid) TO authenticated;

-- Créer une fonction RPC pour que les candidats puissent lister leurs candidatures
CREATE OR REPLACE FUNCTION public.get_candidate_applications()
RETURNS TABLE (
  application_details jsonb,
  job_offer_details jsonb,
  candidate_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security: candidat peut seulement voir ses propres candidatures
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'access denied: not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    -- Application details
    to_jsonb(a.*) AS application_details,

    -- Job offer details
    to_jsonb(jo.*) AS job_offer_details,

    -- Candidate details (basic user + embedded candidate_profiles)
    to_jsonb(u.*) || jsonb_build_object(
      'candidate_profiles', to_jsonb(cp.*)
    ) AS candidate_details
  FROM public.applications a
  JOIN public.job_offers jo ON jo.id = a.job_offer_id
  JOIN public.users u ON u.id = a.candidate_id
  LEFT JOIN public.candidate_profiles cp ON cp.user_id = u.id
  WHERE a.candidate_id = auth.uid()
  ORDER BY a.created_at DESC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;
