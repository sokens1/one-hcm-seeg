-- TEST DES PERMISSIONS POUR protocol2_evaluations
-- Ce script vérifie les permissions de l'utilisateur connecté

-- 1. Vérifier l'utilisateur actuel
SELECT current_user, session_user;

-- 2. Vérifier les permissions sur la table
SELECT 
    grantee, 
    privilege_type, 
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'protocol2_evaluations' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 3. Vérifier les rôles de l'utilisateur actuel
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles 
WHERE rolname = current_user;

-- 4. Tester une requête SELECT simple
SELECT COUNT(*) as total_records
FROM public.protocol2_evaluations;

-- 5. Vérifier les contraintes de clé étrangère
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'protocol2_evaluations';

