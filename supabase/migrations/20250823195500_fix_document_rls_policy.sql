-- This policy grants SELECT access on application_documents to recruiters
-- if they have access to the associated job offer.

-- Drop the old policy first
DROP POLICY IF EXISTS "Allow recruiters to read application documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated recruiters to select documents" ON public.application_documents;

-- Create a new, more robust policy for table access
CREATE POLICY "Allow authenticated recruiters to select documents" ON public.application_documents
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'user_role') = 'recruteur' AND
  EXISTS (
    SELECT 1
    FROM applications a
    JOIN job_offers jo ON a.job_offer_id = jo.id
    WHERE a.id = application_documents.application_id
  )
);

-- Create a new policy for storage access
CREATE POLICY "Allow recruiters to read application documents" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-documents' AND
  (auth.jwt() ->> 'user_role') = 'recruteur'
);
