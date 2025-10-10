-- ============================================
-- AJOUTER LES COLONNES MANQUANTES À LA TABLE APPLICATIONS
-- ============================================

-- 1. Colonne pour le statut de la candidature (interne/externe)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS candidature_status TEXT CHECK (candidature_status IN ('interne', 'externe'));

-- 2. Colonne pour savoir si le candidat a été manager (pour candidatures internes)
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS has_been_manager BOOLEAN;

-- 3. Colonnes pour les informations de référence
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS reference_full_name TEXT;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS reference_email TEXT;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS reference_contact TEXT;

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS reference_company TEXT;

-- 4. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_applications_candidature_status ON applications(candidature_status);
CREATE INDEX IF NOT EXISTS idx_applications_has_been_manager ON applications(has_been_manager);

-- 5. Ajouter des commentaires pour documenter
COMMENT ON COLUMN applications.candidature_status IS 'Type de candidature: interne ou externe';
COMMENT ON COLUMN applications.has_been_manager IS 'Indique si le candidat a déjà été manager (pour les candidatures internes)';
COMMENT ON COLUMN applications.reference_full_name IS 'Nom complet de la personne de référence';
COMMENT ON COLUMN applications.reference_email IS 'Email de la personne de référence';
COMMENT ON COLUMN applications.reference_contact IS 'Contact de la personne de référence';
COMMENT ON COLUMN applications.reference_company IS 'Entreprise de la personne de référence';

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que toutes les colonnes ont été créées
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

