-- Script pour corriger les contraintes NOT NULL sur les colonnes de référence
-- Ces colonnes doivent être optionnelles car toutes les candidatures n'ont pas forcément de références

-- 1. Supprimer les contraintes NOT NULL sur les colonnes de référence
ALTER TABLE applications 
ALTER COLUMN reference_full_name DROP NOT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_email DROP NOT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_contact DROP NOT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_company DROP NOT NULL;

-- 2. Vérifier que les colonnes existent et ajouter des valeurs par défaut si nécessaire
ALTER TABLE applications 
ALTER COLUMN reference_full_name SET DEFAULT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_email SET DEFAULT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_contact SET DEFAULT NULL;

ALTER TABLE applications 
ALTER COLUMN reference_company SET DEFAULT NULL;

-- 3. Commentaires pour clarifier l'utilisation
COMMENT ON COLUMN applications.reference_full_name IS 'Nom complet de la personne de référence (optionnel)';
COMMENT ON COLUMN applications.reference_email IS 'Email de la personne de référence (optionnel)';
COMMENT ON COLUMN applications.reference_contact IS 'Contact téléphonique de la personne de référence (optionnel)';
COMMENT ON COLUMN applications.reference_company IS 'Entreprise de la personne de référence (optionnel)';
