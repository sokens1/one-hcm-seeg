-- ============================================
-- MODIFICATION DES CONTRAINTES POUR CASCADE DELETE
-- Solution permanente au problème de suppression
-- ============================================

-- Étape 1: Vérifier les contraintes actuelles
SELECT
  tc.table_name, 
  tc.constraint_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'applications' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- ============================================
-- Étape 2: Modifier la contrainte applications -> job_offers
-- ============================================

BEGIN;

-- Supprimer l'ancienne contrainte
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_job_offer_id_fkey;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE applications 
ADD CONSTRAINT applications_job_offer_id_fkey 
FOREIGN KEY (job_offer_id) 
REFERENCES job_offers(id) 
ON DELETE CASCADE;

-- Vérification que la contrainte a été ajoutée correctement
SELECT 
  constraint_name, 
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE constraint_name = 'applications_job_offer_id_fkey';

COMMIT;

-- ============================================
-- Étape 3: Maintenant vous pouvez supprimer l'offre
-- Les candidatures associées seront automatiquement supprimées
-- ============================================

-- Test (commenté pour sécurité - décommentez quand vous êtes prêt)
-- DELETE FROM job_offers WHERE id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1';

-- ============================================
-- BONUS: Vérifier et corriger TOUTES les contraintes CASCADE
-- Pour éviter ce problème sur d'autres tables
-- ============================================

-- Vérifier toutes les contraintes qui n'ont PAS CASCADE
SELECT
  tc.table_name, 
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (rc.delete_rule IS NULL OR rc.delete_rule != 'CASCADE')
ORDER BY tc.table_name;

