-- Supprimer les anciennes politiques pour les recréer
-- Cette migration sera appliquée après la création de la table dans les migrations principales

-- Vérifier si la table existe avant de la modifier
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'protocol1_evaluations') THEN
    -- Supprimer les anciennes politiques pour les recréer
    DROP POLICY IF EXISTS "Recruteurs peuvent voir toutes les évaluations protocol1" ON public.protocol1_evaluations;
    DROP POLICY IF EXISTS "Recruteurs peuvent créer des évaluations protocol1" ON public.protocol1_evaluations;
    DROP POLICY IF EXISTS "Recruteurs peuvent modifier leurs évaluations protocol1" ON public.protocol1_evaluations;
    DROP POLICY IF EXISTS "Recruteurs peuvent supprimer leurs évaluations protocol1" ON public.protocol1_evaluations;
    DROP POLICY IF EXISTS "Admins peuvent tout faire sur protocol1_evaluations" ON public.protocol1_evaluations;

    -- Politique plus permissive pour SELECT - tous les utilisateurs authentifiés peuvent voir
    CREATE POLICY "Utilisateurs authentifiés peuvent voir les évaluations protocol1" 
    ON public.protocol1_evaluations FOR SELECT 
    TO authenticated 
    USING (true);

    -- Politique pour INSERT - tous les utilisateurs authentifiés peuvent créer
    CREATE POLICY "Utilisateurs authentifiés peuvent créer des évaluations protocol1" 
    ON public.protocol1_evaluations FOR INSERT 
    TO authenticated 
    WITH CHECK (evaluator_id = auth.uid());

    -- Politique pour UPDATE - utilisateurs peuvent modifier leurs propres évaluations
    CREATE POLICY "Utilisateurs peuvent modifier leurs évaluations protocol1" 
    ON public.protocol1_evaluations FOR UPDATE 
    TO authenticated 
    USING (evaluator_id = auth.uid())
    WITH CHECK (evaluator_id = auth.uid());

    -- Politique pour DELETE - utilisateurs peuvent supprimer leurs propres évaluations
    CREATE POLICY "Utilisateurs peuvent supprimer leurs évaluations protocol1" 
    ON public.protocol1_evaluations FOR DELETE 
    TO authenticated 
    USING (evaluator_id = auth.uid());

    -- Commentaire sur les nouvelles politiques
    COMMENT ON POLICY "Utilisateurs authentifiés peuvent voir les évaluations protocol1" ON public.protocol1_evaluations IS 'Permet à tous les utilisateurs authentifiés de voir les évaluations du protocole 1';
    COMMENT ON POLICY "Utilisateurs authentifiés peuvent créer des évaluations protocol1" ON public.protocol1_evaluations IS 'Permet à tous les utilisateurs authentifiés de créer des évaluations du protocole 1';
    COMMENT ON POLICY "Utilisateurs peuvent modifier leurs évaluations protocol1" ON public.protocol1_evaluations IS 'Permet aux utilisateurs de modifier leurs propres évaluations du protocole 1';
  END IF;
END $$;
