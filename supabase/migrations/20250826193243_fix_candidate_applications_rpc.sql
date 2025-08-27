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
  RETURN QUERY
  SELECT
    to_jsonb(a.*) as application_details,
    to_jsonb(jo.*) as job_offer_details,
    jsonb_build_object(
        'first_name', u.first_name,
        'last_name', u.last_name,
        'email', u.email,
        'phone', u.phone,
        'candidate_profiles', to_jsonb(cp.*)
    ) as candidate_details
  FROM
    public.applications a
    JOIN public.job_offers jo ON a.job_offer_id = jo.id
    JOIN public.users u ON a.candidate_id = u.id
    LEFT JOIN public.candidate_profiles cp ON u.id = cp.user_id
  WHERE
    a.candidate_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_candidate_applications() TO authenticated;