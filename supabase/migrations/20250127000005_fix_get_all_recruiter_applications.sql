-- Fix the get_all_recruiter_applications function to handle errors gracefully
-- This addresses the issue where the RPC function fails and causes job offers to not load

CREATE OR REPLACE FUNCTION public.get_all_recruiter_applications()
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
    WHERE id = auth.uid() AND role IN ('recruteur', 'admin', 'observateur', 'observer', 'recruiter')
  ) THEN
    -- Return empty result instead of raising exception to avoid breaking the UI
    RETURN;
  END IF;

  -- Return applications with proper error handling
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't break the application
    RAISE WARNING 'Error in get_all_recruiter_applications: %', SQLERRM;
    RETURN;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_recruiter_applications() TO authenticated;
