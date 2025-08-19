CREATE OR REPLACE FUNCTION get_recruiter_activity(p_recruiter_id UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  job_title TEXT
)
AS $$
BEGIN
  RETURN QUERY
  WITH recent_applications AS (
    SELECT
      a.id,
      'new_application' AS type,
      u.first_name || ' ' || u.last_name || ' a postulé' AS description,
      a.created_at,
      jo.title AS job_title
    FROM applications a
    JOIN job_offers jo ON a.job_offer_id = jo.id
    JOIN users u ON a.user_id = u.id
    WHERE jo.recruiter_id = p_recruiter_id
      AND a.created_at >= NOW() - INTERVAL '7 days'
  ),
  recent_job_offers AS (
    SELECT
      jo.id,
      'offer_published' AS type,
      'Vous avez publié une nouvelle offre' AS description,
      jo.created_at,
      jo.title AS job_title
    FROM job_offers jo
    WHERE jo.recruiter_id = p_recruiter_id
      AND jo.created_at >= NOW() - INTERVAL '7 days'
  )
  SELECT * FROM recent_applications
  UNION ALL
  SELECT * FROM recent_job_offers
  ORDER BY created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
