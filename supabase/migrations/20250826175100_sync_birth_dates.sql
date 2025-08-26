-- Migration pour synchroniser toutes les dates de naissance depuis users vers candidate_profiles

-- Mettre à jour les dates de naissance manquantes dans candidate_profiles
UPDATE public.candidate_profiles 
SET birth_date = u.date_of_birth
FROM public.users u
WHERE candidate_profiles.user_id = u.id 
  AND u.date_of_birth IS NOT NULL 
  AND (candidate_profiles.birth_date IS NULL OR candidate_profiles.birth_date != u.date_of_birth);

-- Vérification : afficher le nombre de mises à jour
-- Cette requête sera visible dans les logs de migration
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM public.candidate_profiles cp
    JOIN public.users u ON u.id = cp.user_id
    WHERE u.date_of_birth IS NOT NULL 
      AND cp.birth_date = u.date_of_birth;
    
    RAISE NOTICE 'Nombre de profils avec dates de naissance synchronisées: %', updated_count;
END $$;
