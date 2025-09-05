-- TEST DE DEBUG POUR LE FRONTEND
-- Ce script vérifie les données nécessaires pour le frontend

-- 1. Vérifier l'utilisateur actuel et ses permissions
SELECT 
    current_user,
    session_user,
    'Permissions vérifiées' as status;

-- 2. Vérifier les permissions sur la table
SELECT 
    grantee, 
    privilege_type, 
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'protocol2_evaluations' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 3. Vérifier l'état RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol2_evaluations';

-- 4. Vérifier la structure de la colonne id
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'id'
AND table_schema = 'public';

-- 5. Vérifier les enregistrements existants
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN id IS NOT NULL THEN 1 END) as records_with_id,
    COUNT(CASE WHEN application_id IS NOT NULL THEN 1 END) as records_with_application_id,
    COUNT(CASE WHEN evaluator_id IS NOT NULL THEN 1 END) as records_with_evaluator_id,
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
LIMIT 3;

-- 7. Vérifier les applications disponibles
SELECT 
    COUNT(*) as total_applications
FROM public.applications;

-- 8. Vérifier les utilisateurs disponibles
SELECT 
    COUNT(*) as total_users
FROM public.users;