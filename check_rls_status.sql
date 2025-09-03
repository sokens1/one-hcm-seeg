-- Vérifier l'état actuel de RLS sur protocol1_evaluations
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- Vérifier les politiques existantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'protocol1_evaluations';
