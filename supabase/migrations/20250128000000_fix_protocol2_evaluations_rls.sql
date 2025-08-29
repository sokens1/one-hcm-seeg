-- Fix RLS and triggers for protocol2_evaluations table

-- Enable Row Level Security for protocol2_evaluations if not already enabled
ALTER TABLE public.protocol2_evaluations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Recruiters can manage protocol2 evaluations" ON public.protocol2_evaluations;

-- Create RLS policy for protocol2_evaluations
CREATE POLICY "Recruiters can manage protocol2 evaluations" ON public.protocol2_evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.job_offers jo ON jo.id = a.job_offer_id
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.id = application_id 
      AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

-- Create trigger for updated_at on protocol2_evaluations
CREATE TRIGGER update_protocol2_evaluations_updated_at 
  BEFORE UPDATE ON public.protocol2_evaluations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
