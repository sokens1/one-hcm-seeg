-- Fix critical document access issues for recruiters
-- 1. Remove JWT user_role dependency (causes permission issues)
-- 2. Fix bucket name for storage access

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow authenticated recruiters to select documents" ON public.application_documents;
DROP POLICY IF EXISTS "Allow recruiters to read application documents" ON storage.objects;
DROP POLICY IF EXISTS "recruiters_view_documents_any_offer" ON public.application_documents;
DROP POLICY IF EXISTS "Recruiters can view any application document" ON public.application_documents;

-- Create simple policy: ALL authenticated users with recruiter role can view documents
CREATE POLICY "Recruiters can view all application documents" ON public.application_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'recruteur'
  )
);

-- Fix storage policy with correct bucket name
CREATE POLICY "Recruiters can access document storage" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-documents' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'recruteur'
  )
);

-- Also allow candidates to view their own documents
CREATE POLICY "Candidates can view their documents" ON public.application_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_documents.application_id
    AND a.candidate_id = auth.uid()
  )
);
