-- Test de l'évaluation Protocol 2
-- 1. Nettoyer l'enregistrement de test
DELETE FROM public.protocol2_evaluations 
WHERE application_id = '9966d355-e913-4411-9558-7b0341a35734';

-- 2. Vérifier que la table est vide
SELECT COUNT(*) as total_records 
FROM public.protocol2_evaluations 
WHERE application_id = '9966d355-e913-4411-9558-7b0341a35734';

-- 3. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier les contraintes
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'protocol2_evaluations' 
AND tc.table_schema = 'public';

