-- URGENT: Script pour ajouter la colonne manquante analyse_competences_score
-- Copiez et collez ce script dans l'interface Supabase SQL Editor

-- 1. Vérifier d'abord quelles colonnes existent dans protocol2_evaluations
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE '%competences%'
ORDER BY column_name;

-- 2. Ajouter la colonne manquante analyse_competences_score
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS analyse_competences_score INTEGER DEFAULT 0;

-- 3. Ajouter aussi les autres colonnes qui pourraient manquer
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS analyse_competences_comments TEXT DEFAULT '';

-- 4. Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name LIKE '%competences%'
ORDER BY column_name;
