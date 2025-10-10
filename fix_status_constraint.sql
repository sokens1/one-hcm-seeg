-- ============================================
-- CORRIGER LA CONTRAINTE STATUS POUR ACCEPTER 'inactive'
-- ============================================
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer l'ancienne contrainte CHECK sur status
ALTER TABLE job_offers 
DROP CONSTRAINT IF EXISTS job_offers_status_check;

-- 2. Ajouter une nouvelle contrainte CHECK qui accepte 'active', 'inactive', 'draft', et 'closed'
ALTER TABLE job_offers 
ADD CONSTRAINT job_offers_status_check 
CHECK (status IN ('active', 'inactive', 'draft', 'closed'));

-- 3. Vérifier que la contrainte est bien créée
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'job_offers_status_check';

-- 4. Vérifier les valeurs actuelles de status dans la table
SELECT DISTINCT status, COUNT(*) as count
FROM job_offers
GROUP BY status
ORDER BY status;

