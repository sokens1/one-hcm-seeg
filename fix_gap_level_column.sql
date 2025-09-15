-- Script simple pour ajouter seulement la colonne manquante
-- Copiez et collez ce script dans l'interface Supabase SQL Editor

-- Ajouter seulement la colonne manquante
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS gap_competences_level TEXT DEFAULT '';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'gap_competences_level';
