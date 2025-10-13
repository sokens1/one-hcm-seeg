-- ============================================
-- REQUÊTES SQL À EXÉCUTER DANS SUPABASE
-- ============================================
-- Copiez et exécutez ces requêtes dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne status_offerts (Interne/Externe)
ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS status_offerts TEXT CHECK (status_offerts IN ('interne', 'externe'));

COMMENT ON COLUMN job_offers.status_offerts IS 'Indicates if the job offer is internal or external (interne/externe)';

-- 2. Ajouter les colonnes pour les questions MTP dynamiques
ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_metier TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_talent TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_paradigme TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN job_offers.mtp_questions_metier IS 'Array of MTP Métier questions for this job offer (7 questions)';
COMMENT ON COLUMN job_offers.mtp_questions_talent IS 'Array of MTP Talent questions for this job offer (3 questions)';
COMMENT ON COLUMN job_offers.mtp_questions_paradigme IS 'Array of MTP Paradigme questions for this job offer (3 questions)';

-- 4. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_job_offers_status_offerts ON job_offers(status_offerts);

-- 5. Fixer le problème de génération automatique de l'ID
ALTER TABLE job_offers 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE job_offers
ALTER COLUMN id SET NOT NULL;

-- 6. Corriger la contrainte CHECK sur la colonne status pour accepter 'inactive'
ALTER TABLE job_offers 
DROP CONSTRAINT IF EXISTS job_offers_status_check;

ALTER TABLE job_offers 
ADD CONSTRAINT job_offers_status_check 
CHECK (status IN ('active', 'inactive', 'draft', 'closed'));

COMMENT ON COLUMN job_offers.status IS 'Status of the job offer: active (visible to candidates), inactive (hidden from candidates but visible to recruiters), draft, closed';

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Exécutez cette requête pour vérifier que tout est bien créé
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'job_offers'
AND column_name IN ('status', 'status_offerts', 'mtp_questions_metier', 'mtp_questions_talent', 'mtp_questions_paradigme', 'id')
ORDER BY column_name;

-- Vérifier la contrainte CHECK sur status
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'job_offers_status_check';

-- Vérifier les valeurs de status actuelles dans la table
SELECT DISTINCT status, COUNT(*) as count
FROM job_offers
GROUP BY status
ORDER BY status;

