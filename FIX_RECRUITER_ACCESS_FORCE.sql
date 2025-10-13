-- ============================================================================
-- CORRECTION FORCÉE : SUPPRIMER ET RECRÉER LES POLITIQUES RECRUTEURS
-- ============================================================================
-- 
-- Exécutez ce script dans Supabase Dashboard → SQL Editor
-- 
-- ============================================================================

-- Supprimer TOUTES les politiques existantes liées aux recruteurs sur applications
DROP POLICY IF EXISTS "applications_view_recruiter" ON public.applications;
DROP POLICY IF EXISTS "applications_select_recruiter" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "All recruiters can view all applications" ON public.applications;
DROP POLICY IF EXISTS "All recruiters can update applications" ON public.applications;
DROP POLICY IF EXISTS "All recruiters can insert applications" ON public.applications;
DROP POLICY IF EXISTS "applications_update_recruiter" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their jobs" ON public.applications;

-- Attendre un instant pour s'assurer que les suppressions sont appliquées
SELECT pg_sleep(1);

-- Créer une nouvelle politique permissive pour la LECTURE
CREATE POLICY "All recruiters can view all applications" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role IN ('recruteur', 'admin', 'recruiter')
        )
    );

-- Créer une nouvelle politique permissive pour la MODIFICATION
CREATE POLICY "All recruiters can update applications" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role IN ('recruteur', 'admin', 'recruiter')
        )
    );

-- Vérifier que les nouvelles politiques ont été créées
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Avec condition'
        ELSE 'Sans condition'
    END as condition_type
FROM pg_policies 
WHERE tablename = 'applications' 
AND schemaname = 'public'
AND policyname LIKE '%recruiter%'
ORDER BY policyname;

-- ============================================================================
-- RÉSULTAT
-- ============================================================================
-- 
-- Toutes les anciennes politiques ont été supprimées et recréées.
-- Maintenant tous les recruteurs peuvent voir et modifier toutes les candidatures !
-- 
-- ============================================================================
