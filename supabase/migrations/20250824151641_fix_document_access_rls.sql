-- Goal: Make the document access RLS policies idempotent by dropping them before creating.
-- Problem: The migration failed because policies already existed from a partial run.

-- Drop all potentially conflicting policies, including the ones this script creates.
DROP POLICY IF EXISTS "Recruiter can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins and Recruiters can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects; -- Old name
DROP POLICY IF EXISTS "Allow read access to documents based on role" ON storage.objects; -- New name for SELECT
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects; -- New name for INSERT

-- Create a unified SELECT policy for all roles.
CREATE POLICY "Allow read access to documents based on role" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND (
    -- Admins and recruiters can see everything in the bucket.
    (get_my_claim('user_role')::text IN ('admin', 'recruteur')) OR
    -- Candidates can only see documents within their own folder (named by their user_id).
    (
      get_my_claim('user_role')::text = 'candidat' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )
  )
);

-- Create a unified INSERT policy for all authenticated users.
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
);
