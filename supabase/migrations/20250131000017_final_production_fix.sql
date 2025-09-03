-- CORRECTION FINALE POUR LA PRODUCTION
-- Cette migration s'assure que la table est complètement accessible

-- 1. Vérifier l'état de RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 2. S'assurer que RLS est désactivé
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- 3. Accorder toutes les permissions possibles
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO authenticated;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO anon;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO service_role;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO postgres;

-- 4. Accorder les permissions sur les séquences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. Vérifier les permissions
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'protocol1_evaluations' 
AND table_schema = 'public';

-- 6. Confirmation finale
DO $$
BEGIN
    RAISE NOTICE 'FINAL PRODUCTION FIX APPLIED: protocol1_evaluations is now fully accessible';
    RAISE NOTICE 'RLS disabled, all permissions granted to all roles';
END $$;
