-- Migration pour ajouter les champs d'inscription candidat
-- Date: 2025-01-10

-- 1. Rendre le matricule optionnel (nullable) s'il existe déjà
DO $$ 
BEGIN
  ALTER TABLE public.users ALTER COLUMN matricule DROP NOT NULL;
EXCEPTION 
  WHEN undefined_column THEN NULL;
  WHEN others THEN NULL;
END $$;

-- 2. Ajouter les colonnes manquantes à la table users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS sexe VARCHAR(1),
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS candidate_status VARCHAR(10),
ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'actif',
ADD COLUMN IF NOT EXISTS poste_actuel TEXT,
ADD COLUMN IF NOT EXISTS annees_experience INTEGER,
ADD COLUMN IF NOT EXISTS no_seeg_email BOOLEAN DEFAULT FALSE;

-- 2.1 Nettoyer les données existantes invalides
-- Mettre à NULL les valeurs de sexe qui ne sont pas 'M' ou 'F'
UPDATE public.users 
SET sexe = NULL 
WHERE sexe IS NOT NULL 
  AND sexe NOT IN ('M', 'F');

-- Mettre à NULL les valeurs de candidate_status invalides
UPDATE public.users 
SET candidate_status = NULL 
WHERE candidate_status IS NOT NULL 
  AND candidate_status NOT IN ('interne', 'externe');

-- Corriger les valeurs de statut invalides (mettre 'actif' par défaut)
UPDATE public.users 
SET statut = 'actif' 
WHERE statut IS NOT NULL 
  AND statut NOT IN ('actif', 'inactif', 'en_attente', 'bloqué', 'archivé');

-- S'assurer que tous les utilisateurs ont un statut (actif par défaut)
UPDATE public.users 
SET statut = 'actif' 
WHERE statut IS NULL;

-- Supprimer les anciennes contraintes si elles existent (pour éviter les conflits)
DO $$ 
BEGIN
  -- Supprimer ancienne contrainte sexe si elle existe
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_sexe_check;
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_candidate_status_check;
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_statut_check;
EXCEPTION 
  WHEN undefined_object THEN NULL;
END $$;

-- Ajouter les nouvelles contraintes CHECK
ALTER TABLE public.users
ADD CONSTRAINT users_sexe_check CHECK (sexe IS NULL OR sexe IN ('M', 'F'));

ALTER TABLE public.users
ADD CONSTRAINT users_candidate_status_check CHECK (candidate_status IS NULL OR candidate_status IN ('interne', 'externe'));

ALTER TABLE public.users
ADD CONSTRAINT users_statut_check CHECK (statut IS NULL OR statut IN ('actif', 'inactif', 'en_attente', 'bloqué', 'archivé'));

-- 3. Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_candidate_status ON public.users(candidate_status);
CREATE INDEX IF NOT EXISTS idx_users_statut ON public.users(statut);
CREATE INDEX IF NOT EXISTS idx_users_matricule ON public.users(matricule) WHERE matricule IS NOT NULL;

-- 4. Mettre à jour le trigger pour gérer les nouveaux champs lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    NEW.raw_user_meta_data->>'candidate_status',
    COALESCE(NEW.raw_user_meta_data->>'statut', 'actif'),
    NEW.raw_user_meta_data->>'poste_actuel',
    (NEW.raw_user_meta_data->>'annees_experience')::INTEGER,
    (NEW.raw_user_meta_data->>'no_seeg_email')::BOOLEAN,
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

-- 5. Recréer le trigger si nécessaire
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Ajouter des commentaires pour la documentation
COMMENT ON COLUMN public.users.date_of_birth IS 'Date de naissance du candidat';
COMMENT ON COLUMN public.users.sexe IS 'Sexe du candidat (M ou F)';
COMMENT ON COLUMN public.users.adresse IS 'Adresse complète du candidat';
COMMENT ON COLUMN public.users.candidate_status IS 'Statut du candidat: interne (employé SEEG) ou externe';
COMMENT ON COLUMN public.users.statut IS 'Statut du compte: actif, inactif, en_attente, bloqué, archivé';
COMMENT ON COLUMN public.users.poste_actuel IS 'Poste actuel du candidat';
COMMENT ON COLUMN public.users.annees_experience IS 'Années d''expérience à la SEEG ou secteur similaire';
COMMENT ON COLUMN public.users.no_seeg_email IS 'Indique si le candidat interne n''a pas d''email SEEG';
COMMENT ON COLUMN public.users.matricule IS 'Matricule SEEG (optionnel, uniquement pour les internes)';

-- 7. Mettre à jour les politiques RLS (Row Level Security) si nécessaire
-- Commenté temporairement pour déboguer l'erreur UUID
/*
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING ((auth.uid())::uuid = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING ((auth.uid())::uuid = id)
  WITH CHECK ((auth.uid())::uuid = id);
*/

-- 8. Créer une fonction pour valider le format de l'email SEEG pour les internes
CREATE OR REPLACE FUNCTION public.validate_candidate_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Si candidat interne sans exception et email ne finit pas par @seeg.com
  IF NEW.candidate_status = 'interne' 
     AND (NEW.no_seeg_email IS NULL OR NEW.no_seeg_email = FALSE)
     AND NEW.email NOT LIKE '%@seeg.com' THEN
    RAISE EXCEPTION 'Les candidats internes doivent avoir un email @seeg.com ou cocher "Je n''ai pas d''email professionnel SEEG"';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Créer le trigger de validation
DROP TRIGGER IF EXISTS validate_candidate_email_trigger ON public.users;
CREATE TRIGGER validate_candidate_email_trigger
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_candidate_email();

-- 10. Créer une vue pour les statistiques des candidats
CREATE OR REPLACE VIEW public.candidate_statistics AS
SELECT 
  candidate_status,
  statut,
  sexe,
  COUNT(*) as count,
  AVG(annees_experience) as avg_experience
FROM public.users
WHERE role = 'candidat'
GROUP BY candidate_status, statut, sexe;

-- Accorder les permissions sur la vue
GRANT SELECT ON public.candidate_statistics TO authenticated;

-- 11. Fonction helper pour récupérer le profil complet d'un candidat
CREATE OR REPLACE FUNCTION public.get_candidate_profile(candidate_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  matricule TEXT,
  date_of_birth DATE,
  sexe VARCHAR(1),
  adresse TEXT,
  candidate_status VARCHAR(10),
  statut VARCHAR(20),
  poste_actuel TEXT,
  annees_experience INTEGER,
  no_seeg_email BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.matricule,
    u.date_of_birth,
    u.sexe,
    u.adresse,
    u.candidate_status,
    u.statut,
    u.poste_actuel,
    u.annees_experience,
    u.no_seeg_email,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.id = candidate_id
    AND u.role = 'candidat'
    AND (u.id = (auth.uid())::uuid OR EXISTS (
      SELECT 1 FROM public.users admin 
      WHERE admin.id = (auth.uid())::uuid 
      AND admin.role IN ('admin', 'recruteur')
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION public.get_candidate_profile(UUID) TO authenticated;

-- 12. Fonction pour mettre à jour le profil candidat
CREATE OR REPLACE FUNCTION public.update_candidate_profile(
  candidate_id UUID,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_sexe VARCHAR(1) DEFAULT NULL,
  p_adresse TEXT DEFAULT NULL,
  p_poste_actuel TEXT DEFAULT NULL,
  p_annees_experience INTEGER DEFAULT NULL,
  p_statut VARCHAR(20) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur peut modifier ce profil
  -- Les candidats peuvent modifier leur profil, les admins/recruteurs peuvent modifier tous les profils
  IF (auth.uid())::uuid != candidate_id AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (auth.uid())::uuid 
    AND role IN ('admin', 'recruteur')
  ) THEN
    RAISE EXCEPTION 'Non autorisé à modifier ce profil';
  END IF;

  UPDATE public.users
  SET
    first_name = COALESCE(p_first_name, first_name),
    last_name = COALESCE(p_last_name, last_name),
    phone = COALESCE(p_phone, phone),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    sexe = COALESCE(p_sexe, sexe),
    adresse = COALESCE(p_adresse, adresse),
    poste_actuel = COALESCE(p_poste_actuel, poste_actuel),
    annees_experience = COALESCE(p_annees_experience, annees_experience),
    statut = COALESCE(p_statut, statut),
    updated_at = NOW()
  WHERE id = candidate_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.update_candidate_profile TO authenticated;
