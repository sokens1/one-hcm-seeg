-- Migration pour ajouter le champ rejection_reason à access_requests
-- Cette migration est idempotente et peut être exécutée plusieurs fois

-- Ajouter le champ rejection_reason s'il n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'access_requests' 
    AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.access_requests 
    ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- Mettre à jour la fonction reject_access_request pour accepter le motif
CREATE OR REPLACE FUNCTION public.reject_access_request(request_id UUID, p_rejection_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'recruteur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Récupérer l'user_id de la demande
  SELECT user_id INTO v_user_id
  FROM public.access_requests
  WHERE id = request_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Demande non trouvée';
  END IF;

  -- Mettre à jour le statut de l'utilisateur à 'bloqué'
  UPDATE public.users
  SET statut = 'bloqué', updated_at = NOW()
  WHERE id = v_user_id;

  -- Mettre à jour le statut de la demande avec le motif
  UPDATE public.access_requests
  SET 
    status = 'rejected',
    rejection_reason = p_rejection_reason,
    reviewed_at = NOW(),
    reviewed_by = auth.uid()
  WHERE id = request_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Révoquer et regrant les permissions
REVOKE EXECUTE ON FUNCTION public.reject_access_request(UUID, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.reject_access_request(UUID, TEXT) TO authenticated;

