-- Migration pour gérer le statut des candidats internes sans email SEEG
-- Date: 2025-01-10

-- 1. Mettre à jour le trigger pour définir automatiquement le statut "en_attente"
-- pour les candidats internes sans email SEEG
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_candidate_status TEXT;
  v_no_seeg_email BOOLEAN;
  v_statut TEXT;
BEGIN
  -- Récupérer les informations du candidat
  v_candidate_status := NEW.raw_user_meta_data->>'candidate_status';
  v_no_seeg_email := COALESCE((NEW.raw_user_meta_data->>'no_seeg_email')::BOOLEAN, FALSE);
  
  -- Déterminer le statut automatiquement
  -- Si candidat interne SANS email SEEG → 'en_attente' (requiert validation manuelle)
  -- Sinon → 'actif'
  IF v_candidate_status = 'interne' AND v_no_seeg_email = TRUE THEN
    v_statut := 'en_attente';
  ELSE
    v_statut := COALESCE(NEW.raw_user_meta_data->>'statut', 'actif');
  END IF;

  INSERT INTO public.users (
    id, 
    email, 
    role,
    first_name, 
    last_name, 
    phone,
    matricule,
    date_of_birth,
    sexe,
    adresse,
    candidate_status,
    statut,
    poste_actuel,
    annees_experience,
    no_seeg_email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidat'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'matricule',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
    NEW.raw_user_meta_data->>'sexe',
    NEW.raw_user_meta_data->>'adresse',
    v_candidate_status,
    v_statut,  -- ✅ Statut déterminé automatiquement
    NEW.raw_user_meta_data->>'poste_actuel',
    (NEW.raw_user_meta_data->>'annees_experience')::INTEGER,
    v_no_seeg_email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    matricule = COALESCE(EXCLUDED.matricule, public.users.matricule),
    date_of_birth = COALESCE(EXCLUDED.date_of_birth, public.users.date_of_birth),
    sexe = COALESCE(EXCLUDED.sexe, public.users.sexe),
    adresse = COALESCE(EXCLUDED.adresse, public.users.adresse),
    candidate_status = COALESCE(EXCLUDED.candidate_status, public.users.candidate_status),
    statut = COALESCE(EXCLUDED.statut, public.users.statut),
    poste_actuel = COALESCE(EXCLUDED.poste_actuel, public.users.poste_actuel),
    annees_experience = COALESCE(EXCLUDED.annees_experience, public.users.annees_experience),
    no_seeg_email = COALESCE(EXCLUDED.no_seeg_email, public.users.no_seeg_email),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer une table pour les notifications d'accès en attente
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  matricule TEXT,
  request_type TEXT DEFAULT 'internal_no_seeg_email',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_user_id ON public.access_requests(user_id);

-- Activer RLS
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Politique : Seuls les admins peuvent voir toutes les demandes
DROP POLICY IF EXISTS "Admins can view all access requests" ON public.access_requests;
CREATE POLICY "Admins can view all access requests"
  ON public.access_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruteur')
    )
  );

-- Politique : Les utilisateurs peuvent voir leurs propres demandes
DROP POLICY IF EXISTS "Users can view own access requests" ON public.access_requests;
CREATE POLICY "Users can view own access requests"
  ON public.access_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Créer un trigger pour enregistrer automatiquement les demandes d'accès
CREATE OR REPLACE FUNCTION public.log_access_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Si candidat interne sans email SEEG et statut en_attente
  IF NEW.candidate_status = 'interne' 
     AND NEW.no_seeg_email = TRUE 
     AND NEW.statut = 'en_attente' THEN
    
    -- Enregistrer la demande d'accès
    INSERT INTO public.access_requests (
      user_id,
      email,
      first_name,
      last_name,
      phone,
      matricule,
      request_type,
      status
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.first_name,
      NEW.last_name,
      NEW.phone,
      NEW.matricule,
      'internal_no_seeg_email',
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table users
DROP TRIGGER IF EXISTS log_access_request_trigger ON public.users;
CREATE TRIGGER log_access_request_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_access_request();

-- 4. Fonction pour approuver une demande d'accès
CREATE OR REPLACE FUNCTION public.approve_access_request(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_sexe VARCHAR(1);
BEGIN
  -- Vérifier que l'utilisateur connecté est admin/recruteur
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'recruteur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- Récupérer les informations du candidat
  SELECT 
    ar.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.sexe
  INTO 
    v_user_id,
    v_user_email,
    v_first_name,
    v_last_name,
    v_sexe
  FROM public.access_requests ar
  JOIN public.users u ON ar.user_id = u.id
  WHERE ar.id = request_id;

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
    reviewed_by = auth.uid()
  WHERE id = request_id;

  -- Déclencher l'envoi de l'email de validation (via webhook ou notification)
  -- Note: L'envoi réel de l'email se fera via l'API frontend
  -- On peut créer une entrée dans une table de notifications si besoin
  INSERT INTO public.email_notifications (
    user_id,
    email_type,
    recipient_email,
    data,
    status
  ) VALUES (
    v_user_id,
    'access_approved',
    v_user_email,
    jsonb_build_object(
      'firstName', v_first_name,
      'lastName', v_last_name,
      'sexe', v_sexe
    ),
    'pending'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.approve_access_request(UUID) TO authenticated;

-- 5. Fonction pour rejeter une demande d'accès
CREATE OR REPLACE FUNCTION public.reject_access_request(request_id UUID)
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

  -- Mettre à jour le statut de la demande
  UPDATE public.access_requests
  SET 
    status = 'rejected',
    reviewed_at = NOW(),
    reviewed_by = auth.uid()
  WHERE id = request_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.reject_access_request(UUID) TO authenticated;

-- 6. Vue pour lister les demandes d'accès en attente
CREATE OR REPLACE VIEW public.pending_access_requests AS
SELECT 
  ar.id,
  ar.user_id,
  ar.email,
  ar.first_name,
  ar.last_name,
  ar.phone,
  ar.matricule,
  ar.request_type,
  ar.status,
  ar.created_at,
  u.statut as user_status
FROM public.access_requests ar
JOIN public.users u ON ar.user_id = u.id
WHERE ar.status = 'pending'
ORDER BY ar.created_at DESC;

GRANT SELECT ON public.pending_access_requests TO authenticated;
