-- Migration pour créer automatiquement les profils candidats manquants
-- à partir des données utilisateur existantes

-- Créer des profils candidats pour tous les candidats qui n'en ont pas
INSERT INTO public.candidate_profiles (user_id, current_position, years_experience)
SELECT 
  u.id,
  'Non renseigné' as current_position,
  0 as years_experience
FROM public.users u
LEFT JOIN public.candidate_profiles cp ON cp.user_id = u.id
WHERE u.role = 'candidat' 
  AND cp.user_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.applications a WHERE a.candidate_id = u.id
  );

-- Mettre à jour les dates de naissance depuis la table users vers candidate_profiles
UPDATE public.candidate_profiles 
SET birth_date = u.date_of_birth
FROM public.users u
WHERE candidate_profiles.user_id = u.id 
  AND u.date_of_birth IS NOT NULL 
  AND candidate_profiles.birth_date IS NULL;
