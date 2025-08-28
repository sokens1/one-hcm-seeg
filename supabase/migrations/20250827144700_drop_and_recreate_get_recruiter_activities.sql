-- Drop the existing function first
DROP FUNCTION IF EXISTS get_recruiter_activities(integer, integer);

-- Recreate with correct structure
CREATE OR REPLACE FUNCTION get_recruiter_activities(p_limit integer, p_offset integer)
RETURNS TABLE (
    id UUID,
    description TEXT,
    job_title TEXT,
    candidate_name TEXT,
    created_at TIMESTAMPTZ,
    activity_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER SET SEARCH_PATH = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        CASE 
            WHEN a.status = 'pending' THEN 'Nouvelle candidature reçue'
            WHEN a.status = 'reviewed' THEN 'Candidature examinée'
            WHEN a.status = 'interview' THEN 'Entretien programmé'
            WHEN a.status = 'hired' THEN 'Candidat embauché'
            WHEN a.status = 'rejected' THEN 'Candidature rejetée'
            ELSE 'Mise à jour de candidature'
        END AS description,
        jo.title AS job_title,
        u.first_name || ' ' || u.last_name AS candidate_name,
        a.created_at,
        CASE 
            WHEN a.status = 'pending' THEN 'application'
            ELSE 'status_change'
        END AS activity_type
    FROM
        public.applications AS a
    INNER JOIN
        public.job_offers AS jo ON a.job_offer_id = jo.id
    INNER JOIN
        public.users AS u ON a.candidate_id = u.id
    ORDER BY
        a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_recruiter_activities(integer, integer) TO authenticated;
