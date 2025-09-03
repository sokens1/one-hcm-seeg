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
  -- Vérifier que l'utilisateur est authentifié et a un rôle approprié
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('recruteur', 'admin', 'observateur', 'observer')
  ) THEN
    RAISE EXCEPTION 'Access denied: Only recruiters, admins, and observers can access this function';
  END IF;

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

-- Accorder l'exécution aux rôles appropriés
GRANT EXECUTE ON FUNCTION get_all_recruiter_applications() TO authenticated;
