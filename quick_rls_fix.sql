-- CORRECTION RAPIDE RLS - SCRIPT SIMPLE ET RAPIDE
-- Exécutez ce script dans l'éditeur SQL Supabase

-- Désactiver RLS
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;

-- Accorder les permissions essentielles
GRANT ALL ON public.protocol1_evaluations TO authenticated;
GRANT ALL ON public.protocol1_evaluations TO anon;
GRANT ALL ON public.protocol1_evaluations TO service_role;

-- Vérification rapide
SELECT 'RLS DÉSACTIVÉ' as status;
