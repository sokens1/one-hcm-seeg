-- ============================================
-- SCRIPT RAPIDE À EXÉCUTER MAINTENANT
-- Copiez et collez tout dans Supabase SQL Editor
-- ============================================

-- TABLE JOB_OFFERS
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS status_offerts TEXT CHECK (status_offerts IN ('interne', 'externe'));
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS mtp_questions_metier TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS mtp_questions_talent TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS mtp_questions_paradigme TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE job_offers DROP CONSTRAINT IF EXISTS job_offers_status_check;
ALTER TABLE job_offers ADD CONSTRAINT job_offers_status_check CHECK (status IN ('active', 'inactive', 'draft', 'closed'));
CREATE INDEX IF NOT EXISTS idx_job_offers_status_offerts ON job_offers(status_offerts);

-- TABLE APPLICATIONS (COLONNES MANQUANTES)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS candidature_status TEXT CHECK (candidature_status IN ('interne', 'externe'));
ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_been_manager BOOLEAN;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_full_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_email TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_contact TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_company TEXT;
CREATE INDEX IF NOT EXISTS idx_applications_candidature_status ON applications(candidature_status);
CREATE INDEX IF NOT EXISTS idx_applications_has_been_manager ON applications(has_been_manager);

