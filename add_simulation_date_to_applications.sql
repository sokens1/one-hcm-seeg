-- Script SQL pour ajouter le champ simulation_date à la table applications
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- 1. Ajouter la colonne simulation_date si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'simulation_date') THEN
        ALTER TABLE public.applications ADD COLUMN simulation_date TIMESTAMP WITH TIME ZONE;
        COMMENT ON COLUMN public.applications.simulation_date IS 'Date et heure de la simulation programmée';
    END IF;
END $$;

-- 2. Ajouter un index sur simulation_date pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_applications_simulation_date ON public.applications(simulation_date);

-- 3. Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'simulation_date';
