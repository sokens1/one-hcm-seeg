-- SOLUTION RADICALE - FORCER LA DÉSACTIVATION DE RLS
-- Cette migration force la désactivation de RLS de manière absolue

-- 1. Vérifier l'état actuel
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 2. FORCER la désactivation de RLS
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer TOUTES les politiques existantes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Lister et supprimer toutes les politiques
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'protocol1_evaluations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.protocol1_evaluations', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
    
    -- Vérifier qu'aucune politique ne reste
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'protocol1_evaluations' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'All policies successfully removed';
    ELSE
        RAISE NOTICE 'WARNING: Some policies still exist';
    END IF;
END $$;

-- 4. Accorder TOUTES les permissions possibles
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO authenticated;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO anon;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO service_role;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO postgres;

-- 5. Accorder les permissions sur les séquences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 6. Vérifier l'état final
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 7. Lister les politiques restantes (devrait être vide)
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'protocol1_evaluations' 
AND schemaname = 'public';

-- 8. Vérifier les permissions
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'protocol1_evaluations' 
AND table_schema = 'public';

-- 9. Confirmation finale
DO $$
BEGIN
    RAISE NOTICE 'FORCE RLS DISABLE APPLIED: protocol1_evaluations is now fully accessible';
    RAISE NOTICE 'All policies removed and full permissions granted';
    RAISE NOTICE 'Table should now accept all operations without 403 errors';
END $$;
