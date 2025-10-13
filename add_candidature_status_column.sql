-- Ajouter la colonne candidature_status à la table applications
-- Cette colonne stocke le statut interne/externe de la candidature

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS candidature_status TEXT CHECK (candidature_status IN ('interne', 'externe'));

COMMENT ON COLUMN applications.candidature_status IS 'Status of the application: interne (internal candidate) or externe (external candidate)';

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_applications_candidature_status ON applications(candidature_status);

-- Vérifier que la colonne a été créée
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'applications'
AND column_name = 'candidature_status';

