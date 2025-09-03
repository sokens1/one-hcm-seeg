-- Correction RLS minimale pour protocol1_evaluations
-- Version ultra-simple pour éviter les timeouts

-- Étape 1: Désactiver RLS temporairement
ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;
