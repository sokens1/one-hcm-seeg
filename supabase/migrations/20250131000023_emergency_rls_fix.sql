-- CORRECTION D'URGENCE RLS - MIGRATION LOCALE
-- Cette migration applique la correction d'urgence pour protocol1_evaluations

-- 1. Vérifier l'état actuel de RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 2. DÉSACTIVER RLS IMMÉDIATEMENT
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer toutes les politiques connues
DROP POLICY IF EXISTS "Enable read access for all users" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_policy" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_select_policy" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_insert_policy" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_update_policy" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_delete_policy" ON public.protocol1_evaluations;

-- 4. Supprimer toutes les autres politiques restantes
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

-- 5. Accorder toutes les permissions
GRANT ALL ON public.protocol1_evaluations TO authenticated;
GRANT ALL ON public.protocol1_evaluations TO anon;
GRANT ALL ON public.protocol1_evaluations TO service_role;
GRANT ALL ON public.protocol1_evaluations TO postgres;

-- 6. Permissions sur les séquences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 7. Vérification finale
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 8. Confirmation
SELECT 'RLS DÉSACTIVÉ - Migration d''urgence appliquée' as status;
