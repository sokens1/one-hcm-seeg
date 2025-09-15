-- REQUÊTE GLOBALE POUR LA PROGRAMMATION DE SIMULATION
-- Exécuter cette requête complète dans l'éditeur SQL de Supabase

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

-- 7. Créer les index
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_simulation_date ON public.protocol2_evaluations(simulation_date);
CREATE INDEX IF NOT EXISTS idx_applications_simulation_date ON public.applications(simulation_date);

-- 8. Vérifier les colonnes ajoutées
SELECT 'applications' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'simulation_date'

UNION ALL

SELECT 'protocol2_evaluations' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND (column_name LIKE '%simulation%' OR column_name LIKE '%jeu_codir%' OR column_name LIKE '%fiche_%' OR column_name LIKE '%gap_%' OR column_name LIKE '%plan_%' OR column_name LIKE '%score%')
ORDER BY table_name, column_name;
