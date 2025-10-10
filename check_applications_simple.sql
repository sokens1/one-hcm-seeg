-- Script simple pour vérifier la table applications

-- 1. Vérifier toutes les colonnes de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- 2. Compter les enregistrements
SELECT COUNT(*) as total_applications 
FROM applications;

-- 3. Vérifier les status distincts
SELECT DISTINCT status, COUNT(*) as count
FROM applications
GROUP BY status
ORDER BY status;

