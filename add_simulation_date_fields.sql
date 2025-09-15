-- Script SQL pour ajouter les champs de date de simulation à protocol2_evaluations
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- Ajouter les colonnes pour la date de simulation
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE,
ADD COLUMN IF NOT EXISTS simulation_time TIME,
ADD COLUMN IF NOT EXISTS simulation_scheduled_at TIMESTAMP WITH TIME ZONE;

-- Ajouter un index pour la recherche par date de simulation
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_simulation_date ON public.protocol2_evaluations(simulation_date);

-- Ajouter des commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN public.protocol2_evaluations.simulation_date IS 'Date programmée pour la simulation';
COMMENT ON COLUMN public.protocol2_evaluations.simulation_time IS 'Heure programmée pour la simulation';
COMMENT ON COLUMN public.protocol2_evaluations.simulation_scheduled_at IS 'Timestamp de programmation de la simulation';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE 'simulation_%'
ORDER BY column_name;
