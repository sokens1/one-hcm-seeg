-- Script pour vérifier les candidate_status dans la table users

-- 1. Vérifier si la colonne candidate_status existe
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'candidate_status';

-- 2. Vérifier les valeurs de candidate_status pour tous les utilisateurs
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  candidate_status,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 50;

-- 3. Compter les utilisateurs par candidate_status
SELECT 
  candidate_status,
  COUNT(*) as count
FROM users
GROUP BY candidate_status;

-- 4. Vérifier les candidats sans candidate_status défini
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  candidate_status
FROM users
WHERE role = 'candidat' 
  AND (candidate_status IS NULL OR candidate_status = '');

