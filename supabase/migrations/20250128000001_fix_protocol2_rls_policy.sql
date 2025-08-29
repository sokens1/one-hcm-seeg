-- Fix RLS policy for protocol2_evaluations - make it less restrictive

-- Drop existing policy
DROP POLICY IF EXISTS "Recruiters can manage protocol2 evaluations" ON public.protocol2_evaluations;

-- Create more permissive RLS policy for protocol2_evaluations
-- Allow access to users with role 'recruteur' or 'admin'
CREATE POLICY "Recruiters and admins can manage protocol2 evaluations" ON public.protocol2_evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() 
      AND u.role IN ('recruteur', 'admin')
    )
  );

-- Also create a policy for evaluators to access their own evaluations
CREATE POLICY "Evaluators can manage their own protocol2 evaluations" ON public.protocol2_evaluations
  FOR ALL USING (
    evaluator_id = auth.uid()
  );
