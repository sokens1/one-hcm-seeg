-- Migration : Ajout d'une table d'historique des statuts (version finale)
-- Date : 2025-01-20
-- Description : Table pour stocker l'historique des changements de statut des candidatures

-- Créer la table d'historique des statuts
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- Créer un index pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_application_status_history_application_id 
ON public.application_status_history(application_id);

CREATE INDEX IF NOT EXISTS idx_application_status_history_changed_at 
ON public.application_status_history(changed_at DESC);

-- Fonction pour enregistrer automatiquement les changements de statut
CREATE OR REPLACE FUNCTION public.record_status_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Enregistrer le changement de statut seulement si le statut a vraiment changé
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.application_status_history (
      application_id,
      previous_status,
      new_status,
      changed_by,
      changed_at,
      reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NULL,
      NOW(),
      'Status change via application update'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour enregistrer automatiquement les changements
DROP TRIGGER IF EXISTS trigger_record_status_change ON public.applications;
CREATE TRIGGER trigger_record_status_change
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.record_status_change();

-- Accorder les permissions
GRANT SELECT, INSERT ON public.application_status_history TO authenticated;
GRANT SELECT, INSERT ON public.application_status_history TO anon;
