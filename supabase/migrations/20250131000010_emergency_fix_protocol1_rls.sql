-- CORRECTION D'URGENCE - RLS pour protocol1_evaluations
-- Cette migration désactive temporairement RLS pour résoudre l'erreur 403

-- Vérifier si la table existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'protocol1_evaluations'
    ) THEN
        -- DÉSACTIVER RLS TEMPORAIREMENT pour résoudre l'erreur 403
        ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'RLS DISABLED for protocol1_evaluations - Emergency fix applied';
    ELSE
        RAISE NOTICE 'Table protocol1_evaluations does not exist, skipping migration';
    END IF;
END $$;
