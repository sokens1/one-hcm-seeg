-- ============================================
-- COPIEZ ET EXÉCUTEZ UNE LIGNE À LA FOIS
-- Attendez le succès avant de passer à la suivante
-- ============================================

-- ÉTAPE 1 : job_offers - status_offerts
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS status_offerts TEXT CHECK (status_offerts IN ('interne', 'externe'));

-- ÉTAPE 2 : job_offers - mtp_questions_metier
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS mtp_questions_metier TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ÉTAPE 3 : job_offers - mtp_questions_talent
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS mtp_questions_talent TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ÉTAPE 4 : job_offers - mtp_questions_paradigme
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS mtp_questions_paradigme TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ÉTAPE 5 : job_offers - supprimer ancienne contrainte
ALTER TABLE job_offers DROP CONSTRAINT IF EXISTS job_offers_status_check;

-- ÉTAPE 6 : job_offers - ajouter nouvelle contrainte
ALTER TABLE job_offers ADD CONSTRAINT job_offers_status_check CHECK (status IN ('active', 'inactive', 'draft', 'closed'));

-- ÉTAPE 7 : job_offers - créer index
CREATE INDEX IF NOT EXISTS idx_job_offers_status_offerts ON job_offers(status_offerts);

-- ÉTAPE 8 : applications - candidature_status
ALTER TABLE applications ADD COLUMN IF NOT EXISTS candidature_status TEXT CHECK (candidature_status IN ('interne', 'externe'));

-- ÉTAPE 9 : applications - has_been_manager
ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_been_manager BOOLEAN;

-- ÉTAPE 10 : applications - reference_full_name
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_full_name TEXT;

-- ÉTAPE 11 : applications - reference_email
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_email TEXT;

-- ÉTAPE 12 : applications - reference_contact
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_contact TEXT;

-- ÉTAPE 13 : applications - reference_company
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_company TEXT;

-- ÉTAPE 14 : applications - index candidature_status
CREATE INDEX IF NOT EXISTS idx_applications_candidature_status ON applications(candidature_status);

-- ÉTAPE 15 : applications - index has_been_manager
CREATE INDEX IF NOT EXISTS idx_applications_has_been_manager ON applications(has_been_manager);

