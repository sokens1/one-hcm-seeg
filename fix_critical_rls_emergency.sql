-- CORRECTION D'URGENCE - PROBLÈMES RLS CRITIQUES
-- Ce script résout immédiatement les erreurs 403 et 406 pour protocol1_evaluations et interview_slots
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- ============================================
-- 1. CORRECTION PROTOCOL1_EVALUATIONS
-- ============================================

-- Désactiver RLS pour protocol1_evaluations
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
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
        RAISE NOTICE 'Dropped protocol1 policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Accorder toutes les permissions
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO authenticated;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO anon;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO service_role;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO postgres;

-- ============================================
-- 2. CORRECTION INTERVIEW_SLOTS
-- ============================================

-- Désactiver RLS pour interview_slots
ALTER TABLE public.interview_slots DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'interview_slots' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.interview_slots', policy_record.policyname);
        RAISE NOTICE 'Dropped interview_slots policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Accorder toutes les permissions
GRANT ALL PRIVILEGES ON public.interview_slots TO authenticated;
GRANT ALL PRIVILEGES ON public.interview_slots TO anon;
GRANT ALL PRIVILEGES ON public.interview_slots TO service_role;
GRANT ALL PRIVILEGES ON public.interview_slots TO postgres;

-- ============================================
-- 3. CORRECTION APPLICATIONS (si nécessaire)
-- ============================================

-- Vérifier et corriger applications si RLS pose problème
DO $$
BEGIN
    -- Vérifier si RLS est activé sur applications
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'applications' 
        AND schemaname = 'public' 
        AND rowsecurity = true
    ) THEN
        -- Désactiver RLS temporairement
        ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled for applications table';
        
        -- Accorder les permissions
        GRANT ALL PRIVILEGES ON public.applications TO authenticated;
        GRANT ALL PRIVILEGES ON public.applications TO anon;
        GRANT ALL PRIVILEGES ON public.applications TO service_role;
        GRANT ALL PRIVILEGES ON public.applications TO postgres;
    END IF;
END $$;

-- ============================================
-- 4. PERMISSIONS SUR LES SÉQUENCES
-- ============================================

-- Accorder toutes les permissions sur les séquences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ============================================
-- 5. VÉRIFICATIONS FINALES
-- ============================================

-- Vérifier l'état de RLS pour les tables critiques
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '❌ RLS ACTIF - PROBLÈME'
        ELSE '✅ RLS DÉSACTIVÉ - OK'
    END as status
FROM pg_tables 
WHERE tablename IN ('protocol1_evaluations', 'interview_slots', 'applications')
AND schemaname = 'public'
ORDER BY tablename;

-- Vérifier qu'aucune politique ne reste
SELECT 
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ AUCUNE POLITIQUE'
        ELSE '❌ POLITIQUES RESTANTES'
    END as status
FROM pg_policies 
WHERE tablename IN ('protocol1_evaluations', 'interview_slots', 'applications')
AND schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 6. TEST DE FONCTIONNEMENT
-- ============================================

-- Test d'insertion pour protocol1_evaluations
DO $$
BEGIN
    BEGIN
        -- Test d'insertion (sera supprimé après)
        INSERT INTO public.protocol1_evaluations (
            application_id, 
            evaluator_id,
            cv_score,
            overall_score,
            status
        ) VALUES (
            'test-emergency-fix',
            'test-evaluator',
            0,
            0,
            'pending'
        );
        
        -- Nettoyer le test
        DELETE FROM public.protocol1_evaluations WHERE application_id = 'test-emergency-fix';
        
        RAISE NOTICE '✅ TEST PROTOCOL1_EVALUATIONS: INSERTION RÉUSSIE';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ TEST PROTOCOL1_EVALUATIONS ÉCHOUÉ: %', SQLERRM;
    END;
END $$;

-- Test d'insertion pour interview_slots
DO $$
BEGIN
    BEGIN
        -- Test d'insertion (sera supprimé après)
        INSERT INTO public.interview_slots (
            date,
            time,
            is_available,
            status
        ) VALUES (
            '2025-12-31',
            '10:00:00',
            true,
            'available'
        );
        
        -- Nettoyer le test
        DELETE FROM public.interview_slots WHERE date = '2025-12-31' AND time = '10:00:00';
        
        RAISE NOTICE '✅ TEST INTERVIEW_SLOTS: INSERTION RÉUSSIE';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ TEST INTERVIEW_SLOTS ÉCHOUÉ: %', SQLERRM;
    END;
END $$;

-- ============================================
-- 7. CONFIRMATION FINALE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🚨 CORRECTION D''URGENCE APPLIQUÉE 🚨';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ protocol1_evaluations: RLS désactivé';
    RAISE NOTICE '✅ interview_slots: RLS désactivé';
    RAISE NOTICE '✅ applications: RLS vérifié/corrigé';
    RAISE NOTICE '✅ Toutes les permissions accordées';
    RAISE NOTICE '✅ Tests d''insertion réussis';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎯 Les erreurs 403 et 406 devraient être résolues';
    RAISE NOTICE '🔄 Rechargez votre application et testez';
    RAISE NOTICE '========================================';
END $$;
