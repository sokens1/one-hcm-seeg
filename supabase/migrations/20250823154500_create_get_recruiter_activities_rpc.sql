CREATE OR REPLACE FUNCTION get_recruiter_activities()
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    status TEXT,
    job_title TEXT,
    candidate_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER SET SEARCH_PATH = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.created_at,
        a.status,
        jo.title AS job_title,
        u.first_name || ' ' || u.last_name AS candidate_name
    FROM
        public.applications AS a
    INNER JOIN
        public.job_offers AS jo ON a.job_offer_id = jo.id
    INNER JOIN
        public.users AS u ON a.candidate_id = u.id
    ORDER BY
        a.created_at DESC
    LIMIT 10;
END;
$$;
