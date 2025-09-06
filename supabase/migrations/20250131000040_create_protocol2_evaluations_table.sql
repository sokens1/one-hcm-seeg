-- Création de la table protocol2_evaluations
-- Cette migration crée la table pour les évaluations du protocole 2

-- Supprimer la table existante si elle existe
DROP TABLE IF EXISTS public.protocol2_evaluations CASCADE;

CREATE TABLE public.protocol2_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  evaluator_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Visite physique
  physical_visit BOOLEAN DEFAULT false,
  physical_visit_date TIMESTAMP WITH TIME ZONE,
  physical_visit_notes TEXT DEFAULT '',
  
  -- Entretien
  interview_completed BOOLEAN DEFAULT false,
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_notes TEXT DEFAULT '',
  
  -- QCM Rôle
  qcm_role_completed BOOLEAN DEFAULT false,
  qcm_role_score INTEGER DEFAULT 0,
  qcm_role_answers JSONB DEFAULT '{}',
  qcm_role_comments TEXT DEFAULT '',
  
  -- QCM Codir
  qcm_codir_completed BOOLEAN DEFAULT false,
  qcm_codir_score INTEGER DEFAULT 0,
  qcm_codir_answers JSONB DEFAULT '{}',
  qcm_codir_comments TEXT DEFAULT '',
  
  -- Fiche de poste
  job_sheet_created BOOLEAN DEFAULT false,
  job_sheet_content TEXT DEFAULT '',
  job_sheet_skills JSONB DEFAULT '[]',
  job_sheet_requirements JSONB DEFAULT '[]',
  
  -- Évaluation des écarts de compétences
  skills_gap_assessed BOOLEAN DEFAULT false,
  skills_gap_score INTEGER DEFAULT 0,
  skills_gap_analysis TEXT DEFAULT '',
  skills_gap_recommendations TEXT DEFAULT '',
  
  -- Scores calculés
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
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_application_id ON public.protocol2_evaluations(application_id);
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_evaluator_id ON public.protocol2_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_status ON public.protocol2_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_protocol2_evaluations_completed ON public.protocol2_evaluations(completed);

-- Activer RLS
ALTER TABLE public.protocol2_evaluations ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS permissives pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view protocol2_evaluations" 
ON public.protocol2_evaluations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert protocol2_evaluations" 
ON public.protocol2_evaluations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update protocol2_evaluations" 
ON public.protocol2_evaluations FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete protocol2_evaluations" 
ON public.protocol2_evaluations FOR DELETE 
TO authenticated 
USING (true);

-- Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_protocol2_evaluations_updated_at 
BEFORE UPDATE ON public.protocol2_evaluations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaire sur la table
COMMENT ON TABLE public.protocol2_evaluations IS 'Table des évaluations Protocol 2 avec RLS activé';
