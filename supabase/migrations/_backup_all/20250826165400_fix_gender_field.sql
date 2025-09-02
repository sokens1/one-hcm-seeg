-- Migration pour corriger le champ gender manquant
-- Définir une valeur par défaut pour les candidats existants sans gender

UPDATE public.candidate_profiles 
SET gender = 'Non renseigné'
WHERE gender IS NULL OR gender = '';

-- Alternative: Si vous voulez définir des valeurs par défaut basées sur des patterns de noms
-- (optionnel, à décommenter si souhaité)
-- UPDATE public.candidate_profiles 
-- SET gender = CASE 
--   WHEN u.first_name ILIKE ANY(ARRAY['marie%', 'sophie%', 'claire%', 'anne%', 'isabelle%']) THEN 'Femme'
--   WHEN u.first_name ILIKE ANY(ARRAY['jean%', 'pierre%', 'michel%', 'paul%', 'david%']) THEN 'Homme'
--   ELSE 'Non renseigné'
-- END
-- FROM public.users u
-- WHERE candidate_profiles.user_id = u.id 
--   AND (candidate_profiles.gender IS NULL OR candidate_profiles.gender = '');
