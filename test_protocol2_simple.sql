-- TEST SIMPLE POUR protocol2_evaluations
-- Ce script teste l'insertion et la récupération des données

-- 1. Vérifier la structure de la colonne id
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'id'
AND table_schema = 'public';

-- 2. Vérifier l'état RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol2_evaluations';

-- 3. Trouver un application_id et un evaluator_id réels
SELECT 
    (SELECT id FROM public.applications LIMIT 1) as real_application_id,
    (SELECT id FROM public.users LIMIT 1) as real_evaluator_id;

-- 4. Tester l'insertion avec des IDs réels
INSERT INTO public.protocol2_evaluations (
    application_id,
    evaluator_id,
    details
) VALUES (
    (SELECT id FROM public.applications LIMIT 1),
    (SELECT id FROM public.users LIMIT 1),
    '{"test": "data"}'::jsonb
) RETURNING id, application_id, evaluator_id, details;

-- 5. Vérifier que l'enregistrement a été créé
SELECT 
    id,
    application_id,
    evaluator_id,
    details,
    created_at
FROM public.protocol2_evaluations 
WHERE details->>'test' = 'data'
ORDER BY created_at DESC 
LIMIT 1;

-- 6. Nettoyer l'enregistrement de test
DELETE FROM public.protocol2_evaluations 
WHERE details->>'test' = 'data';

-- 7. Vérifier que l'enregistrement a été supprimé
SELECT COUNT(*) as remaining_test_records
FROM public.protocol2_evaluations 
WHERE details->>'test' = 'data';
