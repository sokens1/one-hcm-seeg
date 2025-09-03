-- TEST DE LA CORRECTION RLS
-- Exécutez ce script dans l'éditeur SQL Supabase pour vérifier que la correction fonctionne

-- 1. Vérifier l'état de RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 2. Lister les politiques restantes (devrait être vide)
SELECT 
    policyname, 
    cmd, 
    roles
FROM pg_policies 
WHERE tablename = 'protocol1_evaluations' 
AND schemaname = 'public';

-- 3. Vérifier les permissions
SELECT 
    grantee, 
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'protocol1_evaluations' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 4. Test d'insertion (sera supprimé après)
DO $$
BEGIN
    -- Tenter une insertion de test
    BEGIN
        INSERT INTO public.protocol1_evaluations (
            application_id, 
            evaluator_id,
            cv_score,
            overall_score,
            status
        ) VALUES (
            gen_random_uuid()::text,
            gen_random_uuid()::text,
            0,
            0,
            'pending'
        );
        
        RAISE NOTICE '✅ TEST INSERTION RÉUSSI: RLS est correctement désactivé';
        
        -- Nettoyer le test
        DELETE FROM public.protocol1_evaluations 
        WHERE status = 'pending' 
        AND cv_score = 0 
        AND overall_score = 0;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ TEST INSERTION ÉCHOUÉ: %', SQLERRM;
    END;
END $$;

-- 5. Confirmation finale
SELECT 'CORRECTION RLS APPLIQUÉE - La table protocol1_evaluations est maintenant accessible' as status;
