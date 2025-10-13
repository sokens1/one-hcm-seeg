-- ============================================
-- CORRECTION GLOBALE CASCADE DELETE - VERSION SIMPLE
-- ============================================

BEGIN;

-- 1. applications -> job_offers
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_job_offer_id_fkey;
ALTER TABLE applications ADD CONSTRAINT applications_job_offer_id_fkey FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE;

-- 2. application_history -> applications
ALTER TABLE application_history DROP CONSTRAINT IF EXISTS application_history_application_id_fkey;
ALTER TABLE application_history ADD CONSTRAINT application_history_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

-- 3. documents -> applications
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_application_id_fkey;
ALTER TABLE documents ADD CONSTRAINT documents_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

-- 4. interview_slots -> applications
ALTER TABLE interview_slots DROP CONSTRAINT IF EXISTS interview_slots_application_id_fkey;
ALTER TABLE interview_slots ADD CONSTRAINT interview_slots_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

-- 5. notifications -> applications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_related_application_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_related_application_id_fkey FOREIGN KEY (related_application_id) REFERENCES applications(id) ON DELETE CASCADE;

-- 6. protocol1_evaluations -> applications
ALTER TABLE protocol1_evaluations DROP CONSTRAINT IF EXISTS protocol1_evaluations_application_id_fkey;
ALTER TABLE protocol1_evaluations ADD CONSTRAINT protocol1_evaluations_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

-- Verification
SELECT tc.table_name, tc.constraint_name, rc.delete_rule
FROM information_schema.table_constraints AS tc 
LEFT JOIN information_schema.referential_constraints AS rc ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.constraint_name IN (
    'applications_job_offer_id_fkey',
    'application_history_application_id_fkey',
    'documents_application_id_fkey',
    'interview_slots_application_id_fkey',
    'notifications_related_application_id_fkey',
    'protocol1_evaluations_application_id_fkey'
  )
ORDER BY tc.table_name;

COMMIT;

-- Maintenant vous pouvez supprimer l'offre:
-- DELETE FROM job_offers WHERE id = 'e126f6cb-fc25-4dab-b69f-b24bae3bcbb1';

