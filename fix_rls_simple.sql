-- Correction RLS simple et optimisée pour protocol1_evaluations
-- Appliquer ce SQL directement dans l'interface Supabase

-- 1. Désactiver temporairement RLS pour corriger les politiques
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Recruteurs peuvent voir toutes les évaluations protocol1" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Recruteurs peuvent créer des évaluations protocol1" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Recruteurs peuvent modifier leurs évaluations protocol1" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Recruteurs peuvent supprimer leurs évaluations protocol1" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Admins peuvent tout faire sur protocol1_evaluations" ON public.protocol1_evaluations;

-- 3. Réactiver RLS
ALTER TABLE public.protocol1_evaluations ENABLE ROW LEVEL SECURITY;

-- 4. Créer une politique simple pour les recruteurs
CREATE POLICY "Recruteurs peuvent gérer les évaluations protocol1" 
ON public.protocol1_evaluations FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'recruiter', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'recruiter', 'admin')
  )
);

-- 5. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_application_id ON public.protocol1_evaluations(application_id);
