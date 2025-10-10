-- Migration pour ajouter le système de "vu/non vu" pour les demandes d'accès

-- 1. Ajouter le champ 'viewed' à la table access_requests
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'access_requests' 
    AND column_name = 'viewed'
  ) THEN
    ALTER TABLE public.access_requests 
    ADD COLUMN viewed BOOLEAN DEFAULT FALSE NOT NULL;
  END IF;
END $$;

-- 2. Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_access_requests_viewed 
ON public.access_requests(viewed);

CREATE INDEX IF NOT EXISTS idx_access_requests_status_viewed 
ON public.access_requests(status, viewed);

-- 3. Fonction pour marquer une demande comme vue
CREATE OR REPLACE FUNCTION public.mark_access_request_as_viewed(request_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur/observateur
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (auth.uid())::text 
    AND role IN ('admin', 'recruteur', 'observateur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Marquer la demande comme vue
  UPDATE public.access_requests
  SET viewed = TRUE
  WHERE id = request_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.mark_access_request_as_viewed(UUID) TO authenticated;

-- 4. Fonction pour marquer toutes les demandes comme vues
CREATE OR REPLACE FUNCTION public.mark_all_access_requests_as_viewed()
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur/observateur
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (auth.uid())::text 
    AND role IN ('admin', 'recruteur', 'observateur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Marquer toutes les demandes en attente comme vues
  UPDATE public.access_requests
  SET viewed = TRUE
  WHERE status = 'pending' AND viewed = FALSE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.mark_all_access_requests_as_viewed() TO authenticated;

-- 5. Trigger pour réinitialiser 'viewed' quand une nouvelle demande est créée
CREATE OR REPLACE FUNCTION public.reset_viewed_on_new_request()
RETURNS TRIGGER AS $$
BEGIN
  -- S'assurer que les nouvelles demandes sont marquées comme non vues
  NEW.viewed := FALSE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reset_viewed_on_new_request ON public.access_requests;

CREATE TRIGGER trigger_reset_viewed_on_new_request
  BEFORE INSERT ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_viewed_on_new_request();

-- 6. Mettre à jour les demandes existantes (toutes marquées comme vues par défaut)
UPDATE public.access_requests 
SET viewed = TRUE 
WHERE viewed IS NULL;

