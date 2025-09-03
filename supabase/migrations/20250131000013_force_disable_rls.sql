-- CORRECTION CRITIQUE - FORCER LA DÉSACTIVATION DE RLS
-- Cette migration force la désactivation de RLS et vérifie l'état

-- 1. Vérifier l'état actuel de RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 2. FORCER la désactivation de RLS
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer TOUTES les politiques (même celles qui pourraient être cachées)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Lister toutes les politiques existantes
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'protocol1_evaluations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.protocol1_evaluations', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- 4. Accorder TOUTES les permissions possibles
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO authenticated;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO anon;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO service_role;
GRANT ALL PRIVILEGES ON public.protocol1_evaluations TO postgres;

-- 5. Vérifier l'état final
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol1_evaluations';

-- 6. Lister les politiques restantes (devrait être vide)
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'protocol1_evaluations' 
AND schemaname = 'public';

-- 7. Confirmation finale
DO $$
BEGIN
    RAISE NOTICE 'CRITICAL FIX APPLIED: RLS disabled and all policies removed for protocol1_evaluations';
END $$;
