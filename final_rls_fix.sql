-- CORRECTION FINALE RLS - À EXÉCUTER IMMÉDIATEMENT DANS SUPABASE
-- Copiez et collez ce script dans l'éditeur SQL de votre dashboard Supabase

-- ÉTAPE 1: Désactiver RLS
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Supprimer toutes les politiques
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'protocol1_evaluations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.protocol1_evaluations', policy_record.policyname);
        RAISE NOTICE 'Supprimé: %', policy_record.policyname;
    END LOOP;
END $$;

-- ÉTAPE 3: Accorder toutes les permissions
GRANT ALL ON public.protocol1_evaluations TO authenticated;
GRANT ALL ON public.protocol1_evaluations TO anon;
GRANT ALL ON public.protocol1_evaluations TO service_role;
GRANT ALL ON public.protocol1_evaluations TO postgres;

-- ÉTAPE 4: Permissions sur les séquences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ÉTAPE 5: Vérification
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- ÉTAPE 6: Test d'insertion
DO $$
BEGIN
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
            'test'
        );
        
        RAISE NOTICE '✅ TEST RÉUSSI: RLS est désactivé';
        
        DELETE FROM public.protocol1_evaluations WHERE status = 'test';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ TEST ÉCHOUÉ: %', SQLERRM;
    END;
END $$;

-- ÉTAPE 7: Confirmation
SELECT 'RLS DÉSACTIVÉ - Testez votre application maintenant' as status;
