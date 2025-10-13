-- ============================================================================
-- CORRECTION RAPIDE : PERMETTRE À TOUS LES RECRUTEURS DE VOIR TOUTES LES CANDIDATURES
-- ============================================================================
-- 
-- Exécutez ce script dans Supabase Dashboard → SQL Editor
-- 
-- ============================================================================

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "applications_view_recruiter" ON public.applications;
DROP POLICY IF EXISTS "applications_select_recruiter" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON public.applications;

-- Créer une nouvelle politique permissive pour les recruteurs
CREATE POLICY "All recruiters can view all applications" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role IN ('recruteur', 'admin', 'recruiter')
        )
    );

-- Créer une politique pour que les recruteurs puissent modifier les candidatures
CREATE POLICY "All recruiters can update applications" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role IN ('recruteur', 'admin', 'recruiter')
        )
    );

-- Vérifier que les politiques ont été créées
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'applications' 
AND schemaname = 'public'
ORDER BY policyname;

-- ============================================================================
-- RÉSULTAT
-- ============================================================================
-- 
-- Maintenant tous les recruteurs peuvent voir toutes les candidatures !
-- 
-- ============================================================================
