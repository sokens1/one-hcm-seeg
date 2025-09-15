-- Script pour ajouter les colonnes fiche
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Colonnes de validation opérationnelle
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS fiche_kpis_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiche_kpis_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS fiche_kris_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiche_kris_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS fiche_kcis_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiche_kcis_comments TEXT DEFAULT '';

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE '%fiche_%'
ORDER BY column_name;
