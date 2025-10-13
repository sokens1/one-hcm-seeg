-- ============================================================================
-- CORRECTION : PERMETTRE À TOUS LES RECRUTEURS DE VOIR TOUTES LES CANDIDATURES
-- Date: 2025-10-13
-- ============================================================================
-- 
-- Problème : Les recruteurs ne peuvent voir que les candidatures des offres qu'ils ont créées
-- Solution : Permettre à tous les recruteurs de voir toutes les candidatures
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

-- Créer une politique pour que les recruteurs puissent insérer des candidatures (si nécessaire)
CREATE POLICY "All recruiters can insert applications" ON public.applications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role IN ('recruteur', 'admin', 'recruiter')
        )
    );

-- Vérifier que les politiques ont été créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'applications' 
AND schemaname = 'public'
ORDER BY policyname;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- 
-- Tous les recruteurs (rôle 'recruteur', 'admin', 'recruiter') pourront maintenant :
-- - Voir toutes les candidatures (pas seulement celles de leurs offres)
-- - Modifier toutes les candidatures
-- - Insérer des candidatures si nécessaire
-- 
-- ============================================================================
