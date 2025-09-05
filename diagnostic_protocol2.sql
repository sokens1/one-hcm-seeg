-- DIAGNOSTIC COMPLET POUR protocol2_evaluations
-- Ce script vérifie tous les aspects de la table et des données

-- 1. Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_default LIKE '%gen_random_uuid%' THEN '✅ UUID généré automatiquement'
        WHEN column_default LIKE '%uuid_generate%' THEN '✅ UUID généré automatiquement'
        WHEN column_default IS NULL THEN '❌ Pas de valeur par défaut'
        ELSE '⚠️ Autre valeur par défaut: ' || column_default
    END as status
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes de clé primaire
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'protocol2_evaluations' 
AND tc.constraint_type = 'PRIMARY KEY'
AND tc.table_schema = 'public';

-- 3. Vérifier l'état RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol2_evaluations';

-- 4. Vérifier les permissions
SELECT 
    grantee, 
    privilege_type, 
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'protocol2_evaluations' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 5. Compter les enregistrements existants
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN id IS NOT NULL THEN 1 END) as records_with_id,
    COUNT(CASE WHEN application_id IS NOT NULL THEN 1 END) as records_with_application_id,
    COUNT(CASE WHEN details IS NOT NULL THEN 1 END) as records_with_details
FROM public.protocol2_evaluations;

-- 6. Vérifier les enregistrements récents
SELECT 
    id,
    application_id,
    evaluator_id,
    status,
    completed,
    created_at,
    updated_at
FROM public.protocol2_evaluations 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Tester l'insertion d'un enregistrement de test
-- (Décommentez pour tester)
/*
INSERT INTO public.protocol2_evaluations (
    application_id,
    evaluator_id,
    details
) VALUES (
    (SELECT id FROM public.applications LIMIT 1),
    'test-evaluator-id',
    '{"test": "data"}'::jsonb
) RETURNING id, application_id, evaluator_id;
*/

-- 8. Vérifier les extensions UUID disponibles
SELECT 
    extname, 
    extversion, 
    extrelocatable
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- 9. Tester la génération d'UUID
SELECT 
    gen_random_uuid() as random_uuid,
    uuid_generate_v4() as uuid_v4;
