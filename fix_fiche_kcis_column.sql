-- Script pour ajouter la colonne manquante fiche_kcis_comments
-- Copiez et collez ce script dans l'interface Supabase SQL Editor

-- Ajouter la colonne manquante
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS fiche_kcis_comments TEXT DEFAULT '';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'fiche_kcis_comments';
