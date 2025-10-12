-- Migration pour corriger les foreign keys et les triggers qui bloquent
-- 1. Supprimer les users
-- 2. Inscription de nouveaux users

-- ============================================
-- PARTIE 1 : Corriger les Foreign Keys
-- ============================================

-- 1.1 Modifier la foreign key reviewed_by pour permettre SET NULL lors de la suppression
ALTER TABLE public.access_requests 
DROP CONSTRAINT IF EXISTS access_requests_reviewed_by_fkey;

ALTER TABLE public.access_requests 
ADD CONSTRAINT access_requests_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) 
REFERENCES public.users(id) 
ON DELETE SET NULL;  -- Au lieu de RESTRICT

-- 1.2 La foreign key user_id doit rester CASCADE (si user supprimé, ses demandes aussi)
-- Vérifier qu'elle est bien en CASCADE
ALTER TABLE public.access_requests 
DROP CONSTRAINT IF EXISTS access_requests_user_id_fkey;

ALTER TABLE public.access_requests 
ADD CONSTRAINT access_requests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- ============================================
-- PARTIE 2 : Corriger les Triggers pour l'Inscription
-- ============================================

-- 2.1 Réécrire le trigger handle_new_user de manière ULTRA-SAFE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_candidate_status TEXT;
  v_no_seeg_email BOOLEAN;
  v_statut TEXT;
  v_role TEXT;
BEGIN
  -- Valeurs par défaut sécurisées
  v_candidate_status := COALESCE(NEW.raw_user_meta_data->>'candidate_status', 'externe');
  v_no_seeg_email := COALESCE((NEW.raw_user_meta_data->>'no_seeg_email')::BOOLEAN, FALSE);
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'candidat');
  
  -- Déterminer le statut
  IF v_candidate_status = 'interne' AND v_no_seeg_email = TRUE THEN
    v_statut := 'en_attente';
  ELSE
    v_statut := COALESCE(NEW.raw_user_meta_data->>'statut', 'actif');
  END IF;

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

-- 2.2 Corriger sync_candidate_profile
CREATE OR REPLACE FUNCTION public.sync_candidate_profile()
RETURNS TRIGGER AS $$
BEGIN
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
        RAISE WARNING 'sync_candidate_profile - Erreur pour %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.3 Corriger log_access_request
CREATE OR REPLACE FUNCTION public.log_access_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.candidate_status = 'interne' 
     AND NEW.no_seeg_email = TRUE 
     AND NEW.statut = 'en_attente' THEN
    
    BEGIN
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
        RAISE WARNING 'log_access_request - Erreur pour %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PARTIE 3 : Vérifications et Logs
-- ============================================

-- 3.1 Afficher les foreign keys actuelles
DO $$
DECLARE
  fk_record RECORD;
BEGIN
  RAISE NOTICE '=== Foreign Keys sur access_requests ===';
  FOR fk_record IN 
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    LEFT JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'access_requests'
  LOOP
    RAISE NOTICE 'FK: % (%) → %.% [ON DELETE %]', 
      fk_record.constraint_name,
      fk_record.column_name,
      fk_record.foreign_table_name,
      fk_record.foreign_column_name,
      fk_record.delete_rule;
  END LOOP;
END $$;

-- 3.2 Vérifier que tous les users ont un statut
DO $$
DECLARE
  users_without_status INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_without_status
  FROM public.users
  WHERE statut IS NULL;
  
  IF users_without_status > 0 THEN
    RAISE NOTICE 'Correction: % utilisateurs sans statut → statut = actif', users_without_status;
    UPDATE public.users SET statut = 'actif' WHERE statut IS NULL;
  ELSE
    RAISE NOTICE '✅ Tous les utilisateurs ont un statut';
  END IF;
END $$;

