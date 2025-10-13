-- ============================================
-- CORRECTION COMPLÈTE DE TOUTES LES CONTRAINTES CASCADE
-- Solution permanente pour éviter tous les problèmes de suppression
-- ============================================

BEGIN;

-- ============================================
-- 1. CONTRAINTE: applications -> job_offers
-- ============================================
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_job_offer_id_fkey;

ALTER TABLE applications 
ADD CONSTRAINT applications_job_offer_id_fkey 
FOREIGN KEY (job_offer_id) 
REFERENCES job_offers(id) 
ON DELETE CASCADE;

COMMENT ON CONSTRAINT applications_job_offer_id_fkey ON applications 
IS 'Quand une offre est supprimee, ses candidatures sont automatiquement supprimees';

-- ============================================
-- 2. CONTRAINTE: application_history -> applications
-- ============================================
ALTER TABLE application_history 
DROP CONSTRAINT IF EXISTS application_history_application_id_fkey;

ALTER TABLE application_history 
ADD CONSTRAINT application_history_application_id_fkey 
FOREIGN KEY (application_id) 
REFERENCES applications(id) 
ON DELETE CASCADE;

COMMENT ON CONSTRAINT application_history_application_id_fkey ON application_history 
IS 'Quand une candidature est supprimee, son historique est automatiquement supprime';

-- ============================================
-- 3. CONTRAINTE: documents -> applications
-- ============================================
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_application_id_fkey;

ALTER TABLE documents 
ADD CONSTRAINT documents_application_id_fkey 
FOREIGN KEY (application_id) 
REFERENCES applications(id) 
ON DELETE CASCADE;

COMMENT ON CONSTRAINT documents_application_id_fkey ON documents 
IS 'Quand une candidature est supprimee, ses documents sont automatiquement supprimes';

-- ============================================
-- 4. CONTRAINTE: interview_slots -> applications
-- ============================================
ALTER TABLE interview_slots 
DROP CONSTRAINT IF EXISTS interview_slots_application_id_fkey;

ALTER TABLE interview_slots 
ADD CONSTRAINT interview_slots_application_id_fkey 
FOREIGN KEY (application_id) 
REFERENCES applications(id) 
ON DELETE CASCADE;

COMMENT ON CONSTRAINT interview_slots_application_id_fkey ON interview_slots 
IS 'Quand une candidature est supprimee, ses creneaux entretien sont automatiquement supprimes';

-- ============================================
-- 5. CONTRAINTE: notifications -> applications
-- ============================================
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_related_application_id_fkey;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_related_application_id_fkey 
FOREIGN KEY (related_application_id) 
REFERENCES applications(id) 
ON DELETE CASCADE;

COMMENT ON CONSTRAINT notifications_related_application_id_fkey ON notifications 
IS 'Quand une candidature est supprimee, ses notifications sont automatiquement supprimees';

-- ============================================
-- 6. CONTRAINTE: protocol1_evaluations -> applications
-- ============================================
ALTER TABLE protocol1_evaluations 
DROP CONSTRAINT IF EXISTS protocol1_evaluations_application_id_fkey;

ALTER TABLE protocol1_evaluations 
ADD CONSTRAINT protocol1_evaluations_application_id_fkey 
FOREIGN KEY (application_id) 
REFERENCES applications(id) 
ON DELETE CASCADE;

COMMENT ON CONSTRAINT protocol1_evaluations_application_id_fkey ON protocol1_evaluations 
IS 'Quand une candidature est supprimee, ses evaluations Protocol 1 sont automatiquement supprimees';

-- ============================================
-- VÉRIFICATION: Afficher toutes les contraintes modifiées
-- ============================================
SELECT
  tc.table_name, 
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule,
  CASE 
    WHEN rc.delete_rule = 'CASCADE' THEN 'CASCADE active'
    ELSE 'Probleme'
  END as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (
    tc.constraint_name IN (
      'applications_job_offer_id_fkey',
      'application_history_application_id_fkey',
      'documents_application_id_fkey',
      'interview_slots_application_id_fkey',
      'notifications_related_application_id_fkey',
      'protocol1_evaluations_application_id_fkey'
    )
  )
ORDER BY tc.table_name;

COMMIT;

-- ============================================
-- TEST: Maintenant vous pouvez supprimer l'offre
-- ============================================
-- Décommentez quand vous êtes prêt:
-- DELETE FROM job_offers WHERE id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1';

-- ============================================
-- RESUME DES MODIFICATIONS
-- ============================================
-- applications -> job_offers : CASCADE active
-- application_history -> applications : CASCADE active
-- documents -> applications : CASCADE active
-- interview_slots -> applications : CASCADE active
-- notifications -> applications : CASCADE active
-- protocol1_evaluations -> applications : CASCADE active
--
-- COMPORTEMENT APRES CES MODIFICATIONS:
-- Quand vous supprimez une offre emploi (job_offer):
--   1. Toutes les candidatures (applications) liees sont supprimees
--   2. Pour chaque candidature supprimee:
--      - Son historique (application_history) est supprime
--      - Ses documents (documents) sont supprimes
--      - Ses creneaux entretien (interview_slots) sont supprimes
--      - Ses notifications (notifications) sont supprimees
--      - Ses evaluations Protocol 1 (protocol1_evaluations) sont supprimees
--
-- Plus erreur de cle etrangere !
-- ============================================

