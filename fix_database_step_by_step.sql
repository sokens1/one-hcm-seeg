-- ============================================
-- ÉTAPE 1 : Ajouter les colonnes manquantes
-- ============================================
-- Exécutez d'abord cette section seule

ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS status_offerts TEXT CHECK (status_offerts IN ('interne', 'externe'));

ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_metier TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_talent TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS mtp_questions_paradigme TEXT[] DEFAULT ARRAY[]::TEXT[];

