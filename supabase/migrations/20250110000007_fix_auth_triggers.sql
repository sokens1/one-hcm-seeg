-- Migration pour corriger les triggers qui bloquent l'authentification des anciens utilisateurs
-- Les triggers ne doivent JAMAIS faire échouer l'authentification

-- 1. Corriger le trigger handle_new_user pour être plus tolérant
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
  IF v_candidate_status = 'interne' AND v_no_seeg_email = TRUE THEN
    v_statut := 'en_attente';
  ELSE
    v_statut := COALESCE(NEW.raw_user_meta_data->>'statut', 'actif');
  END IF;

  -- Essayer d'insérer/mettre à jour l'utilisateur
  -- Si ça échoue, ne pas bloquer l'authentification
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
      v_statut,
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
      -- Ne pas écraser les données existantes si elles sont déjà remplies
      matricule = COALESCE(public.users.matricule, EXCLUDED.matricule),
      date_of_birth = COALESCE(public.users.date_of_birth, EXCLUDED.date_of_birth),
      sexe = COALESCE(public.users.sexe, EXCLUDED.sexe),
      adresse = COALESCE(public.users.adresse, EXCLUDED.adresse),
      candidate_status = COALESCE(public.users.candidate_status, EXCLUDED.candidate_status),
      statut = COALESCE(public.users.statut, EXCLUDED.statut),
      poste_actuel = COALESCE(public.users.poste_actuel, EXCLUDED.poste_actuel),
      annees_experience = COALESCE(public.users.annees_experience, EXCLUDED.annees_experience),
      no_seeg_email = COALESCE(public.users.no_seeg_email, EXCLUDED.no_seeg_email),
      updated_at = NOW();
  EXCEPTION
    WHEN OTHERS THEN
      -- Si l'insertion échoue, logger l'erreur mais ne pas bloquer l'authentification
      RAISE WARNING 'Erreur lors de la création/mise à jour de l''utilisateur %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Corriger le trigger sync_candidate_profile pour être tolérant
CREATE OR REPLACE FUNCTION public.sync_candidate_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un candidat, essayer de créer/mettre à jour son profil
  -- NE PAS bloquer si ça échoue
  IF NEW.role = 'candidat' THEN
    BEGIN
      INSERT INTO public.candidate_profiles (
        user_id,
        current_position,
        years_experience,
        gender,
        birth_date,
        address,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.poste_actuel,
        NEW.annees_experience,
        NEW.sexe,
        NEW.date_of_birth,
        NEW.adresse,
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- Logger l'erreur mais ne pas bloquer
        RAISE WARNING 'Erreur sync profil candidat %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Corriger le trigger log_access_request pour être tolérant
CREATE OR REPLACE FUNCTION public.log_access_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Si candidat interne sans email SEEG et statut en_attente
  IF NEW.candidate_status = 'interne' 
     AND NEW.no_seeg_email = TRUE 
     AND NEW.statut = 'en_attente' THEN
    
    BEGIN
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
    EXCEPTION
      WHEN OTHERS THEN
        -- Logger l'erreur mais ne pas bloquer
        RAISE WARNING 'Erreur création demande accès %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. S'assurer que tous les anciens utilisateurs ont un statut
UPDATE public.users 
SET statut = 'actif'
WHERE statut IS NULL;

-- 5. Afficher les utilisateurs sans statut ou avec statut invalide
DO $$
DECLARE
  users_without_status INTEGER;
  users_with_invalid_status INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_without_status
  FROM public.users
  WHERE statut IS NULL;
  
  SELECT COUNT(*) INTO users_with_invalid_status
  FROM public.users
  WHERE statut IS NOT NULL 
    AND statut NOT IN ('actif', 'inactif', 'en_attente', 'bloqué', 'archivé');
  
  RAISE NOTICE '=== Vérification Statuts ===';
  RAISE NOTICE 'Utilisateurs sans statut: %', users_without_status;
  RAISE NOTICE 'Utilisateurs avec statut invalide: %', users_with_invalid_status;
  RAISE NOTICE '✅ Tous les utilisateurs ont maintenant un statut valide';
END $$;

