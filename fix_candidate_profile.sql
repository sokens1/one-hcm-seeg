-- Script pour vérifier et corriger les données du candidat problématique
-- ID du candidat: 73318a9e-5113-4fa5-9d3c-5046ae9229e7

-- 1. Vérifier les données utilisateur de base
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.phone,
  u.date_of_birth,
  u.created_at
FROM public.users u 
WHERE u.id = '73318a9e-5113-4fa5-9d3c-5046ae9229e7';

-- 2. Vérifier si ce candidat a un profil dans candidate_profiles
SELECT 
  cp.*
FROM public.candidate_profiles cp
WHERE cp.user_id = '73318a9e-5113-4fa5-9d3c-5046ae9229e7';

-- 3. Vérifier sa candidature pour récupérer les données MTP
SELECT 
  a.id,
  a.candidate_id,
  a.job_offer_id,
  a.mtp_answers,
  a.created_at,
  jo.title as job_title
FROM public.applications a
JOIN public.job_offers jo ON jo.id = a.job_offer_id
WHERE a.candidate_id = '73318a9e-5113-4fa5-9d3c-5046ae9229e7';

-- 4. Si le profil n'existe pas, créer un profil de base (à adapter selon les vraies données)
-- INSERT INTO public.candidate_profiles (user_id, gender, current_position, years_experience)
-- VALUES ('73318a9e-5113-4fa5-9d3c-5046ae9229e7', 'Homme', 'Poste à définir', 0)
-- ON CONFLICT (user_id) DO NOTHING;
