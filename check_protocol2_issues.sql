-- Vérifier les problèmes avec la table protocol2_evaluations
-- 1. Compter les enregistrements pour cette application
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_records
FROM public.protocol2_evaluations 
WHERE application_id = '9966d355-e913-4411-9558-7b0341a35734';

-- 2. Voir tous les enregistrements pour cette application
SELECT 
    id,
    application_id,
    evaluator_id,
    qcm_role_score,
    qcm_codir_score,
    overall_score,
    completed,
    created_at,
    updated_at,
    details
FROM public.protocol2_evaluations 
WHERE application_id = '9966d355-e913-4411-9558-7b0341a35734'
ORDER BY created_at DESC;

-- 3. Vérifier la structure de la table protocol2_evaluations
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier les contraintes de la table protocol2_evaluations
SELECT 
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'protocol2_evaluations' 
AND tc.table_schema = 'public';

-- 5. Comparer avec protocol1_evaluations (structure)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'protocol1_evaluations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

