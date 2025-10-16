-- Migration : Ajout de la colonne politique_confidentialite à la table users
-- Date : 2025-10-16
-- Description : Ajoute un champ pour tracker l'acceptation de la politique de confidentialité

-- 1. Ajouter la colonne politique_confidentialite à la table users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS politique_confidentialite BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Mettre à jour tous les utilisateurs existants à TRUE par défaut
UPDATE public.users 
SET politique_confidentialite = TRUE 
WHERE politique_confidentialite = FALSE;

-- 3. Créer un commentaire sur la colonne pour la documentation
COMMENT ON COLUMN public.users.politique_confidentialite IS 
'Indique si l''utilisateur a accepté la politique de confidentialité lors de l''inscription';

-- 4. Mettre à jour la fonction handle_new_user pour inclure le nouveau champ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_candidate_status TEXT;
  v_statut TEXT := 'actif';
  v_no_seeg_email BOOLEAN := FALSE;
  v_politique_confidentialite BOOLEAN := FALSE;
BEGIN
  -- Gestion du rôle
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'candidat');
  
  -- Normaliser "recruiter" vers "recruteur"
  IF v_role = 'recruiter' THEN
    v_role := 'recruteur';
  END IF;

  -- Normaliser "candidate" vers "candidat"
  IF v_role = 'candidate' THEN
    v_role := 'candidat';
  END IF;

  -- Gérer le candidate_status
  v_candidate_status := COALESCE(NEW.raw_user_meta_data->>'candidate_status', '');
  v_no_seeg_email := COALESCE((NEW.raw_user_meta_data->>'no_seeg_email')::BOOLEAN, FALSE);

  -- Si c'est un candidat interne sans email SEEG, statut en_attente
  IF v_candidate_status = 'interne' AND v_no_seeg_email THEN
    v_statut := 'en_attente';
  END IF;

  -- Récupérer la valeur de politique_confidentialite
  v_politique_confidentialite := COALESCE((NEW.raw_user_meta_data->>'politique_confidentialite')::BOOLEAN, FALSE);

  -- Nettoyer le rôle (supprimer \r\n)
  v_role := TRIM(BOTH FROM REGEXP_REPLACE(v_role, E'[\\r\\n\\t]+', '', 'g'));
  v_role := LOWER(TRIM(v_role));

  -- Insertion avec gestion d'erreur complète
  BEGIN
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
      politique_confidentialite,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      v_role,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'matricule',
      NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '')::DATE,
      NEW.raw_user_meta_data->>'sexe',
      NEW.raw_user_meta_data->>'adresse',
      v_candidate_status,
      v_statut,
      NEW.raw_user_meta_data->>'poste_actuel',
      NULLIF(NEW.raw_user_meta_data->>'annees_experience', '')::INTEGER,
      v_no_seeg_email,
      v_politique_confidentialite,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      role = COALESCE(public.users.role, EXCLUDED.role),
      first_name = COALESCE(public.users.first_name, EXCLUDED.first_name),
      last_name = COALESCE(public.users.last_name, EXCLUDED.last_name),
      phone = COALESCE(public.users.phone, EXCLUDED.phone),
      statut = COALESCE(public.users.statut, EXCLUDED.statut),
      politique_confidentialite = COALESCE(public.users.politique_confidentialite, EXCLUDED.politique_confidentialite),
      updated_at = NOW();
      
  EXCEPTION
    WHEN OTHERS THEN
      -- NE PAS bloquer l'authentification même si l'insertion échoue
      RAISE WARNING 'handle_new_user - Erreur pour user %: % (SQLSTATE: %)', 
        NEW.id, SQLERRM, SQLSTATE;
      -- Retourner quand même NEW pour que l'auth réussisse
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

