-- Script SQL pour ajouter le statut 'simulation_programmee' à la table applications
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- 1. Supprimer l'ancienne contrainte CHECK du statut
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
END $$;

-- 2. Ajouter la nouvelle contrainte avec le statut 'simulation_programmee'
ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('candidature', 'incubation', 'embauche', 'refuse', 'entretien_programme', 'simulation_programmee'));

-- 3. Mettre à jour le commentaire
COMMENT ON COLUMN public.applications.status IS 'Statut de la candidature: candidature, incubation, embauche, refuse, entretien_programme, simulation_programmee';

-- 4. Vérifier que la contrainte a été ajoutée
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'applications' 
AND constraint_name LIKE '%status%';
