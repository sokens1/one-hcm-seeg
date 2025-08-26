-- Script pour vérifier la récupération des dates de naissance

-- 1. Vérifier les dates de naissance dans la table users
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.date_of_birth as user_birth_date,
  u.created_at
FROM public.users u 
WHERE u.role = 'candidat' 
  AND u.date_of_birth IS NOT NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 2. Vérifier les dates de naissance dans candidate_profiles
SELECT 
  cp.user_id,
  cp.birth_date as profile_birth_date,
  u.email,
  u.date_of_birth as user_birth_date,
  CASE 
    WHEN cp.birth_date IS NULL AND u.date_of_birth IS NOT NULL THEN 'MANQUANT'
    WHEN cp.birth_date = u.date_of_birth THEN 'OK'
    ELSE 'DIFFERENT'
  END as status
FROM public.candidate_profiles cp
JOIN public.users u ON u.id = cp.user_id
WHERE u.role = 'candidat'
ORDER BY u.created_at DESC
LIMIT 10;

-- 3. Compter les candidats avec dates manquantes
SELECT 
  COUNT(*) as total_candidats,
  COUNT(u.date_of_birth) as avec_date_users,
  COUNT(cp.birth_date) as avec_date_profiles,
  COUNT(CASE WHEN u.date_of_birth IS NOT NULL AND cp.birth_date IS NULL THEN 1 END) as dates_manquantes
FROM public.users u
JOIN public.candidate_profiles cp ON cp.user_id = u.id
WHERE u.role = 'candidat';
