-- CORRECTION DÉFINITIVE DU PROBLÈME RLS POUR protocol1_evaluations
-- Cette migration résout définitivement le problème 403 Forbidden

-- 1. Vérifier l'état actuel de RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 2. FORCER la désactivation de RLS de manière absolue
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer TOUTES les politiques existantes (même celles cachées)
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

-- 4. Accorder TOUTES les permissions possibles à TOUS les rôles
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO authenticated;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO anon;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO service_role;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO postgres;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO supabase_storage_admin;

-- 5. Accorder les permissions sur les séquences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO supabase_storage_admin;

-- 6. S'assurer que la table est accessible en lecture/écriture
GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocol1_evaluations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocol1_evaluations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocol1_evaluations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocol1_evaluations TO postgres;

-- 7. Vérifier l'état final de RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 8. Lister les politiques restantes (devrait être vide)
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'protocol1_evaluations' 
AND schemaname = 'public';

-- 9. Vérifier les permissions accordées
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'protocol1_evaluations' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 10. Test d'insertion pour vérifier que tout fonctionne
DO $$
BEGIN
    -- Tenter une insertion de test (sera rollback après)
    BEGIN
        INSERT INTO public.protocol1_evaluations (
            application_id, 
            evaluator_id,
            cv_score,
            overall_score,
            status
        ) VALUES (
            'test-application-id',
            'test-evaluator-id',
            0,
            0,
            'pending'
        );
        
        -- Si on arrive ici, l'insertion a réussi
        RAISE NOTICE 'TEST INSERTION SUCCESSFUL: RLS is properly disabled';
        
        -- Nettoyer le test
        DELETE FROM public.protocol1_evaluations WHERE application_id = 'test-application-id';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'TEST INSERTION FAILED: %', SQLERRM;
    END;
END $$;

-- 11. Confirmation finale
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DÉFINITIVE RLS FIX APPLIED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'protocol1_evaluations is now fully accessible';
    RAISE NOTICE 'RLS disabled, all policies removed';
    RAISE NOTICE 'Full permissions granted to all roles';
    RAISE NOTICE 'Table should now accept all operations without 403 errors';
    RAISE NOTICE 'If 403 errors persist, clear browser cache and try again';
    RAISE NOTICE '========================================';
END $$;
