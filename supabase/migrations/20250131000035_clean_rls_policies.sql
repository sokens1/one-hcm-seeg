-- Nettoyage complet des politiques RLS pour éliminer la récursion infinie
-- Cette migration supprime TOUTES les politiques et les recrée proprement

-- 1. Désactiver RLS temporairement
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes (même si elles n'existent pas)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Candidates can view their own user data" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

DROP POLICY IF EXISTS "Users can view their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can insert their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Recruiters and Admins can view all candidate profiles" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Simple user profile access" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Recruiters can view all profiles" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_all_own" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_select_recruiters" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_select_policy" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_insert_policy" ON public.candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles_update_policy" ON public.candidate_profiles;

DROP POLICY IF EXISTS "All authenticated users can view active job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Recruiters and Admins can manage all job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Observers can view job offers" ON public.job_offers;
DROP POLICY IF EXISTS "job_offers_select_policy" ON public.job_offers;
DROP POLICY IF EXISTS "job_offers_manage_policy" ON public.job_offers;

DROP POLICY IF EXISTS "Candidates can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Candidates can create applications" ON public.applications;
DROP POLICY IF EXISTS "Candidates can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "applications_select_candidate" ON public.applications;
DROP POLICY IF EXISTS "applications_select_recruiter" ON public.applications;
DROP POLICY IF EXISTS "applications_insert_candidate" ON public.applications;
DROP POLICY IF EXISTS "applications_update_candidate" ON public.applications;
DROP POLICY IF EXISTS "applications_update_recruiter" ON public.applications;

-- 3. Recréer les politiques de manière simple et non-récursive
-- Politiques pour users - très permissives pour éviter la récursion
CREATE POLICY "users_view_all" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Politiques pour candidate_profiles - très permissives
CREATE POLICY "candidate_profiles_view_all" ON public.candidate_profiles
    FOR SELECT USING (true);

CREATE POLICY "candidate_profiles_insert_own" ON public.candidate_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "candidate_profiles_update_own" ON public.candidate_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

-- Politiques pour job_offers - très permissives
CREATE POLICY "job_offers_view_all" ON public.job_offers
    FOR SELECT USING (true);

CREATE POLICY "job_offers_manage_recruiters" ON public.job_offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role IN ('recruteur', 'admin', 'recruiter')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role IN ('recruteur', 'admin', 'recruiter')
        )
    );

-- Politiques pour applications - très permissives
CREATE POLICY "applications_view_candidate" ON public.applications
    FOR SELECT USING (auth.uid()::text = candidate_id::text);

CREATE POLICY "applications_view_recruiter" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.job_offers jo
            WHERE jo.id = job_offer_id
            AND jo.recruiter_id::text = auth.uid()::text
        )
        OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'admin'
        )
    );

CREATE POLICY "applications_insert_candidate" ON public.applications
    FOR INSERT WITH CHECK (auth.uid()::text = candidate_id::text);

CREATE POLICY "applications_update_candidate" ON public.applications
    FOR UPDATE USING (auth.uid()::text = candidate_id::text);

CREATE POLICY "applications_update_recruiter" ON public.applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.job_offers jo
            WHERE jo.id = job_offer_id
            AND jo.recruiter_id::text = auth.uid()::text
        )
        OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'admin'
        )
    );

-- 4. Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
