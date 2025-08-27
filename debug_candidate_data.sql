-- Script de diagnostic pour vérifier les données candidat
-- Remplacez 'EMAIL_DU_CANDIDAT' par l'email réel du candidat problématique

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
WHERE u.email = 'EMAIL_DU_CANDIDAT' OR u.role = 'candidat'
ORDER BY u.created_at DESC
LIMIT 10;

-- 2. Vérifier les données de profil candidat
SELECT 
  cp.user_id,
  cp.gender,
  cp.birth_date,
  cp.current_position,
  cp.years_experience,
  cp.address,
  cp.created_at,
  cp.updated_at
FROM public.candidate_profiles cp
JOIN public.users u ON u.id = cp.user_id
WHERE u.email = 'EMAIL_DU_CANDIDAT' OR u.role = 'candidat'
ORDER BY cp.created_at DESC
LIMIT 10;

-- 3. Vérifier les candidatures récentes
SELECT 
  a.id,
  a.candidate_id,
  a.job_offer_id,
  a.status,
  a.created_at,
  u.email,
  u.first_name,
  u.last_name,
  jo.title as job_title
FROM public.applications a
JOIN public.users u ON u.id = a.candidate_id
JOIN public.job_offers jo ON jo.id = a.job_offer_id
WHERE u.email = 'EMAIL_DU_CANDIDAT' OR a.created_at > NOW() - INTERVAL '24 hours'
ORDER BY a.created_at DESC
LIMIT 10;

-- 4. Test de la fonction RPC pour un candidat spécifique
-- Remplacez 'JOB_OFFER_ID' par l'ID de l'offre concernée
SELECT * FROM public.get_recruiter_applications('JOB_OFFER_ID');
