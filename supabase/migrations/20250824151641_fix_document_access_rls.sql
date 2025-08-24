-- Supprimer les anciennes politiques conflictuelles sur storage.objects pour le bucket 'documents'
DROP POLICY IF EXISTS "Recruiter can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins and Recruiters can view all documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;

-- Créer une politique SELECT qui combine l'accès pour tous les rôles
CREATE POLICY "Allow read access to documents based on role" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND (
    -- Les admins et recruteurs peuvent tout voir
    (get_my_claim('user_role')::text IN ('admin', 'recruteur')) OR
    -- Les candidats ne peuvent voir que leurs propres documents
    (
      get_my_claim('user_role')::text = 'candidat' AND
      -- Le chemin du fichier doit commencer par l'UUID de l'utilisateur
      (storage.foldername(name))[1] = auth.uid()::text
    )
  )
);

-- Créer une politique INSERT pour autoriser le téléversement par les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
);
