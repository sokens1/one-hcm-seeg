-- CORRECTION IMMÉDIATE RLS - À EXÉCUTER DANS L'ÉDITEUR SQL SUPABASE
-- Copiez et collez ce script dans l'éditeur SQL de votre dashboard Supabase

-- 1. Vérifier l'état actuel
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 2. DÉSACTIVER RLS IMMÉDIATEMENT
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer toutes les politiques
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'protocol1_evaluations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.protocol1_evaluations', policy_record.policyname);
        RAISE NOTICE 'Supprimé: %', policy_record.policyname;
    END LOOP;
END $$;

-- 4. Accorder toutes les permissions
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO authenticated;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO anon;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO service_role;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO postgres;

-- 5. Permissions sur les séquences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 6. Vérification finale
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 7. Confirmation
SELECT 'RLS DÉSACTIVÉ - La table protocol1_evaluations est maintenant accessible' as status;
