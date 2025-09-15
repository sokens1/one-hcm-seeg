-- Script pour ajouter les colonnes de simulation manquantes à protocol2_evaluations
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- 1. Ajouter les colonnes de simulation dans protocol2_evaluations
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE,
ADD COLUMN IF NOT EXISTS simulation_time TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS simulation_scheduled_at TIMESTAMP WITH TIME ZONE;

-- 2. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_simulation_date ON public.protocol2_evaluations(simulation_date);

-- 3. Ajouter les commentaires
COMMENT ON COLUMN public.protocol2_evaluations.simulation_date IS 'Date programmée pour la simulation';
COMMENT ON COLUMN public.protocol2_evaluations.simulation_time IS 'Heure programmée pour la simulation';
COMMENT ON COLUMN public.protocol2_evaluations.simulation_scheduled_at IS 'Timestamp de programmation de la simulation';

-- 4. Vérifier que la table existe et afficher sa structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'protocol2_evaluations'
AND table_schema = 'public'
ORDER BY ordinal_position;
