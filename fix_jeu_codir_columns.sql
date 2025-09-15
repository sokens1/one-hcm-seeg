-- Script pour ajouter les colonnes jeu_codir
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Colonnes de mise en situation
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS jeu_codir_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jeu_codir_comments TEXT DEFAULT '';

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE '%jeu_codir%'
ORDER BY column_name;
