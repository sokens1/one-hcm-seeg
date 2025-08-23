-- Corriger la fonction get_all_recruiter_applications pour inclure les candidate_profiles
CREATE OR REPLACE FUNCTION public.get_all_recruiter_applications()
RETURNS TABLE(application_details jsonb, job_offer_details jsonb, candidate_details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_jsonb(a) AS application_details,
    to_jsonb(jo) AS job_offer_details,
    jsonb_build_object(
      'id', u.id,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'email', u.email,
      'phone', u.phone,
      'date_of_birth', u.date_of_birth,
      'candidate_profiles', to_jsonb(cp)
    ) AS candidate_details
  FROM
    public.applications a
  JOIN
    public.job_offers jo ON a.job_offer_id = jo.id
  JOIN
    public.users u ON a.candidate_id = u.id
  LEFT JOIN
    public.candidate_profiles cp ON u.id = cp.user_id
  WHERE jo.status = 'active'
  ORDER BY a.created_at DESC;
END;
$$;