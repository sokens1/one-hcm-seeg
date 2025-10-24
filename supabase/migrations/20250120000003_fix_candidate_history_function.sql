-- Migration : Correction de la fonction get_candidate_application_history
-- Date : 2025-01-20
-- Description : Version simplifiée et corrigée de la fonction RPC

-- Supprimer toutes les versions existantes de la fonction
DROP FUNCTION IF EXISTS public.get_candidate_application_history(UUID, UUID);
DROP FUNCTION IF EXISTS public.get_candidate_application_history(UUID);
DROP FUNCTION IF EXISTS public.get_candidate_application_history;

-- Créer une version simplifiée de la fonction
CREATE OR REPLACE FUNCTION public.get_candidate_application_history(
  p_candidate_id UUID,
  p_current_application_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'application_id', a.id,
      'job_title', jo.title,
      'job_location', jo.location,
      'job_contract_type', jo.contract_type,
      'application_status', a.status,
      'campaign_id', jo.campaign_id,
      'is_current_application', (a.id = p_current_application_id),
      'applied_date', a.created_at
    )
  ) INTO result
  FROM public.applications a
  INNER JOIN public.job_offers jo ON a.job_offer_id = jo.id
  WHERE a.candidate_id = p_candidate_id
  ORDER BY a.created_at DESC;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.get_candidate_application_history(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_candidate_application_history(UUID, UUID) TO anon;
