-- ============================================
-- MIGRATION COMPLÈTE POUR LE SYSTÈME DE SWITCH
-- Exécutez ces scripts dans l'ordre
-- ============================================

-- ============================================
-- PARTIE 1 : Table job_offers
-- ============================================

-- 1.1 Ajouter la colonne status_offerts (Interne/Externe)
ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS status_offerts TEXT CHECK (status_offerts IN ('interne', 'externe'));

-- 1.2 Ajouter les colonnes pour les questions MTP dynamiques
ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_metier TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_talent TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_paradigme TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 1.3 IMPORTANT : Corriger la contrainte CHECK sur status pour accepter 'inactive'
ALTER TABLE job_offers 
DROP CONSTRAINT IF EXISTS job_offers_status_check;

ALTER TABLE job_offers 
ADD CONSTRAINT job_offers_status_check 
CHECK (status IN ('active', 'inactive', 'draft', 'closed'));

-- 1.4 Créer les index
CREATE INDEX IF NOT EXISTS idx_job_offers_status_offerts ON job_offers(status_offerts);

-- 1.5 Fixer le problème de génération automatique de l'ID
ALTER TABLE job_offers 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE job_offers
ALTER COLUMN id SET NOT NULL;

-- ============================================
-- PARTIE 2 : Table applications
-- ============================================

-- 2.1 Ajouter la colonne candidature_status
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS candidature_status TEXT CHECK (candidature_status IN ('interne', 'externe'));

-- 2.2 Ajouter la colonne has_been_manager (pour candidatures internes)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS has_been_manager BOOLEAN;

-- 2.3 Ajouter les colonnes pour les informations de référence
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS reference_full_name TEXT;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS reference_email TEXT;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS reference_contact TEXT;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS reference_company TEXT;

-- 2.4 Créer les index
CREATE INDEX IF NOT EXISTS idx_applications_candidature_status ON applications(candidature_status);
CREATE INDEX IF NOT EXISTS idx_applications_has_been_manager ON applications(has_been_manager);

-- ============================================
-- PARTIE 3 : Commentaires de documentation
-- ============================================

COMMENT ON COLUMN job_offers.status_offerts IS 'Type of job offer: interne (internal) or externe (external)';
COMMENT ON COLUMN job_offers.status IS 'Status: active (visible to candidates), inactive (hidden), draft, closed';
COMMENT ON COLUMN job_offers.mtp_questions_metier IS 'MTP Métier questions (7 for internal, 3 for external)';
COMMENT ON COLUMN job_offers.mtp_questions_talent IS 'MTP Talent questions (3 questions)';
COMMENT ON COLUMN job_offers.mtp_questions_paradigme IS 'MTP Paradigme questions (3 questions)';
COMMENT ON COLUMN applications.candidature_status IS 'Application type: interne or externe';
COMMENT ON COLUMN applications.has_been_manager IS 'Indicates if the candidate has been a manager before (for internal applications)';
COMMENT ON COLUMN applications.reference_full_name IS 'Full name of the reference person';
COMMENT ON COLUMN applications.reference_email IS 'Email of the reference person';
COMMENT ON COLUMN applications.reference_contact IS 'Contact of the reference person';
COMMENT ON COLUMN applications.reference_company IS 'Company of the reference person';

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier les colonnes de job_offers
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'job_offers'
AND column_name IN ('status', 'status_offerts', 'mtp_questions_metier', 'mtp_questions_talent', 'mtp_questions_paradigme')
ORDER BY column_name;

-- Vérifier les contraintes CHECK sur job_offers
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%job_offers%';

-- Vérifier les colonnes de applications
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'applications'
AND column_name IN (
    'candidature_status', 
    'has_been_manager', 
    'reference_full_name', 
    'reference_email', 
    'reference_contact', 
    'reference_company'
)
ORDER BY column_name;

-- Vérifier les contraintes CHECK sur applications
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%applications%';

