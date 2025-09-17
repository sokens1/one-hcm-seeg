-- Migration pour ajouter toutes les colonnes nécessaires au protocole 2
-- Date: 2025-01-31
-- Description: Ajoute les colonnes de simulation et autres colonnes manquantes

-- 1. Ajouter la colonne simulation_date dans applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS simulation_date TIMESTAMP WITH TIME ZONE;

-- 2. Ajouter les colonnes de simulation dans protocol2_evaluations
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS simulation_date DATE,
ADD COLUMN IF NOT EXISTS simulation_time TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS simulation_scheduled_at TIMESTAMP WITH TIME ZONE;

-- 3. Ajouter les colonnes de mise en situation
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS jeu_codir_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jeu_codir_comments TEXT DEFAULT '';

-- 4. Ajouter les colonnes de validation opérationnelle
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS fiche_kpis_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiche_kpis_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS fiche_kris_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiche_kris_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS fiche_kcis_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiche_kcis_comments TEXT DEFAULT '';

-- 5. Ajouter les colonnes d'analyse des compétences
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS gap_competences_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gap_competences_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS gap_competences_level TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS plan_formation_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_formation_comments TEXT DEFAULT '';

-- 6. Ajouter les colonnes de scores calculés
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS mise_en_situation_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS validation_operationnelle_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analyse_competences_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS overall_score INTEGER DEFAULT 0;

-- 7. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_simulation_date ON public.protocol2_evaluations(simulation_date);
CREATE INDEX IF NOT EXISTS idx_applications_simulation_date ON public.applications(simulation_date);

-- 8. Ajouter les commentaires pour documenter les colonnes
COMMENT ON COLUMN public.applications.simulation_date IS 'Date et heure de la simulation programmée';
COMMENT ON COLUMN public.protocol2_evaluations.simulation_date IS 'Date programmée pour la simulation';
COMMENT ON COLUMN public.protocol2_evaluations.simulation_time IS 'Heure programmée pour la simulation';
COMMENT ON COLUMN public.protocol2_evaluations.simulation_scheduled_at IS 'Timestamp de programmation de la simulation';


