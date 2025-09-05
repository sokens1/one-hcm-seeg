-- Fix de la structure de la table protocol1_evaluations
-- Cette migration corrige les contraintes manquantes et la structure de la table

-- Supprimer la table existante et la recréer avec la bonne structure
DROP TABLE IF EXISTS public.protocol1_evaluations CASCADE;

CREATE TABLE public.protocol1_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  evaluator_id UUID,
  
  -- Évaluation documentaire
  cv_score INTEGER DEFAULT 0,
  cv_comments TEXT DEFAULT '',
  lettre_motivation_score INTEGER DEFAULT 0,
  lettre_motivation_comments TEXT DEFAULT '',
  diplomes_certificats_score INTEGER DEFAULT 0,
  diplomes_certificats_comments TEXT DEFAULT '',
  
  -- Évaluation MTP
  metier_score INTEGER DEFAULT 0,
  metier_comments TEXT DEFAULT '',
  talent_score INTEGER DEFAULT 0,
  talent_comments TEXT DEFAULT '',
  paradigme_score INTEGER DEFAULT 0,
  paradigme_comments TEXT DEFAULT '',
  
  -- Entretien
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_metier_score INTEGER DEFAULT 0,
  interview_metier_comments TEXT DEFAULT '',
  interview_talent_score INTEGER DEFAULT 0,
  interview_talent_comments TEXT DEFAULT '',
  interview_paradigme_score INTEGER DEFAULT 0,
  interview_paradigme_comments TEXT DEFAULT '',
  gap_competence_score INTEGER DEFAULT 0,
  gap_competence_comments TEXT DEFAULT '',
  general_summary TEXT DEFAULT '',
  
  -- Scores calculés
  documentary_score INTEGER DEFAULT 0,
  mtp_score INTEGER DEFAULT 0,
  interview_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  
  -- Statut
  status TEXT DEFAULT 'pending',
  completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contraintes
  UNIQUE(application_id)
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_application_id ON public.protocol1_evaluations(application_id);
CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_evaluator_id ON public.protocol1_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_status ON public.protocol1_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_completed ON public.protocol1_evaluations(completed);

-- Activer RLS
ALTER TABLE public.protocol1_evaluations ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS permissives pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view protocol1_evaluations" 
ON public.protocol1_evaluations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert protocol1_evaluations" 
ON public.protocol1_evaluations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update protocol1_evaluations" 
ON public.protocol1_evaluations FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete protocol1_evaluations" 
ON public.protocol1_evaluations FOR DELETE 
TO authenticated 
USING (true);

-- Commentaire sur la table
COMMENT ON TABLE public.protocol1_evaluations IS 'Table des évaluations Protocol 1 avec contraintes correctes et RLS activé';
