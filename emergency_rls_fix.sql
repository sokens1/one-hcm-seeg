-- CORRECTION D'URGENCE RLS - SCRIPT ULTRA-SIMPLE
-- Copiez et exécutez ce script dans l'éditeur SQL Supabase

-- ÉTAPE 1: Désactiver RLS
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Supprimer toutes les politiques
DROP POLICY IF EXISTS "Enable read access for all users" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_policy" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_select_policy" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_insert_policy" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_update_policy" ON public.protocol1_evaluations;
DROP POLICY IF EXISTS "protocol1_evaluations_delete_policy" ON public.protocol1_evaluations;

-- ÉTAPE 3: Accorder toutes les permissions
GRANT ALL ON public.protocol1_evaluations TO authenticated;
GRANT ALL ON public.protocol1_evaluations TO anon;
GRANT ALL ON public.protocol1_evaluations TO service_role;
GRANT ALL ON public.protocol1_evaluations TO postgres;

-- ÉTAPE 4: Permissions sur les séquences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ÉTAPE 5: Vérification
SELECT 'RLS DÉSACTIVÉ - Testez maintenant votre application' as status;
