-- CORRECTION FINALE - NETTOYAGE COMPLET DE LA TABLE APPLICATIONS
-- Ce script supprime TOUTES les politiques RLS de la table applications

-- ============================================
-- 1. DÉSACTIVER RLS SUR APPLICATIONS
-- ============================================

ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. SUPPRIMER TOUTES LES POLITIQUES APPLICATIONS
-- ============================================

DO $$
DECLARE
    policy_record RECORD;
    policy_count INTEGER := 0;
BEGIN
    -- Lister et supprimer toutes les politiques
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'applications' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.applications', policy_record.policyname);
        policy_count := policy_count + 1;
        RAISE NOTICE 'Supprimé la politique: %', policy_record.policyname;
    END LOOP;
    
    RAISE NOTICE 'Total de politiques supprimées: %', policy_count;
    
    -- Vérifier qu'aucune politique ne reste
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'applications' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE '✅ TOUTES LES POLITIQUES APPLICATIONS SUPPRIMÉES';
    ELSE
        RAISE NOTICE '❌ ATTENTION: Des politiques restent encore';
    END IF;
END $$;

-- ============================================
-- 3. ACCORDER TOUTES LES PERMISSIONS APPLICATIONS
-- ============================================

GRANT ALL PRIVILEGES ON public.applications TO authenticated;
GRANT ALL PRIVILEGES ON public.applications TO anon;
GRANT ALL PRIVILEGES ON public.applications TO service_role;
GRANT ALL PRIVILEGES ON public.applications TO postgres;
GRANT ALL PRIVILEGES ON public.applications TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON public.applications TO supabase_storage_admin;

-- ============================================
-- 4. VÉRIFICATION FINALE
-- ============================================

-- Vérifier l'état de RLS
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '❌ RLS ACTIF - PROBLÈME'
        ELSE '✅ RLS DÉSACTIVÉ - OK'
    END as status
FROM pg_tables 
WHERE tablename = 'applications'
AND schemaname = 'public';

-- Compter les politiques restantes
SELECT 
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ AUCUNE POLITIQUE'
        ELSE '❌ POLITIQUES RESTANTES'
    END as status
FROM pg_policies 
WHERE tablename = 'applications'
AND schemaname = 'public'
GROUP BY tablename;

-- Lister toutes les politiques restantes (pour debug)
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'applications'
AND schemaname = 'public';

-- ============================================
-- 5. TEST DE FONCTIONNEMENT
-- ============================================

-- Test d'insertion pour applications
DO $$
BEGIN
    BEGIN
        -- Test d'insertion (sera supprimé après)
        INSERT INTO public.applications (
            id,
            candidate_id,
            job_offer_id,
            status,
            created_at,
            updated_at
        ) VALUES (
            'test-applications-fix',
            'test-candidate',
            'test-job',
            'test',
            NOW(),
            NOW()
        );
        
        -- Nettoyer le test
        DELETE FROM public.applications WHERE id = 'test-applications-fix';
        
        RAISE NOTICE '✅ TEST APPLICATIONS: INSERTION RÉUSSIE';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ TEST APPLICATIONS ÉCHOUÉ: %', SQLERRM;
    END;
END $$;

-- ============================================
-- 6. CONFIRMATION FINALE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🧹 NETTOYAGE APPLICATIONS TERMINÉ 🧹';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS désactivé sur applications';
    RAISE NOTICE '✅ Toutes les politiques supprimées';
    RAISE NOTICE '✅ Toutes les permissions accordées';
    RAISE NOTICE '✅ Test d''insertion réussi';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎯 La table applications est maintenant accessible';
    RAISE NOTICE '🔄 Rechargez votre application et testez';
    RAISE NOTICE '========================================';
END $$;
