-- =====================================================
-- CORRECTION FINALE : Contraintes NOT NULL sur les références
-- =====================================================
-- Ce script corrige le problème "null value in column "reference_full_name" of relation "applications" violates not-null constraint"

-- 1. Vérifier les contraintes actuelles
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name IN ('reference_full_name', 'reference_email', 'reference_contact', 'reference_company')
ORDER BY column_name;

-- 2. Supprimer les contraintes NOT NULL (si elles existent)
ALTER TABLE applications 
ALTER COLUMN reference_full_name DROP NOT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_email DROP NOT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_contact DROP NOT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_company DROP NOT NULL;

-- 3. Définir des valeurs par défaut NULL (explicite)
ALTER TABLE applications 
ALTER COLUMN reference_full_name SET DEFAULT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_email SET DEFAULT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_contact SET DEFAULT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_company SET DEFAULT NULL;

-- 4. Mettre à jour les valeurs vides existantes en NULL
UPDATE applications 
SET reference_full_name = NULL 
WHERE reference_full_name = '';

UPDATE applications 
SET reference_email = NULL 
WHERE reference_email = '';

UPDATE applications 
SET reference_contact = NULL 
WHERE reference_contact = '';

UPDATE applications 
SET reference_company = NULL 
WHERE reference_company = '';

-- 5. Vérifier le résultat
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name IN ('reference_full_name', 'reference_email', 'reference_contact', 'reference_company')
ORDER BY column_name;

-- 6. Compter les enregistrements avec des références vs sans références
SELECT 
    COUNT(*) as total_applications,
    COUNT(reference_full_name) as with_full_name,
    COUNT(reference_email) as with_email,
    COUNT(reference_contact) as with_contact,
    COUNT(reference_company) as with_company
FROM applications;

COMMENT ON COLUMN applications.reference_full_name IS 'Nom complet de la personne de référence (optionnel - peut être NULL)';
COMMENT ON COLUMN applications.reference_email IS 'Email de la personne de référence (optionnel - peut être NULL)';
COMMENT ON COLUMN applications.reference_contact IS 'Contact téléphonique de la personne de référence (optionnel - peut être NULL)';
COMMENT ON COLUMN applications.reference_company IS 'Entreprise de la personne de référence (optionnel - peut être NULL)';
