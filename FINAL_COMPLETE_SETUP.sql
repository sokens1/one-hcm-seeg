-- ============================================
-- SCRIPT FINAL COMPLET - TOUT EN UN
-- ============================================
-- Copiez et exécutez TOUT ce script dans Supabase SQL Editor

-- ============================================
-- PARTIE 1 : TABLE JOB_OFFERS
-- ============================================

-- 1.1 Ajouter les colonnes si elles n'existent pas
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS status_offerts TEXT CHECK (status_offerts IN ('interne', 'externe'));
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS mtp_questions_metier TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS mtp_questions_talent TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS mtp_questions_paradigme TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 1.2 Corriger la contrainte CHECK sur status (IMPORTANT pour le switch actif/inactif)
ALTER TABLE job_offers DROP CONSTRAINT IF EXISTS job_offers_status_check;
ALTER TABLE job_offers ADD CONSTRAINT job_offers_status_check CHECK (status IN ('active', 'inactive', 'draft', 'closed'));

-- 1.3 Mettre à jour toutes les offres SANS status_offerts pour les définir comme 'externe' par défaut
UPDATE job_offers SET status_offerts = 'externe' WHERE status_offerts IS NULL;

-- 1.4 Créer les index
CREATE INDEX IF NOT EXISTS idx_job_offers_status_offerts ON job_offers(status_offerts);

-- ============================================
-- PARTIE 2 : TABLE APPLICATIONS
-- ============================================

-- 2.1 Ajouter les colonnes manquantes
ALTER TABLE applications ADD COLUMN IF NOT EXISTS candidature_status TEXT CHECK (candidature_status IN ('interne', 'externe'));
ALTER TABLE applications ADD COLUMN IF NOT EXISTS has_been_manager BOOLEAN;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_full_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_email TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_contact TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reference_company TEXT;

-- 2.2 Créer les index
CREATE INDEX IF NOT EXISTS idx_applications_candidature_status ON applications(candidature_status);
CREATE INDEX IF NOT EXISTS idx_applications_has_been_manager ON applications(has_been_manager);

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

-- Vérifier les offres par statut
SELECT 
    status_offerts,
    COUNT(*) as nombre_offres,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as actives,
    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactives
FROM job_offers
GROUP BY status_offerts
ORDER BY status_offerts;

-- Vérifier qu'aucune offre n'a un status_offerts NULL
SELECT COUNT(*) as offres_sans_statut FROM job_offers WHERE status_offerts IS NULL;

-- Afficher un échantillon des offres
SELECT 
    title,
    status,
    status_offerts
FROM job_offers
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;

