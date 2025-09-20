-- Ajouter les champs de date de simulation à protocol2_evaluations
-- Cette migration ajoute les champs pour sauvegarder la date et l'heure de la simulation

-- Ajouter les colonnes pour la date de simulation
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE,
ADD COLUMN IF NOT EXISTS simulation_time TIME,
ADD COLUMN IF NOT EXISTS simulation_scheduled_at TIMESTAMP WITH TIME ZONE;

-- Ajouter un index pour la recherche par date de simulation
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_simulation_date ON public.protocol2_evaluations(simulation_date);

-- Ajouter un commentaire pour documenter les nouveaux champs
COMMENT ON COLUMN public.protocol2_evaluations.simulation_date IS 'Date programmée pour la simulation';
COMMENT ON COLUMN public.protocol2_evaluations.simulation_time IS 'Heure programmée pour la simulation';
COMMENT ON COLUMN public.protocol2_evaluations.simulation_scheduled_at IS 'Timestamp de programmation de la simulation';







