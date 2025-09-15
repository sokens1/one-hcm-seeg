-- Script pour ajouter la colonne status manquante
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Ajouter la colonne status
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress';

-- Ajouter la colonne completed
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name IN ('status', 'completed')
ORDER BY column_name;
