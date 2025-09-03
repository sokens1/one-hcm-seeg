-- Migration pour corriger les problèmes d'annotations du protocole 1
-- Cette migration s'assure que toutes les données sont correctement mappées

-- Vérifier et corriger les données existantes
-- Si des enregistrements utilisent l'ancienne structure avec des booléens,
-- les convertir vers la nouvelle structure avec des scores numériques

-- Mettre à jour les scores documentaires si ils sont NULL ou 0
UPDATE public.protocol1_evaluations 
SET 
  cv_score = CASE 
    WHEN cv_score IS NULL OR cv_score = 0 THEN 0 
    ELSE cv_score 
  END,
  lettre_motivation_score = CASE 
    WHEN lettre_motivation_score IS NULL OR lettre_motivation_score = 0 THEN 0 
    ELSE lettre_motivation_score 
  END,
  diplomes_certificats_score = CASE 
    WHEN diplomes_certificats_score IS NULL OR diplomes_certificats_score = 0 THEN 0 
    ELSE diplomes_certificats_score 
  END
WHERE cv_score IS NULL OR lettre_motivation_score IS NULL OR diplomes_certificats_score IS NULL;

-- Mettre à jour les scores MTP si ils sont NULL ou 0
UPDATE public.protocol1_evaluations 
SET 
  metier_score = CASE 
    WHEN metier_score IS NULL OR metier_score = 0 THEN 0 
    ELSE metier_score 
  END,
  talent_score = CASE 
    WHEN talent_score IS NULL OR talent_score = 0 THEN 0 
    ELSE talent_score 
  END,
  paradigme_score = CASE 
    WHEN paradigme_score IS NULL OR paradigme_score = 0 THEN 0 
    ELSE paradigme_score 
  END
WHERE metier_score IS NULL OR talent_score IS NULL OR paradigme_score IS NULL;

-- Mettre à jour les scores d'entretien si ils sont NULL ou 0
UPDATE public.protocol1_evaluations 
SET 
  interview_metier_score = CASE 
    WHEN interview_metier_score IS NULL OR interview_metier_score = 0 THEN 0 
    ELSE interview_metier_score 
  END,
  interview_talent_score = CASE 
    WHEN interview_talent_score IS NULL OR interview_talent_score = 0 THEN 0 
    ELSE interview_talent_score 
  END,
  interview_paradigme_score = CASE 
    WHEN interview_paradigme_score IS NULL OR interview_paradigme_score = 0 THEN 0 
    ELSE interview_paradigme_score 
  END,
  gap_competence_score = CASE 
    WHEN gap_competence_score IS NULL OR gap_competence_score = 0 THEN 0 
    ELSE gap_competence_score 
  END
WHERE interview_metier_score IS NULL OR interview_talent_score IS NULL 
   OR interview_paradigme_score IS NULL OR gap_competence_score IS NULL;

-- S'assurer que les commentaires ne sont pas NULL
UPDATE public.protocol1_evaluations 
SET 
  cv_comments = COALESCE(cv_comments, ''),
  lettre_motivation_comments = COALESCE(lettre_motivation_comments, ''),
  diplomes_certificats_comments = COALESCE(diplomes_certificats_comments, ''),
  metier_comments = COALESCE(metier_comments, ''),
  talent_comments = COALESCE(talent_comments, ''),
  paradigme_comments = COALESCE(paradigme_comments, ''),
  interview_metier_comments = COALESCE(interview_metier_comments, ''),
  interview_talent_comments = COALESCE(interview_talent_comments, ''),
  interview_paradigme_comments = COALESCE(interview_paradigme_comments, ''),
  gap_competence_comments = COALESCE(gap_competence_comments, ''),
  general_summary = COALESCE(general_summary, '')
WHERE cv_comments IS NULL OR lettre_motivation_comments IS NULL 
   OR diplomes_certificats_comments IS NULL OR metier_comments IS NULL 
   OR talent_comments IS NULL OR paradigme_comments IS NULL 
   OR interview_metier_comments IS NULL OR interview_talent_comments IS NULL 
   OR interview_paradigme_comments IS NULL OR gap_competence_comments IS NULL 
   OR general_summary IS NULL;

-- Recalculer les scores globaux pour tous les enregistrements
UPDATE public.protocol1_evaluations 
SET 
  -- Score documentaire (moyenne des 3 évaluations documentaires convertie en %)
  documentary_score = (
    (COALESCE(cv_score, 0) + COALESCE(lettre_motivation_score, 0) + COALESCE(diplomes_certificats_score, 0)) / 3.0 * 20
  ),
  
  -- Score MTP (moyenne des 3 évaluations MTP convertie en %)
  mtp_score = (
    (COALESCE(metier_score, 0) + COALESCE(talent_score, 0) + COALESCE(paradigme_score, 0)) / 3.0 * 20
  ),
  
  -- Score entretien (moyenne des évaluations d'entretien convertie en %)
  interview_score = (
    (COALESCE(interview_metier_score, 0) + COALESCE(interview_talent_score, 0) + COALESCE(interview_paradigme_score, 0) + COALESCE(gap_competence_score, 0)) / 4.0 * 60
  ),
  
  -- Score total (moyenne pondérée)
  total_score = (
    (COALESCE(cv_score, 0) + COALESCE(lettre_motivation_score, 0) + COALESCE(diplomes_certificats_score, 0)) / 3.0 * 0.1 +
    (COALESCE(metier_score, 0) + COALESCE(talent_score, 0) + COALESCE(paradigme_score, 0)) / 3.0 * 0.2 +
    (COALESCE(interview_metier_score, 0) + COALESCE(interview_talent_score, 0) + COALESCE(interview_paradigme_score, 0) + COALESCE(gap_competence_score, 0)) / 4.0 * 0.7
  ) * 100,
  
  -- Score global arrondi
  overall_score = ROUND(
    (
      (COALESCE(cv_score, 0) + COALESCE(lettre_motivation_score, 0) + COALESCE(diplomes_certificats_score, 0)) / 3.0 * 0.1 +
      (COALESCE(metier_score, 0) + COALESCE(talent_score, 0) + COALESCE(paradigme_score, 0)) / 3.0 * 0.2 +
      (COALESCE(interview_metier_score, 0) + COALESCE(interview_talent_score, 0) + COALESCE(interview_paradigme_score, 0) + COALESCE(gap_competence_score, 0)) / 4.0 * 0.7
    ) * 100
  ),
  
  -- Mettre à jour le statut
  status = CASE 
    WHEN overall_score >= 60 THEN 'completed'
    WHEN (cv_score > 0 OR metier_score > 0 OR interview_metier_score > 0) THEN 'in_progress'
    ELSE 'pending'
  END,
  
  -- Mettre à jour le flag completed
  completed = (overall_score >= 60),
  
  -- Mettre à jour la date de modification
  updated_at = NOW()
WHERE TRUE;

-- Ajouter des contraintes pour s'assurer de l'intégrité des données
DO $$ 
BEGIN
    -- Vérifier et ajouter les contraintes si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_cv_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_cv_score_range CHECK (cv_score >= 0 AND cv_score <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_lettre_motivation_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_lettre_motivation_score_range CHECK (lettre_motivation_score >= 0 AND lettre_motivation_score <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_diplomes_certificats_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_diplomes_certificats_score_range CHECK (diplomes_certificats_score >= 0 AND diplomes_certificats_score <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_metier_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_metier_score_range CHECK (metier_score >= 0 AND metier_score <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_talent_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_talent_score_range CHECK (talent_score >= 0 AND talent_score <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_paradigme_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_paradigme_score_range CHECK (paradigme_score >= 0 AND paradigme_score <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_interview_metier_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_interview_metier_score_range CHECK (interview_metier_score >= 0 AND interview_metier_score <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_interview_talent_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_interview_talent_score_range CHECK (interview_talent_score >= 0 AND interview_talent_score <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_interview_paradigme_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_interview_paradigme_score_range CHECK (interview_paradigme_score >= 0 AND interview_paradigme_score <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_gap_competence_score_range') THEN
        ALTER TABLE public.protocol1_evaluations ADD CONSTRAINT check_gap_competence_score_range CHECK (gap_competence_score >= 0 AND gap_competence_score <= 5);
    END IF;
END $$;

-- Commentaire sur la migration
COMMENT ON TABLE public.protocol1_evaluations IS 'Table des évaluations du protocole 1 - Migration de correction des annotations appliquée le 28/01/2025';
