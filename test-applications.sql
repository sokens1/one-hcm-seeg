-- Script de diagnostic complet pour le problème de candidatures
-- Exécuter dans l'interface Supabase SQL Editor

-- 1. Vérifier le nombre total de candidatures (ADMIN BYPASS RLS)
SET ROLE postgres;
SELECT COUNT(*) as total_applications_admin FROM applications;

-- 2. Revenir au rôle normal et tester avec RLS
RESET ROLE;
SELECT COUNT(*) as total_applications_with_rls FROM applications;

-- 3. Vérifier les candidatures existantes (ADMIN)
SET ROLE postgres;
SELECT 
  a.id,
  a.candidate_id,
  a.job_offer_id,
  a.status,
  a.created_at
FROM applications a
ORDER BY a.created_at DESC
LIMIT 5;

-- 4. Vérifier l'utilisateur recruteur spécifique
SELECT id, email, role, created_at FROM users 
WHERE id = '6b35be8c-fe50-4618-8187-2de1d1c145fe';

-- 5. Vérifier tous les recruteurs
SELECT id, email, role FROM users WHERE role = 'recruteur';

-- 6. Tester la politique RLS pour cet utilisateur
RESET ROLE;
SELECT current_user, auth.uid();

-- 7. Créer une candidature test si aucune n'existe
INSERT INTO applications (candidate_id, job_offer_id, status, cover_letter)
SELECT 
  '6b35be8c-fe50-4618-8187-2de1d1c145fe',
  (SELECT id FROM job_offers LIMIT 1),
  'candidature',
  'Candidature test pour diagnostic'
WHERE NOT EXISTS (SELECT 1 FROM applications LIMIT 1);

-- 8. Vérifier les politiques RLS actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'applications';
