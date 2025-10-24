-- Migration : Fonction pour récupérer le statut précédent d'un candidat refusé
-- Date : 2025-01-20
-- Description : Fonction RPC pour récupérer le dernier statut avant "refuse"

-- Fonction pour récupérer le statut précédent d'un candidat refusé
CREATE OR REPLACE FUNCTION public.get_previous_status_before_refuse(
  p_application_id TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  previous_status TEXT;
BEGIN
  -- Récupérer le dernier statut avant "refuse" depuis l'historique
  SELECT previous_status INTO previous_status
  FROM public.application_status_history
  WHERE application_id = p_application_id
    AND new_status = 'refuse'
  ORDER BY changed_at DESC
  LIMIT 1;
  
  -- Si aucun historique trouvé, retourner 'incubation' par défaut
  RETURN COALESCE(previous_status, 'incubation');
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.get_previous_status_before_refuse(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_previous_status_before_refuse(TEXT) TO anon;
