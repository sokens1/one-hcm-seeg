-- Test des politiques RLS pour protocol1_evaluations
-- À exécuter après la correction

-- 1. Vérifier l'état de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 2. Lister les politiques actives
SELECT 
    policyname,
    cmd as operation,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'protocol1_evaluations';

-- 3. Tester l'accès (remplacer 'your-user-id' par un ID utilisateur réel)
-- SELECT auth.uid() as current_user_id;

-- 4. Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'protocol1_evaluations';
