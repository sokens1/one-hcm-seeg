-- CORRECTION : Mise à jour de la fonction handle_new_user pour récupérer tous les champs d'inscription
-- + Normaliser matricule vide en NULL via NULLIF
-- + Vérifier/assurer le trigger sur auth.users

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
  IF v_role = 'recruiter' THEN v_role := 'recruteur'; END IF;
  IF v_role = 'candidate' THEN v_role := 'candidat'; END IF;

  -- Gérer le candidate_status et no_seeg_email
  v_candidate_status := COALESCE(NEW.raw_user_meta_data->>'candidate_status', '');
  v_no_seeg_email := COALESCE((NEW.raw_user_meta_data->>'no_seeg_email')::BOOLEAN, FALSE);
  IF v_candidate_status = 'interne' AND v_no_seeg_email THEN v_statut := 'en_attente'; END IF;

  -- Politique de confidentialité
  v_politique_confidentialite := COALESCE((NEW.raw_user_meta_data->>'politique_confidentialite')::BOOLEAN, FALSE);

  -- Nettoyer rôle
  v_role := TRIM(BOTH FROM REGEXP_REPLACE(v_role, E'[\r\n\t]+', '', 'g'));
  v_role := LOWER(TRIM(v_role));

  BEGIN
    INSERT INTO public.users (
      id, email, role,
      first_name, last_name, phone,
      matricule, date_of_birth, sexe, adresse,
      candidate_status, statut,
      poste_actuel, annees_experience,
      no_seeg_email, politique_confidentialite,
      created_at, updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      v_role,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.raw_user_meta_data->>'phone',
      NULLIF(NEW.raw_user_meta_data->>'matricule', ''),
      NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '')::DATE,
      NEW.raw_user_meta_data->>'sexe',
      NEW.raw_user_meta_data->>'adresse',
      v_candidate_status,
      v_statut,
      NEW.raw_user_meta_data->>'poste_actuel',
      NULLIF(NEW.raw_user_meta_data->>'annees_experience', '')::INTEGER,
      v_no_seeg_email,
      v_politique_confidentialite,
      NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      role = COALESCE(public.users.role, EXCLUDED.role),
      first_name = COALESCE(public.users.first_name, EXCLUDED.first_name),
      last_name = COALESCE(public.users.last_name, EXCLUDED.last_name),
      phone = COALESCE(public.users.phone, EXCLUDED.phone),
      matricule = COALESCE(public.users.matricule, EXCLUDED.matricule),
      date_of_birth = COALESCE(public.users.date_of_birth, EXCLUDED.date_of_birth),
      sexe = COALESCE(public.users.sexe, EXCLUDED.sexe),
      adresse = COALESCE(public.users.adresse, EXCLUDED.adresse),
      candidate_status = COALESCE(public.users.candidate_status, EXCLUDED.candidate_status),
      statut = COALESCE(public.users.statut, EXCLUDED.statut),
      poste_actuel = COALESCE(public.users.poste_actuel, EXCLUDED.poste_actuel),
      annees_experience = COALESCE(public.users.annees_experience, EXCLUDED.annees_experience),
      no_seeg_email = COALESCE(public.users.no_seeg_email, EXCLUDED.no_seeg_email),
      politique_confidentialite = COALESCE(public.users.politique_confidentialite, EXCLUDED.politique_confidentialite),
      updated_at = NOW();
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user - Erreur pour user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- S'assurer que l'unicité de matricule ignore les NULL
DO $$
BEGIN
  -- Supprimer la contrainte unique existante si elle existe (les contraintes uniques créent un index sous-jacent)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema='public' AND table_name='users' AND constraint_name='users_matricule_key'
  ) THEN
    EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_matricule_key';
  END IF;

  -- Supprimer l'ancien index partiel si présent pour recréer proprement
  EXECUTE 'DROP INDEX IF EXISTS users_matricule_unique';

  -- Créer l'index unique partiel (n'applique l'unicité que lorsque matricule n''est pas NULL)
  EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS users_matricule_unique ON public.users (matricule) WHERE matricule IS NOT NULL';
END $$;

-- S'assurer que le trigger d'inscription est bien présent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Nettoyage des matricules vides existants
UPDATE public.users SET matricule = NULL WHERE matricule IS NULL OR btrim(matricule) = '';

-- Statut
SELECT 'Fonction et contraintes mises à jour' AS status;
