-- Script pour corriger protocol2_evaluations avec vérification du type d'application_id
-- Exécuter ce script dans l'interface Supabase SQL Editor

-- 1. Vérifier le type de la colonne id dans applications
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND table_schema = 'public'
AND column_name = 'id';

-- 2. Vérifier le type de la colonne id dans users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name = 'id';

-- 3. Supprimer tous les enregistrements existants pour éviter les doublons
DELETE FROM public.protocol2_evaluations;

-- 4. Supprimer la table existante
DROP TABLE IF EXISTS public.protocol2_evaluations CASCADE;

-- 5. Recréer la table avec la structure correcte
-- Utiliser TEXT pour application_id et evaluator_id pour être compatible
CREATE TABLE public.protocol2_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL,
  evaluator_id TEXT,
  
  -- Mise en situation (Simulation)
  jeu_de_role_score INTEGER DEFAULT 0,
  jeu_de_role_comments TEXT DEFAULT '',
  jeu_codir_score INTEGER DEFAULT 0,
  jeu_codir_comments TEXT DEFAULT '',
  
  -- Validation opérationnelle (Performance)
  fiche_kpis_score INTEGER DEFAULT 0,
  fiche_kpis_comments TEXT DEFAULT '',
  fiche_kris_score INTEGER DEFAULT 0,
  fiche_kris_comments TEXT DEFAULT '',
  fiche_kcis_score INTEGER DEFAULT 0,
  fiche_kcis_comments TEXT DEFAULT '',
  
  -- Analyse des compétences
  gap_competences_score INTEGER DEFAULT 0,
  gap_competences_comments TEXT DEFAULT '',
  gap_competences_level TEXT DEFAULT '',
  plan_formation_score INTEGER DEFAULT 0,
  plan_formation_comments TEXT DEFAULT '',
  
  -- Scores calculés
  mise_en_situation_score INTEGER DEFAULT 0,
  validation_operationnelle_score INTEGER DEFAULT 0,
  analyse_competences_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  
  -- Statut
  status TEXT DEFAULT 'pending',
  completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(application_id)
);

-- 6. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_application_id ON public.protocol2_evaluations(application_id);
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_evaluator_id ON public.protocol2_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_status ON public.protocol2_evaluations(status);

-- 7. Désactiver RLS pour éviter les problèmes de permissions
ALTER TABLE public.protocol2_evaluations DISABLE ROW LEVEL SECURITY;

-- 8. Donner tous les privilèges aux utilisateurs authentifiés
GRANT ALL ON public.protocol2_evaluations TO authenticated;
GRANT ALL ON public.protocol2_evaluations TO service_role;

-- 9. Vérifier la structure créée
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Tester l'insertion d'un enregistrement de test
INSERT INTO public.protocol2_evaluations (
    application_id,
    evaluator_id,
    jeu_de_role_score,
    jeu_codir_score,
    overall_score,
    status
) VALUES (
    '9966d355-e913-4411-9558-7b0341a35734',
    'test-evaluator-id',
    0,
    0,
    0,
    'pending'
);

-- 11. Vérifier l'insertion
SELECT 
    id,
    application_id,
    jeu_de_role_score,
    jeu_codir_score,
    overall_score,
    status,
    created_at
FROM public.protocol2_evaluations 
WHERE application_id = '9966d355-e913-4411-9558-7b0341a35734';

-- 12. Nettoyer l'enregistrement de test
DELETE FROM public.protocol2_evaluations 
WHERE application_id = '9966d355-e913-4411-9558-7b0341a35734';

