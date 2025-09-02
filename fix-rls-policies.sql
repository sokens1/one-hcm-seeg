-- Script SQL à exécuter dans le Supabase SQL Editor
-- Corriger les politiques RLS pour permettre aux recruteurs de modifier les statuts

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their job offers" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their job offers" ON public.applications;

-- Créer de nouvelles politiques plus permissives pour les recruteurs/admins

-- Politique pour la lecture des applications
CREATE POLICY "Allow read access to applications" ON public.applications
FOR SELECT
USING (
  -- Les candidats peuvent voir leurs propres candidatures
  candidate_id = auth.uid() 
  OR 
  -- Les recruteurs/admins peuvent voir toutes les candidatures
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin', 'observateur')
  )
  OR
  -- Les recruteurs peuvent voir les candidatures pour leurs offres
  EXISTS (
    SELECT 1 FROM public.job_offers jo
    JOIN public.users u ON u.id = jo.recruiter_id
    WHERE jo.id = applications.job_offer_id
    AND u.id = auth.uid()
    AND u.role IN ('recruteur', 'admin')
  )
);

-- Politique pour la mise à jour des applications
CREATE POLICY "Allow update access to applications" ON public.applications
FOR UPDATE
USING (
  -- Les candidats peuvent modifier leurs propres candidatures (sauf le statut)
  (candidate_id = auth.uid() AND status = 'candidature')
  OR 
  -- Les recruteurs/admins peuvent modifier toutes les candidatures
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin')
  )
  OR
  -- Les recruteurs peuvent modifier les candidatures pour leurs offres
  EXISTS (
    SELECT 1 FROM public.job_offers jo
    JOIN public.users u ON u.id = jo.recruiter_id
    WHERE jo.id = applications.job_offer_id
    AND u.id = auth.uid()
    AND u.role IN ('recruteur', 'admin')
  )
)
WITH CHECK (
  -- Même conditions pour la vérification
  (candidate_id = auth.uid() AND status = 'candidature')
  OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.job_offers jo
    JOIN public.users u ON u.id = jo.recruiter_id
    WHERE jo.id = applications.job_offer_id
    AND u.id = auth.uid()
    AND u.role IN ('recruteur', 'admin')
  )
);

-- Politique pour l'insertion des applications
CREATE POLICY "Allow insert access to applications" ON public.applications
FOR INSERT
WITH CHECK (
  -- Les candidats peuvent créer leurs propres candidatures
  candidate_id = auth.uid()
  OR
  -- Les recruteurs/admins peuvent créer des candidatures
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'admin')
  )
);

-- S'assurer que RLS est activé
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Créer une fonction helper pour vérifier les permissions
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
    AND (
      u.role IN ('recruteur', 'admin')
      OR
      EXISTS (
        SELECT 1 FROM public.job_offers jo
        WHERE jo.id = a.job_offer_id
        AND jo.recruiter_id = auth.uid()
      )
    )
  );
$$;
