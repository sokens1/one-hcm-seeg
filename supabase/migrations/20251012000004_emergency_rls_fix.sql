-- ============================================================================
-- MIGRATION D'URGENCE - FORCER LA CORRECTION RLS
-- Cette migration supprime TOUT et recrée proprement
-- ============================================================================

-- Désactiver complètement RLS sur users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes (au cas où il en reste)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

-- Créer UNE SEULE politique simple pour SELECT (pas de récursion)
CREATE POLICY "users_select_simple" ON public.users
    FOR SELECT 
    USING (
        -- Tout utilisateur authentifié peut voir tous les users
        -- Pas de sous-requête sur users = pas de récursion
        auth.uid() IS NOT NULL
    );

-- Créer UNE SEULE politique pour UPDATE
CREATE POLICY "users_update_simple" ON public.users
    FOR UPDATE 
    USING (id::text = auth.uid()::text)
    WITH CHECK (id::text = auth.uid()::text);

-- Créer UNE SEULE politique pour INSERT
CREATE POLICY "users_insert_simple" ON public.users
    FOR INSERT 
    WITH CHECK (id::text = auth.uid()::text);

-- Réactiver RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Vérifier qu'il n'y a qu'une politique par action
SELECT 
    'users' as table_name,
    cmd as action,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
GROUP BY cmd
ORDER BY cmd;

