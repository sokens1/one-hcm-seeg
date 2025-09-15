-- Script simple pour ajouter seulement les colonnes de simulation
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Colonnes de simulation dans protocol2_evaluations
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE,
ADD COLUMN IF NOT EXISTS simulation_time TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS simulation_scheduled_at TIMESTAMP WITH TIME ZONE;

-- Colonne simulation_date dans applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS simulation_date TIMESTAMP WITH TIME ZONE;

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_simulation_date ON public.protocol2_evaluations(simulation_date);
CREATE INDEX IF NOT EXISTS idx_applications_simulation_date ON public.applications(simulation_date);

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE '%simulation%'
ORDER BY column_name;
