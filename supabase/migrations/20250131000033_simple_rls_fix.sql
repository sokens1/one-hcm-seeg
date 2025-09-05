-- Fix simple des politiques RLS pour éviter les récursions
-- Supprimer et recréer les politiques problématiques

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can insert their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Recruiters and Admins can view all candidate profiles" ON public.candidate_profiles;

-- Recréer les politiques de manière simple
CREATE POLICY "Simple user profile access" ON public.candidate_profiles
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Politique pour les recruteurs et admins
CREATE POLICY "Recruiters can view all profiles" ON public.candidate_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role IN ('recruteur', 'admin', 'recruiter')
        )
    );
