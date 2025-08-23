-- Restore original function: remove ambiguous overload and keep only the original 1-arg version

-- Remove the 2-arg overload if present
DROP FUNCTION IF EXISTS public.get_recruiter_applications(uuid, uuid);

-- Recreate the original 1-arg function
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
  -- Security: only recruiter/admin can use this function
  IF NOT EXISTS(
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('recruteur','admin')
  ) THEN
    RAISE EXCEPTION 'access denied for uid=%', auth.uid();
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
  WHERE a.job_offer_id = p_job_offer_id
  ORDER BY a.created_at DESC;
END;
$$;

-- Grant execute to default Supabase roles
GRANT EXECUTE ON FUNCTION public.get_recruiter_applications(uuid) TO anon, authenticated, service_role;
