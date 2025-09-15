-- Script pour ajouter les champs de synthèse à la table applications
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- 1. Ajouter les colonnes de synthèse dans applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS synthesis_points_forts TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS synthesis_points_amelioration TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS synthesis_conclusion TEXT DEFAULT '';

-- 2. Ajouter les commentaires
COMMENT ON COLUMN public.applications.synthesis_points_forts IS 'Points forts identifies lors de l evaluation';
COMMENT ON COLUMN public.applications.synthesis_points_amelioration IS 'Points d amelioration identifies lors de l evaluation';
COMMENT ON COLUMN public.applications.synthesis_conclusion IS 'Conclusion de l evaluation';

-- 3. Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'applications'
AND table_schema = 'public'
AND column_name LIKE 'synthesis_%'
ORDER BY ordinal_position;
