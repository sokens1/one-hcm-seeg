-- Migration : Ajout de la fonction get_candidate_application_history
-- Date : 2025-01-20
-- Description : Fonction RPC pour récupérer l'historique des candidatures d'un candidat

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.get_candidate_application_history(UUID, UUID);

-- Créer la fonction get_candidate_application_history
CREATE OR REPLACE FUNCTION public.get_candidate_application_history(
  p_candidate_id UUID,
  p_current_application_id UUID DEFAULT NULL
)
RETURNS TABLE (
  application_id UUID,
  job_title TEXT,
  job_location TEXT,
  job_contract_type TEXT,
  application_status TEXT,
  campaign_id INTEGER,
  is_current_application BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as application_id,
    jo.title as job_title,
    jo.location as job_location,
    jo.contract_type as job_contract_type,
    a.status as application_status,
    jo.campaign_id,
    (a.id = p_current_application_id) as is_current_application
  FROM public.applications a
  INNER JOIN public.job_offers jo ON a.job_offer_id = jo.id
  WHERE a.candidate_id = p_candidate_id
  ORDER BY a.created_at DESC;
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.get_candidate_application_history(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_candidate_application_history(UUID, UUID) TO anon;
