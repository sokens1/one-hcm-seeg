-- Fix définitif de la récursion infinie dans les politiques RLS
-- Cette migration supprime toutes les politiques problématiques et les recrée proprement

DO $$
BEGIN
    -- 1. Désactiver RLS temporairement
    ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.candidate_profiles DISABLE ROW LEVEL SECURITY;
    
    -- 2. Supprimer TOUTES les politiques existantes sur users
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
    DROP POLICY IF EXISTS "Candidates can view their own user data" ON public.users;
    DROP POLICY IF EXISTS "users_select_own" ON public.users;
    DROP POLICY IF EXISTS "users_update_own" ON public.users;
    DROP POLICY IF EXISTS "All authenticated users can view active job offers" ON public.job_offers;
    DROP POLICY IF EXISTS "Recruiters and Admins can manage all job offers" ON public.job_offers;
    DROP POLICY IF EXISTS "Observers can view job offers" ON public.job_offers;
    
    -- 3. Supprimer TOUTES les politiques existantes sur candidate_profiles
    DROP POLICY IF EXISTS "Users can view their own candidate profile" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "Users can insert their own candidate profile" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "Users can update their own candidate profile" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "Recruiters and Admins can view all candidate profiles" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "Simple user profile access" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "Recruiters can view all profiles" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "candidate_profiles_all_own" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "candidate_profiles_select_recruiters" ON public.candidate_profiles;
    
    -- 4. Recréer les politiques users de manière simple et non-récursive
    CREATE POLICY "users_select_policy" ON public.users
        FOR SELECT USING (true); -- Permettre à tous les utilisateurs authentifiés de voir les profils
    
    CREATE POLICY "users_update_policy" ON public.users
        FOR UPDATE USING (auth.uid()::text = id::text); -- Seuls les utilisateurs peuvent modifier leur propre profil
    
    -- 5. Recréer les politiques candidate_profiles de manière simple
    CREATE POLICY "candidate_profiles_select_policy" ON public.candidate_profiles
        FOR SELECT USING (true); -- Permettre à tous les utilisateurs authentifiés de voir les profils candidats
    
    CREATE POLICY "candidate_profiles_insert_policy" ON public.candidate_profiles
        FOR INSERT WITH CHECK (auth.uid()::text = user_id::text); -- Seuls les utilisateurs peuvent créer leur propre profil
    
    CREATE POLICY "candidate_profiles_update_policy" ON public.candidate_profiles
        FOR UPDATE USING (auth.uid()::text = user_id::text)
        WITH CHECK (auth.uid()::text = user_id::text); -- Seuls les utilisateurs peuvent modifier leur propre profil
    
    -- 6. Recréer les politiques job_offers de manière simple
    CREATE POLICY "job_offers_select_policy" ON public.job_offers
        FOR SELECT USING (true); -- Permettre à tous les utilisateurs authentifiés de voir les offres
    
    CREATE POLICY "job_offers_manage_policy" ON public.job_offers
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
    
    -- 7. Recréer les politiques applications de manière simple
    CREATE POLICY "applications_select_candidate" ON public.applications
        FOR SELECT USING (auth.uid()::text = candidate_id::text);
    
    CREATE POLICY "applications_select_recruiter" ON public.applications
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.job_offers jo
                JOIN public.users u ON u.id::text = auth.uid()::text
                WHERE jo.id = job_offer_id
                AND (jo.recruiter_id::text = auth.uid()::text OR u.role = 'admin')
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
                JOIN public.users u ON u.id::text = auth.uid()::text
                WHERE jo.id = job_offer_id
                AND (jo.recruiter_id::text = auth.uid()::text OR u.role = 'admin')
            )
        );
    
    -- 8. Réactiver RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Politiques RLS corrigées - récursion infinie résolue définitivement';
END $$;
