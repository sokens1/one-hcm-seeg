-- Vérifier la structure de la table applications
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les contraintes de clé primaire
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    kcu.data_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'applications' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'PRIMARY KEY';
