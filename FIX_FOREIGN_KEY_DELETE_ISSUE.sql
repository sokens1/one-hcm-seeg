-- ============================================
-- SOLUTION AU PROBLÈME DE SUPPRESSION
-- Unable to delete row - Foreign Key Constraint
-- ============================================
-- ID de l'offre concernée: e126f6cb-fc25-4dab-b69f-b24bae3bcbb1
-- ============================================

-- OPTION 1: Vérifier les candidatures existantes pour cette offre
-- Exécutez cette requête pour voir combien de candidatures sont liées
SELECT 
  COUNT(*) as nombre_candidatures,
  a.id,
  a.status,
  u.email as candidat_email,
  a.created_at
FROM applications a
LEFT JOIN users u ON a.candidate_id = u.id
WHERE a.job_offer_id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1'
GROUP BY a.id, a.status, u.email, a.created_at
ORDER BY a.created_at DESC;

-- ============================================
-- OPTION 2A: Supprimer d'abord les candidatures liées
-- ⚠️ ATTENTION: Cette action est IRRÉVERSIBLE
-- Cela supprimera TOUTES les candidatures pour cette offre
-- ============================================
DELETE FROM applications 
WHERE job_offer_id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1';

-- Ensuite, vous pouvez supprimer l'offre:
DELETE FROM job_offers 
WHERE id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1';

-- ============================================
-- OPTION 2B: Supprimer en une seule transaction (plus sûr)
-- ============================================
BEGIN;

-- Supprimer d'abord tous les documents liés aux candidatures
DELETE FROM application_documents
WHERE application_id IN (
  SELECT id FROM applications 
  WHERE job_offer_id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1'
);

-- Supprimer les évaluations Protocol 1
DELETE FROM protocol1_evaluations
WHERE application_id IN (
  SELECT id FROM applications 
  WHERE job_offer_id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1'
);

-- Supprimer les évaluations Protocol 2
DELETE FROM protocol2_evaluations
WHERE application_id IN (
  SELECT id FROM applications 
  WHERE job_offer_id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1'
);

-- Supprimer les candidatures
DELETE FROM applications 
WHERE job_offer_id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1';

-- Supprimer l'offre
DELETE FROM job_offers 
WHERE id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1';

COMMIT;
-- En cas de problème, annulez avec: ROLLBACK;

-- ============================================
-- OPTION 3: Modifier la contrainte pour ajouter CASCADE (SOLUTION PERMANENTE)
-- Cette solution évite le problème à l'avenir
-- ============================================

-- 1. Supprimer l'ancienne contrainte
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_job_offer_id_fkey;

-- 2. Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE applications 
ADD CONSTRAINT applications_job_offer_id_fkey 
FOREIGN KEY (job_offer_id) 
REFERENCES job_offers(id) 
ON DELETE CASCADE;

-- Maintenant, quand vous supprimez une offre, les candidatures sont automatiquement supprimées
-- Testez avec:
-- DELETE FROM job_offers WHERE id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1';

-- ============================================
-- OPTION 4: Vérifier toutes les contraintes actuelles
-- ============================================
SELECT
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'applications' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- ============================================
-- RECOMMANDATION
-- ============================================
-- 1. Exécutez d'abord l'OPTION 1 pour voir les candidatures concernées
-- 2. Si vous voulez juste supprimer cette offre spécifique, utilisez l'OPTION 2B (avec transaction)
-- 3. Si vous voulez éviter ce problème à l'avenir, utilisez l'OPTION 3 (modifier la contrainte)
-- 4. L'OPTION 3 est la solution PERMANENTE recommandée

