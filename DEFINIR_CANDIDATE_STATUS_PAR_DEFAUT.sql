-- Script pour définir le candidate_status par défaut pour tous les candidats

-- 1. D'abord, vérifier la situation actuelle
SELECT 
  COUNT(*) as total_candidats,
  COUNT(CASE WHEN candidate_status = 'interne' THEN 1 END) as internes,
  COUNT(CASE WHEN candidate_status = 'externe' THEN 1 END) as externes,
  COUNT(CASE WHEN candidate_status IS NULL OR candidate_status = '' THEN 1 END) as sans_statut
FROM users
WHERE role = 'candidat';

-- 2. Afficher les candidats sans statut
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  candidate_status,
  created_at
FROM users
WHERE role = 'candidat' 
  AND (candidate_status IS NULL OR candidate_status = '');

-- 3. Mettre à jour TOUS les candidats sans statut défini à 'externe' par défaut
-- IMPORTANT : Exécutez cette commande SEULEMENT si vous voulez mettre à jour
UPDATE users
SET candidate_status = 'externe'
WHERE role = 'candidat' 
  AND (candidate_status IS NULL OR candidate_status = '');

-- 4. Vérifier le résultat après la mise à jour
SELECT 
  COUNT(*) as total_candidats,
  COUNT(CASE WHEN candidate_status = 'interne' THEN 1 END) as internes,
  COUNT(CASE WHEN candidate_status = 'externe' THEN 1 END) as externes,
  COUNT(CASE WHEN candidate_status IS NULL OR candidate_status = '' THEN 1 END) as sans_statut
FROM users
WHERE role = 'candidat';

