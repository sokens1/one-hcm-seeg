
-- 1. Mettre à jour la politique RLS pour la table application_documents
-- Supprime l'ancienne politique (si elle existe) pour éviter les conflits
DROP POLICY IF EXISTS "Recruiters can view documents for their job offers" ON public.application_documents;

-- Crée la nouvelle politique
CREATE POLICY "Recruiters can view any application document"
ON public.application_documents
FOR SELECT
TO authenticated
USING (
  ((auth.jwt() ->> 'user_role') = 'recruteur')
);

-- 2. Mettre à jour la politique RLS pour le bucket de stockage
-- Supprime l'ancienne politique (si elle existe)
DROP POLICY IF EXISTS "Recruiter can view documents" ON storage.objects;

-- Crée la nouvelle politique pour le bucket
CREATE POLICY "Recruiter can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'application-documents' AND
  ((auth.jwt() ->> 'user_role') = 'recruteur')
);
