-- SOLUTION D'URGENCE : Corriger les politiques RLS
-- À exécuter IMMÉDIATEMENT dans le Supabase SQL Editor

-- 1. Désactiver temporairement RLS pour tester
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their job offers" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their job offers" ON public.applications;
DROP POLICY IF EXISTS "Allow read access to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow update access to applications" ON public.applications;
DROP POLICY IF EXISTS "Allow insert access to applications" ON public.applications;
DROP POLICY IF EXISTS "Simple read policy" ON public.applications;
DROP POLICY IF EXISTS "Simple update policy" ON public.applications;
DROP POLICY IF EXISTS "Simple insert policy" ON public.applications;

-- 3. Créer une politique ULTRA SIMPLE pour les recruteurs
CREATE POLICY "Recruiters can do everything" ON public.applications
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin')
  )
);

-- 4. Politique pour les candidats (lecture seule de leurs candidatures)
CREATE POLICY "Candidates can view their applications" ON public.applications
FOR SELECT
USING (candidate_id = auth.uid());

-- 5. Réactiver RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 6. Vérifier que ça fonctionne
SELECT 'Politiques RLS mises à jour avec succès' as status;
