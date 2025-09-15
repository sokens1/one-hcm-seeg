-- Script pour ajouter la colonne jeu_de_role_comments manquante
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Ajouter la colonne jeu_de_role_comments
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS jeu_de_role_comments TEXT DEFAULT '';

-- Vérifier la colonne ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'jeu_de_role_comments';
