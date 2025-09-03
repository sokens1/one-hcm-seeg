-- Allow observers to read recruiter applications for a specific job offer
-- Adds 'observateur'/'observer' to the role check in the RPC

CREATE OR REPLACE FUNCTION public.get_recruiter_applications(p_job_offer_id uuid)
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
  -- Security: recruiters, admins and observers can use this function (read-only consumers)
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('recruteur','admin','observateur','observer')
  ) THEN
    RAISE EXCEPTION 'access denied for uid=%', auth.uid();
  END IF;

  RETURN QUERY
  SELECT
    to_jsonb(a.*) AS application_details,
    to_jsonb(jo.*) AS job_offer_details,
    to_jsonb(u.*) || jsonb_build_object(
      'candidate_profiles', to_jsonb(cp.*)
    ) AS candidate_details
  FROM public.applications a
  JOIN public.job_offers jo ON jo.id = a.job_offer_id
  JOIN public.users u ON u.id = a.candidate_id
  LEFT JOIN public.candidate_profiles cp ON cp.user_id = u.id
  WHERE a.job_offer_id = p_job_offer_id
  ORDER BY a.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_recruiter_applications(uuid) TO anon, authenticated, service_role;
