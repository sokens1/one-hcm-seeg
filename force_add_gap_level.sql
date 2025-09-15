-- Script pour forcer l'ajout de la colonne gap_competences_level
-- Copiez et collez ce script dans l'interface Supabase SQL Editor

-- Supprimer la colonne si elle existe déjà (au cas où)
ALTER TABLE public.protocol2_evaluations DROP COLUMN IF EXISTS gap_competences_level;

-- Ajouter la colonne
ALTER TABLE public.protocol2_evaluations ADD COLUMN gap_competences_level TEXT DEFAULT '';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'gap_competences_level';
