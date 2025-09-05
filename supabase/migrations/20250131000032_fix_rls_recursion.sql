-- Fix de la récursion infinie dans les politiques RLS
-- Cette migration corrige les politiques qui causent des récursions infinies

DO $$
BEGIN
    -- Supprimer toutes les politiques existantes qui pourraient causer des récursions
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
    DROP POLICY IF EXISTS "Candidates can view their own user data" ON public.users;
    DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.candidate_profiles;
    DROP POLICY IF EXISTS "Recruiters and Admins can view all candidate profiles" ON public.candidate_profiles;

    -- Recréer les politiques users de manière simple
    CREATE POLICY "Users can view their own profile" ON public.users
        FOR SELECT USING (auth.uid()::text = id::text);
    
    CREATE POLICY "Users can update their own profile" ON public.users
        FOR UPDATE USING (auth.uid()::text = id::text);

    -- Recréer les politiques candidate_profiles de manière simple
    CREATE POLICY "Users can view their own candidate profile" ON public.candidate_profiles
        FOR SELECT USING (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can insert their own candidate profile" ON public.candidate_profiles
        FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can update their own candidate profile" ON public.candidate_profiles
        FOR UPDATE USING (auth.uid()::text = user_id::text)
        WITH CHECK (auth.uid()::text = user_id::text);

    -- Politique pour les recruteurs et admins pour voir tous les profils candidats
    CREATE POLICY "Recruiters and Admins can view all candidate profiles" ON public.candidate_profiles
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.users
                WHERE users.id::text = auth.uid()::text
                AND users.role IN ('recruteur', 'admin', 'recruiter')
            )
        );

    RAISE NOTICE 'Politiques RLS corrigées - récursion infinie résolue';
END $$;
