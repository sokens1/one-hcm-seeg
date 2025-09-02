-- Activer RLS sur la table protocol1_evaluations
ALTER TABLE public.protocol1_evaluations ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux recruteurs de voir toutes les évaluations
CREATE POLICY "Recruteurs peuvent voir toutes les évaluations protocol1" 
ON public.protocol1_evaluations FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'recruiter'
  )
);

-- Politique pour permettre aux recruteurs d'insérer des évaluations
CREATE POLICY "Recruteurs peuvent créer des évaluations protocol1" 
ON public.protocol1_evaluations FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'recruiter'
  )
  AND evaluator_id = auth.uid()
);

-- Politique pour permettre aux recruteurs de mettre à jour leurs évaluations
CREATE POLICY "Recruteurs peuvent modifier leurs évaluations protocol1" 
ON public.protocol1_evaluations FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'recruiter'
  )
  AND evaluator_id = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'recruiter'
  )
  AND evaluator_id = auth.uid()
);

-- Politique pour permettre aux recruteurs de supprimer leurs évaluations
CREATE POLICY "Recruteurs peuvent supprimer leurs évaluations protocol1" 
ON public.protocol1_evaluations FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'recruiter'
  )
  AND evaluator_id = auth.uid()
);

-- Politique pour permettre aux admins de tout faire
CREATE POLICY "Admins peuvent tout faire sur protocol1_evaluations" 
ON public.protocol1_evaluations FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Index pour améliorer les performances des requêtes RLS
CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_evaluator_id ON public.protocol1_evaluations(evaluator_id);

-- Commentaire sur les politiques
COMMENT ON POLICY "Recruteurs peuvent voir toutes les évaluations protocol1" ON public.protocol1_evaluations IS 'Permet aux recruteurs de voir toutes les évaluations du protocole 1';
COMMENT ON POLICY "Recruteurs peuvent créer des évaluations protocol1" ON public.protocol1_evaluations IS 'Permet aux recruteurs de créer des évaluations du protocole 1';
COMMENT ON POLICY "Recruteurs peuvent modifier leurs évaluations protocol1" ON public.protocol1_evaluations IS 'Permet aux recruteurs de modifier leurs propres évaluations du protocole 1';
COMMENT ON POLICY "Admins peuvent tout faire sur protocol1_evaluations" ON public.protocol1_evaluations IS 'Permet aux admins de gérer toutes les évaluations du protocole 1';
