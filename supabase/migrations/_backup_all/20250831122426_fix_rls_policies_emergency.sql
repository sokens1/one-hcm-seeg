-- Migration d'urgence pour corriger les politiques RLS
-- Permettre aux recruteurs de modifier les statuts des applications

-- 1. Désactiver temporairement RLS pour nettoyer
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes qui causent des conflits
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
DROP POLICY IF EXISTS "Recruiters can do everything" ON public.applications;
DROP POLICY IF EXISTS "Candidates can view their applications" ON public.applications;

-- 3. Créer une politique ULTRA SIMPLE pour les recruteurs/admins
CREATE POLICY "Recruiters and admins full access" ON public.applications
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

-- 5. Politique pour les observateurs (lecture seule)
CREATE POLICY "Observers can view applications" ON public.applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'observateur'
  )
);

-- 6. Réactiver RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 7. Créer une fonction helper pour vérifier les permissions
CREATE OR REPLACE FUNCTION public.can_modify_application_status(application_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM public.applications a
    JOIN public.users u ON u.id = auth.uid()
    WHERE a.id = application_id
    AND u.role IN ('recruteur', 'admin')
  );
$$;

-- Commenter la fonction
COMMENT ON FUNCTION public.can_modify_application_status(UUID) IS 
'Vérifie si l''utilisateur connecté peut modifier le statut d''une application';
