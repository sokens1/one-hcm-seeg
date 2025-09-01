-- Migration pour corriger la table applications et ajouter les colonnes manquantes
-- pour la programmation d'entretien

-- 1. Ajouter la colonne interview_date si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'interview_date') THEN
        ALTER TABLE public.applications ADD COLUMN interview_date TIMESTAMP WITH TIME ZONE;
        COMMENT ON COLUMN public.applications.interview_date IS 'Date et heure de l''entretien programmé';
    END IF;
END $$;

-- 2. Modifier la contrainte CHECK du statut pour inclure 'entretien_programme'
DO $$ 
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'applications' 
        AND constraint_name LIKE '%status%'
        AND constraint_type = 'CHECK'
    ) THEN
        -- Trouver le nom exact de la contrainte
        EXECUTE (
            'ALTER TABLE public.applications DROP CONSTRAINT ' || 
            (SELECT constraint_name FROM information_schema.table_constraints 
             WHERE table_name = 'applications' 
             AND constraint_name LIKE '%status%'
             AND constraint_type = 'CHECK' LIMIT 1)
        );
    END IF;
    
    -- Ajouter la nouvelle contrainte avec le statut 'entretien_programme'
    ALTER TABLE public.applications 
    ADD CONSTRAINT applications_status_check 
    CHECK (status IN ('candidature', 'incubation', 'embauche', 'refuse', 'entretien_programme'));
    
END $$;

-- 3. Ajouter un index sur interview_date pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_applications_interview_date ON public.applications(interview_date);

-- 4. Ajouter un index sur le statut pour optimiser les filtres
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- 5. Mettre à jour les commentaires
COMMENT ON COLUMN public.applications.status IS 'Statut de la candidature: candidature, incubation, embauche, refuse, entretien_programme';
COMMENT ON COLUMN public.applications.interview_date IS 'Date et heure de l''entretien programmé';

-- 6. Vérifier que toutes les applications existantes ont un statut valide
UPDATE public.applications 
SET status = 'candidature' 
WHERE status IS NULL OR status NOT IN ('candidature', 'incubation', 'embauche', 'refuse', 'entretien_programme');

-- 7. S'assurer que la colonne status a une valeur par défaut
ALTER TABLE public.applications ALTER COLUMN status SET DEFAULT 'candidature';

-- 8. Ajouter une contrainte NOT NULL sur status si elle n'existe pas
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'status' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.applications ALTER COLUMN status SET NOT NULL;
    END IF;
END $$;
