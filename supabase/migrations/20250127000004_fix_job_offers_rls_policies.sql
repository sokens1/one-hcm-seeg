-- Fix RLS policies for job_offers to ensure proper access for all user types
-- This migration addresses the issue where job offers fail to load due to RLS policies

-- Vérifier si la table existe avant de la modifier
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'job_offers'
    ) THEN
        -- Drop existing conflicting policies
        DROP POLICY IF EXISTS "Everyone can view active job offers" ON public.job_offers;
        DROP POLICY IF EXISTS "Recruiters can manage their job offers" ON public.job_offers;
        DROP POLICY IF EXISTS "Recruiters can create job offers" ON public.job_offers;
        DROP POLICY IF EXISTS "Recruiters and Admins can manage all job offers" ON public.job_offers;

        -- Create a simple policy that allows everyone to view active job offers
        CREATE POLICY "Everyone can view active job offers" ON public.job_offers
          FOR SELECT 
          USING (status = 'active');

        -- Create policy for recruiters and admins to manage job offers
        CREATE POLICY "Recruiters and Admins can manage job offers" ON public.job_offers
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE id = auth.uid() 
              AND role IN ('recruteur', 'admin', 'recruiter')
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE id = auth.uid() 
              AND role IN ('recruteur', 'admin', 'recruiter')
            )
          );

        -- Create policy for observers to view job offers (read-only)
        CREATE POLICY "Observers can view job offers" ON public.job_offers
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE id = auth.uid() 
              AND role IN ('observateur', 'observer')
            )
          );

        -- Ensure RLS is enabled
        ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_job_offers_status ON public.job_offers(status);
        CREATE INDEX IF NOT EXISTS idx_job_offers_recruiter_id ON public.job_offers(recruiter_id);
        CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
        
        RAISE NOTICE 'RLS policies for job_offers updated successfully';
    ELSE
        RAISE NOTICE 'Table job_offers does not exist, skipping migration';
    END IF;
END $$;