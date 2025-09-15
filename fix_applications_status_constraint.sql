-- Script SQL pour corriger la contrainte de statut de la table applications
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- 1. D'abord, voir quels sont les statuts problématiques
SELECT DISTINCT status, COUNT(*) as count
FROM public.applications 
GROUP BY status
ORDER BY status;

-- 2. Normaliser les statuts problématiques vers des statuts valides
UPDATE public.applications 
SET status = 'candidature'
WHERE status NOT IN ('candidature', 'incubation', 'embauche', 'refuse', 'entretien_programme', 'simulation_programmee')
   OR status IS NULL
   OR status = '';

-- 3. Vérifier qu'il n'y a plus de statuts problématiques
SELECT DISTINCT status, COUNT(*) as count
FROM public.applications 
GROUP BY status
ORDER BY status;

-- 4. Supprimer l'ancienne contrainte CHECK du statut si elle existe
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

-- 5. Ajouter la nouvelle contrainte avec le statut 'simulation_programmee'
ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('candidature', 'incubation', 'embauche', 'refuse', 'entretien_programme', 'simulation_programmee'));

-- 6. Mettre à jour le commentaire
COMMENT ON COLUMN public.applications.status IS 'Statut de la candidature: candidature, incubation, embauche, refuse, entretien_programme, simulation_programmee';

-- 7. Vérifier que la contrainte a été ajoutée
SELECT tc.constraint_name, cc.check_clause 
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'applications' 
AND tc.constraint_type = 'CHECK'
AND tc.constraint_name LIKE '%status%';

-- 8. Vérifier que tous les statuts sont maintenant valides
SELECT DISTINCT status, COUNT(*) as count
FROM public.applications 
GROUP BY status
ORDER BY status;
