-- Fix applications RLS policies to work with current user role system
-- This migration ensures that recruiters and admins can properly update application statuses

-- Vérifier si la table existe avant de la modifier
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'applications') THEN
    -- Ensure RLS is enabled on the applications table
    ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS applications_select_candidate ON public.applications;
    DROP POLICY IF EXISTS applications_select_recruiter_or_admin ON public.applications;
    DROP POLICY IF EXISTS applications_insert_candidate ON public.applications;
    DROP POLICY IF EXISTS applications_update_candidate_or_recruiter_or_admin ON public.applications;

    -- Create a helper function to get user role from database
    CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
    RETURNS text
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    AS $$
      SELECT role FROM public.users WHERE id = user_id;
    $$;

    -- SELECT: candidates can see their own applications
    CREATE POLICY applications_select_candidate
    ON public.applications
    FOR SELECT
    USING (candidate_id = auth.uid());

    -- SELECT: recruiters or admin can see applications for jobs they own
    CREATE POLICY applications_select_recruiter_or_admin
    ON public.applications
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.job_offers j
        WHERE j.id = applications.job_offer_id
          AND (
            j.recruiter_id = auth.uid() 
            OR public.get_user_role(auth.uid()) = 'admin'
          )
      )
    );

    -- INSERT: candidate can create only his own application
    CREATE POLICY applications_insert_candidate
    ON public.applications
    FOR INSERT
    WITH CHECK (candidate_id = auth.uid());

    -- UPDATE: candidate, recruiter of the job, or admin can update
    CREATE POLICY applications_update_candidate_or_recruiter_or_admin
    ON public.applications
    FOR UPDATE
    USING (
      candidate_id = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM public.job_offers j
        WHERE j.id = applications.job_offer_id
          AND (
            j.recruiter_id = auth.uid() 
            OR public.get_user_role(auth.uid()) = 'admin'
          )
      )
    )
    WITH CHECK (
      candidate_id = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM public.job_offers j
        WHERE j.id = applications.job_offer_id
          AND (
            j.recruiter_id = auth.uid() 
            OR public.get_user_role(auth.uid()) = 'admin'
          )
      )
    );

    -- Grant necessary permissions
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON public.applications TO authenticated;
    GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
  END IF;
END $$;



