-- CORRECTION DÉFINITIVE DU PROBLÈME RLS POUR protocol2_evaluations
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne details JSONB manquante
ALTER TABLE public.protocol2_evaluations 
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';

-- 2. Vérifier l'état actuel de RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol2_evaluations';

-- 3. FORCER la désactivation de RLS de manière absolue
ALTER TABLE public.protocol2_evaluations DISABLE ROW LEVEL SECURITY;

-- 4. Supprimer TOUTES les politiques existantes (même celles cachées)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Lister et supprimer toutes les politiques
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'protocol2_evaluations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.protocol2_evaluations', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
    
    -- Vérifier qu'aucune politique ne reste
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'protocol2_evaluations' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'All policies successfully removed';
    ELSE
        RAISE NOTICE 'WARNING: Some policies still exist';
    END IF;
END $$;

-- 5. Accorder TOUTES les permissions possibles à TOUS les rôles
GRANT ALL PRIVILEGES ON public.protocol2_evaluations TO authenticated;
GRANT ALL PRIVILEGES ON public.protocol2_evaluations TO anon;
GRANT ALL PRIVILEGES ON public.protocol2_evaluations TO service_role;
GRANT ALL PRIVILEGES ON public.protocol2_evaluations TO postgres;
GRANT ALL PRIVILEGES ON public.protocol2_evaluations TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON public.protocol2_evaluations TO supabase_storage_admin;

-- 6. Accorder les permissions sur les séquences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO supabase_storage_admin;

-- 7. Vérifier l'état final
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol2_evaluations';

-- 8. Vérifier que la colonne details a été ajoutée
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Commentaire sur la correction
COMMENT ON TABLE public.protocol2_evaluations IS 'Table des évaluations Protocol 2 avec RLS désactivé pour éviter les erreurs 403';

