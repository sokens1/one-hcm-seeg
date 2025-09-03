-- CORRECTION FINALE - RLS pour protocol1_evaluations
-- Cette migration réactive RLS avec des politiques simples et fonctionnelles

-- Vérifier si la table existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'protocol1_evaluations'
    ) THEN
        -- Supprimer toutes les anciennes politiques (au cas où)
        DROP POLICY IF EXISTS "Allow all authenticated users to view protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Allow all authenticated users to insert protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Allow all authenticated users to update protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Allow all authenticated users to delete protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent voir toutes les évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent créer des évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent modifier leurs évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent supprimer leurs évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Admins peuvent tout faire sur protocol1_evaluations" ON public.protocol1_evaluations;

        -- Réactiver RLS
        ALTER TABLE public.protocol1_evaluations ENABLE ROW LEVEL SECURITY;

        -- Créer des politiques TRÈS SIMPLES et permissives
        CREATE POLICY "protocol1_evaluations_select_policy" 
        ON public.protocol1_evaluations FOR SELECT 
        TO authenticated 
        USING (true);

        CREATE POLICY "protocol1_evaluations_insert_policy" 
        ON public.protocol1_evaluations FOR INSERT 
        TO authenticated 
        WITH CHECK (true);

        CREATE POLICY "protocol1_evaluations_update_policy" 
        ON public.protocol1_evaluations FOR UPDATE 
        TO authenticated 
        USING (true)
        WITH CHECK (true);

        CREATE POLICY "protocol1_evaluations_delete_policy" 
        ON public.protocol1_evaluations FOR DELETE 
        TO authenticated 
        USING (true);

        -- S'assurer que les permissions sont correctes
        GRANT ALL ON public.protocol1_evaluations TO authenticated;
        GRANT ALL ON public.protocol1_evaluations TO anon;
        
        RAISE NOTICE 'RLS REACTIVATED for protocol1_evaluations with simple permissive policies';
    ELSE
        RAISE NOTICE 'Table protocol1_evaluations does not exist, skipping migration';
    END IF;
END $$;
