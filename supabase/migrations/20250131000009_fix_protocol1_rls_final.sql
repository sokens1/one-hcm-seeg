-- Corriger définitivement les politiques RLS pour protocol1_evaluations
-- Cette migration résout les erreurs 403 en appliquant des politiques permissives

-- Vérifier si la table existe avant de la modifier
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'protocol1_evaluations'
    ) THEN
        -- Supprimer toutes les anciennes politiques
        DROP POLICY IF EXISTS "Recruteurs peuvent voir toutes les évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent créer des évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent modifier leurs évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent supprimer leurs évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Admins peuvent tout faire sur protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Authenticated users can view protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Authenticated users can insert protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Authenticated users can update protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Authenticated users can delete protocol1_evaluations" ON public.protocol1_evaluations;

        -- Activer RLS sur la table protocol1_evaluations
        ALTER TABLE public.protocol1_evaluations ENABLE ROW LEVEL SECURITY;

        -- Politiques permissives pour tous les utilisateurs authentifiés
        CREATE POLICY "Allow all authenticated users to view protocol1_evaluations" 
        ON public.protocol1_evaluations FOR SELECT 
        TO authenticated 
        USING (true);

        CREATE POLICY "Allow all authenticated users to insert protocol1_evaluations" 
        ON public.protocol1_evaluations FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        CREATE POLICY "Allow all authenticated users to update protocol1_evaluations" 
        ON public.protocol1_evaluations FOR UPDATE 
        TO authenticated 
        USING (true)
        WITH CHECK (true);

        CREATE POLICY "Allow all authenticated users to delete protocol1_evaluations" 
        ON public.protocol1_evaluations FOR DELETE 
        TO authenticated 
        USING (true);

        -- S'assurer que les index existent
        CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_application_id ON public.protocol1_evaluations(application_id);
        CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_evaluator_id ON public.protocol1_evaluations(evaluator_id);
        CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_status ON public.protocol1_evaluations(status);
        CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_completed ON public.protocol1_evaluations(completed);
        
        RAISE NOTICE 'RLS policies for protocol1_evaluations fixed successfully with permissive policies';
    ELSE
        RAISE NOTICE 'Table protocol1_evaluations does not exist, skipping migration';
    END IF;
END $$;
