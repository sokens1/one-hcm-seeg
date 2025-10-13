-- Migration pour corriger les fonctions approve/reject sans la table email_notifications

-- 1. Fonction pour approuver une demande d'accès (SANS email_notifications)
CREATE OR REPLACE FUNCTION public.approve_access_request(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id TEXT;
  v_email TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (auth.uid())::text 
    AND role IN ('admin', 'recruteur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Récupérer les infos de la demande
  SELECT user_id, email, first_name, last_name
  INTO v_user_id, v_email, v_first_name, v_last_name
  FROM public.access_requests
  WHERE id = request_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Demande non trouvée';
  END IF;

  -- Mettre à jour le statut de l'utilisateur à 'actif'
  UPDATE public.users
  SET statut = 'actif', updated_at = NOW()
  WHERE id = v_user_id;

  -- Mettre à jour le statut de la demande
  UPDATE public.access_requests
  SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = (auth.uid())::text
  WHERE id = request_id;

  -- Note: L'email est envoyé par le frontend via l'API /send-access-approved-email

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fonction pour rejeter une demande d'accès (SANS email_notifications)
CREATE OR REPLACE FUNCTION public.reject_access_request(request_id UUID, p_rejection_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id TEXT;
  v_email TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (auth.uid())::text 
    AND role IN ('admin', 'recruteur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Récupérer les infos de la demande
  SELECT user_id, email, first_name, last_name
  INTO v_user_id, v_email, v_first_name, v_last_name
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
    reviewed_by = (auth.uid())::text
  WHERE id = request_id;

  -- Note: L'email est envoyé par le frontend via l'API /send-access-rejected-email

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Révoquer et regrant les permissions
REVOKE EXECUTE ON FUNCTION public.approve_access_request(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.approve_access_request(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reject_access_request(UUID, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.reject_access_request(UUID, TEXT) TO authenticated;

