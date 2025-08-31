-- Test rapide : Politique RLS simplifiée pour les recruteurs
-- À exécuter dans le Supabase SQL Editor

-- Supprimer toutes les politiques existantes sur applications
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their job offers" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their job offers" ON public.applications;
DROP POLICY IF EXISTS "Allow read access to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow update access to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow insert access to applications" ON public.applications;

-- Politique de lecture simple
CREATE POLICY "Simple read policy" ON public.applications
FOR SELECT
USING (
  candidate_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin', 'observateur')
  )
);

-- Politique de mise à jour simple
CREATE POLICY "Simple update policy" ON public.applications
FOR UPDATE
USING (
  candidate_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin')
  )
)
WITH CHECK (
  candidate_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin')
  )
);

-- Politique d'insertion simple
CREATE POLICY "Simple insert policy" ON public.applications
FOR INSERT
WITH CHECK (
  candidate_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin')
  )
);
