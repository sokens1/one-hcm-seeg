-- Supprimer toutes les politiques existantes du bucket application-documents
DELETE FROM storage.objects WHERE bucket_id = 'application-documents';

-- Supprimer et recréer le bucket avec des politiques permissives
DELETE FROM storage.buckets WHERE id = 'application-documents';

-- Créer le bucket application-documents avec accès public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-documents',
  'application-documents',
  true, -- Bucket public
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Politique pour permettre à tous les utilisateurs authentifiés de lire les fichiers
CREATE POLICY "Allow authenticated users to read documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'application-documents' AND 
  auth.role() = 'authenticated'
);

-- Politique pour permettre aux utilisateurs authentifiés d'uploader des fichiers
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'application-documents' AND 
  auth.role() = 'authenticated'
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Allow users to delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'application-documents' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres fichiers
CREATE POLICY "Allow users to update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'application-documents' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
