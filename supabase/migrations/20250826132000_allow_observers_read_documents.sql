-- Allow observers to read application documents and access storage objects (read-only)
-- Mirrors recruiter read access, but for role 'observateur' (and alias 'observer')

-- Safety: drop if exist to keep migration idempotent
DROP POLICY IF EXISTS "Observers can view all application documents" ON public.application_documents;
DROP POLICY IF EXISTS "Observers can access document storage" ON storage.objects;

-- Ensure RLS is enabled on application_documents (no-op if already enabled)
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- Policy: observers can select all application_documents
CREATE POLICY "Observers can view all application documents" ON public.application_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
      AND (users.role = 'observateur' OR users.role = 'observer')
  )
);

-- Storage policy: observers can read files inside the application-documents bucket
CREATE POLICY "Observers can access document storage" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-documents' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
      AND (users.role = 'observateur' OR users.role = 'observer')
  )
);
