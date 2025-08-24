-- Goal: Allow any user with 'recruteur' or 'admin' role to manage any job offer.
-- Problem: The previous policy restricted updates to the offer's original creator.

-- Drop the old restrictive policies first to avoid conflicts.
DROP POLICY IF EXISTS "Recruiters can manage their job offers" ON public.job_offers;
DROP POLICY IF EXISTS "Recruiters can update their job offers" ON public.job_offers;

-- Create a new, more permissive policy for all actions (SELECT, INSERT, UPDATE, DELETE).
-- This single policy simplifies management and ensures consistency.
CREATE POLICY "Recruiters and Admins can manage all job offers" ON public.job_offers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
    )
  );

-- The INSERT policy can be removed as the new ALL policy covers it, but we keep it for clarity on creation.
-- We ensure the recruiter_id is correctly set to the creator.
DROP POLICY IF EXISTS "Recruiters can create job offers" ON public.job_offers;
CREATE POLICY "Recruiters can create job offers" ON public.job_offers
  FOR INSERT
  WITH CHECK (
    recruiter_id = auth.uid() AND
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
    )
  );
