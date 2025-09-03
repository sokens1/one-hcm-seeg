-- DÉSACTIVATION COMPLÈTE DE RLS - SOLUTION D'URGENCE
-- Cette migration désactive définitivement RLS sur protocol1_evaluations

-- Vérifier si la table existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'protocol1_evaluations'
    ) THEN
        -- DÉSACTIVER RLS COMPLÈTEMENT
        ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;
        
        -- Supprimer TOUTES les politiques existantes
        DROP POLICY IF EXISTS "protocol1_evaluations_select_policy" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "protocol1_evaluations_insert_policy" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "protocol1_evaluations_update_policy" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "protocol1_evaluations_delete_policy" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Allow all authenticated users to view protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Allow all authenticated users to insert protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Allow all authenticated users to update protocol1_evaluations" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Allow all authenticated users to delete protocol1_evaluations" ON public.protocol1_evaluations;
        
        -- Accorder toutes les permissions
        GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO authenticated;
        GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO anon;
        GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO service_role;
        
        RAISE NOTICE 'RLS COMPLETELY DISABLED for protocol1_evaluations - All policies removed';
    ELSE
        RAISE NOTICE 'Table protocol1_evaluations does not exist, skipping migration';
    END IF;
END $$;
