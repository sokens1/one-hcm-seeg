-- Fix RLS policy for job_offers to allow recruiters to create job offers
-- The issue is that the current policy requires exact role match, but we need to be more flexible

-- Drop existing policies
DROP POLICY IF EXISTS "Recruiters can create job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Recruiters can manage their job offers" ON public.job_offers;

-- Recreate the policies with better logic
CREATE POLICY "Recruiters can create job offers" ON public.job_offers
  FOR INSERT WITH CHECK (
    recruiter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('recruteur', 'admin')
    )
  );

CREATE POLICY "Recruiters can manage their job offers" ON public.job_offers
  FOR ALL USING (
    recruiter_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add a policy for updating job offers specifically
CREATE POLICY "Recruiters can update their job offers" ON public.job_offers
  FOR UPDATE USING (
    recruiter_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_offers_recruiter_id ON public.job_offers(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON public.job_offers(status);

-- Debug: Add a function to check user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;
