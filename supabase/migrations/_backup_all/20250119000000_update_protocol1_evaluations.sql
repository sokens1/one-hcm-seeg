-- Mise à jour de la table protocol1_evaluations pour supporter la nouvelle structure

-- Ajouter les nouveaux champs pour l'évaluation documentaire
ALTER TABLE public.protocol1_evaluations 
ADD COLUMN IF NOT EXISTS cv_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cv_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS lettre_motivation_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lettre_motivation_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS diplomes_certificats_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS diplomes_certificats_comments TEXT DEFAULT '';

-- Ajouter les champs pour l'évaluation MTP avec scores
ALTER TABLE public.protocol1_evaluations 
ADD COLUMN IF NOT EXISTS metier_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metier_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS talent_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS talent_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS paradigme_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paradigme_comments TEXT DEFAULT '';

-- Ajouter les champs pour l'entretien
ALTER TABLE public.protocol1_evaluations 
ADD COLUMN IF NOT EXISTS interview_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interview_metier_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS interview_metier_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS interview_talent_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS interview_talent_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS interview_paradigme_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS interview_paradigme_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS gap_competence_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gap_competence_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS general_summary TEXT DEFAULT '';

-- Ajouter les scores de section
ALTER TABLE public.protocol1_evaluations 
ADD COLUMN IF NOT EXISTS documentary_score NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS mtp_score NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS interview_score NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_score NUMERIC(5,2) DEFAULT 0;

-- Ajouter un champ pour le statut
ALTER TABLE public.protocol1_evaluations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed'));

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_application_id ON public.protocol1_evaluations(application_id);
CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_status ON public.protocol1_evaluations(status);

-- Commentaire sur la table
COMMENT ON TABLE public.protocol1_evaluations IS 'Table des évaluations du protocole 1 avec structure complète pour CV, lettre motivation, diplômes, certificats, MTP et entretien';
