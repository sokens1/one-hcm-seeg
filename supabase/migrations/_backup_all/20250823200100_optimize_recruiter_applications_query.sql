-- Create an optimized RPC function to get all recruiter applications in one query
CREATE OR REPLACE FUNCTION get_all_recruiter_applications()
RETURNS TABLE (
  application_details jsonb,
  job_offer_details jsonb,
  candidate_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(a.*) as application_details,
    to_jsonb(jo.*) as job_offer_details,
    to_jsonb(u.*) as candidate_details
  FROM applications a
  JOIN job_offers jo ON a.job_offer_id = jo.id
  JOIN users u ON a.candidate_id = u.id
  WHERE jo.status = 'active'
  ORDER BY a.created_at DESC;
END;
$$;
