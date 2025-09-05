-- Analyser et corriger la structure de protocol2_evaluations
-- 1. Vérifier les enregistrements multiples
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_records,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
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
    updated_at
FROM public.protocol2_evaluations 
WHERE application_id = '9966d355-e913-4411-9558-7b0341a35734'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Vérifier la structure actuelle de protocol2_evaluations
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