-- Script SQL simplifié pour créer la table candidate_ai_evaluations
-- Exécutez ce script en premier, puis le script pour le trigger si nécessaire

-- Créer la table
CREATE TABLE IF NOT EXISTS candidate_ai_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  evaluation_data JSONB NOT NULL,
  threshold_pct INTEGER,
  hold_threshold_pct INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique : un seul résultat par candidat/post
  CONSTRAINT unique_candidate_job UNIQUE (candidate_id, job_id)
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_candidate_ai_evaluations_candidate_id ON candidate_ai_evaluations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_ai_evaluations_job_id ON candidate_ai_evaluations(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_ai_evaluations_created_at ON candidate_ai_evaluations(created_at DESC);

