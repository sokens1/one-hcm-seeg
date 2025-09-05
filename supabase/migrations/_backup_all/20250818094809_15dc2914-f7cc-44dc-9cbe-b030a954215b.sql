-- Création des buckets de stockage pour les documents

-- Bucket pour les CV et documents de candidature
INSERT INTO storage.buckets (id, name, public) VALUES 
('application-documents', 'application-documents', false);

-- Policies pour les documents de candidature
CREATE POLICY "Candidates can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'application-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Candidates can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'application-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Recruiters can view all application documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'application-documents' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
  )
);

CREATE POLICY "Candidates can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'application-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Candidates can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'application-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);