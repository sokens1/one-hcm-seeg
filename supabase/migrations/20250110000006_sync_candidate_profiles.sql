-- Migration pour synchroniser les données users vers candidate_profiles
-- Et créer automatiquement les profils pour les nouveaux candidats

-- 1. Synchroniser les données existantes de users vers candidate_profiles
-- IMPORTANT : Cette migration ne MODIFIE PAS les données existantes dans candidate_profiles
-- Elle crée UNIQUEMENT les profils manquants et remplit les champs NULL
INSERT INTO public.candidate_profiles (
  user_id,
  current_position,
  years_experience,
  gender,
  birth_date,
  address,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.poste_actuel,
  u.annees_experience,  -- INTEGER → INTEGER (pas de cast)
  u.sexe,
  u.date_of_birth,
  u.adresse,
  u.created_at,
  u.updated_at
FROM public.users u
WHERE u.role = 'candidat'
  AND NOT EXISTS (
    SELECT 1 FROM public.candidate_profiles cp 
    WHERE cp.user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;  -- NE PAS ÉCRASER les données existantes

-- 2. Créer une fonction trigger pour synchroniser automatiquement à l'inscription
CREATE OR REPLACE FUNCTION public.sync_candidate_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un candidat, créer/mettre à jour son profil automatiquement
  IF NEW.role = 'candidat' THEN
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
      NEW.annees_experience,  -- INTEGER → INTEGER (pas de cast)
      NEW.sexe,
      NEW.date_of_birth,
      NEW.adresse,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;  -- NE PAS ÉCRASER les données existantes
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger sur la table users
DROP TRIGGER IF EXISTS sync_candidate_profile_trigger ON public.users;
CREATE TRIGGER sync_candidate_profile_trigger
  AFTER INSERT OR UPDATE ON public.users
  FOR EACH ROW
  WHEN (NEW.role = 'candidat')
  EXECUTE FUNCTION public.sync_candidate_profile();

-- 4. Mettre à jour UNIQUEMENT les profils avec des champs NULL (sans écraser les données existantes)
-- SÉCURITÉ : On ne met à jour QUE les champs qui sont NULL
UPDATE public.candidate_profiles cp
SET 
  current_position = CASE WHEN cp.current_position IS NULL THEN u.poste_actuel ELSE cp.current_position END,
  years_experience = CASE WHEN cp.years_experience IS NULL THEN u.annees_experience ELSE cp.years_experience END,
  gender = CASE WHEN cp.gender IS NULL THEN u.sexe ELSE cp.gender END,
  birth_date = CASE WHEN cp.birth_date IS NULL THEN u.date_of_birth ELSE cp.birth_date END,
  address = CASE WHEN cp.address IS NULL THEN u.adresse ELSE cp.address END,
  updated_at = NOW()
FROM public.users u
WHERE cp.user_id = u.id
  AND u.role = 'candidat'
  AND (
    cp.current_position IS NULL OR 
    cp.years_experience IS NULL OR
    cp.gender IS NULL OR 
    cp.birth_date IS NULL OR 
    cp.address IS NULL
  );

-- 5. Commentaires pour documentation
COMMENT ON FUNCTION public.sync_candidate_profile() IS 'Synchronise automatiquement les données de users vers candidate_profiles lors de l''inscription ou mise à jour';

-- 6. Afficher les statistiques de synchronisation
DO $$
DECLARE
  total_users INTEGER;
  total_profiles INTEGER;
  synced_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM public.users WHERE role = 'candidat';
  SELECT COUNT(*) INTO total_profiles FROM public.candidate_profiles;
  
  synced_count := total_profiles;
  
  RAISE NOTICE '=== Synchronisation Candidate Profiles ===';
  RAISE NOTICE 'Total candidats dans users: %', total_users;
  RAISE NOTICE 'Total profils créés: %', total_profiles;
  RAISE NOTICE '✅ Synchronisation terminée';
END $$;

