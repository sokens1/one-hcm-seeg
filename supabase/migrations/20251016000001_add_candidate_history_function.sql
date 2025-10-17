-- ============================================
-- FONCTION POUR RÉCUPÉRER L'HISTORIQUE DES CANDIDATURES D'UN CANDIDAT
-- Permet aux recruteurs de voir toutes les candidatures passées, même des campagnes précédentes
-- ============================================

CREATE OR REPLACE FUNCTION get_candidate_application_history(p_candidate_id UUID, p_current_application_id UUID DEFAULT NULL)
RETURNS TABLE (
  application_id UUID,
  job_title TEXT,
  job_location TEXT,
  job_contract_type TEXT,
  application_status TEXT,
  applied_date TIMESTAMPTZ,
  campaign_id INTEGER,
  is_current_application BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id AS application_id,
    jo.title AS job_title,
    jo.location AS job_location,
    jo.contract_type AS job_contract_type,
    a.status AS application_status,
    a.created_at AS applied_date,
    jo.campaign_id,
    (a.id = p_current_application_id) AS is_current_application
  FROM applications a
  INNER JOIN job_offers jo ON a.job_offer_id = jo.id
  WHERE a.candidate_id = p_candidate_id
    AND (p_current_application_id IS NULL OR a.id != p_current_application_id)
  ORDER BY a.created_at DESC;
END;
$$;

-- Ajouter un commentaire
COMMENT ON FUNCTION get_candidate_application_history IS 
'Récupère l''historique complet des candidatures d''un candidat, incluant les campagnes précédentes';

-- Donner les permissions appropriées
GRANT EXECUTE ON FUNCTION get_candidate_application_history TO authenticated;
