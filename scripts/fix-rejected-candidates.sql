-- Script SQL pour corriger les candidatures refusées qui ont été évaluées en entretien
-- Ce script met à 0 les annotations M, T, P de la partie entretien pour les candidats refusés

-- 1. D'abord, voir quelles candidatures refusées ont des évaluations d'entretien
SELECT 
    a.id as application_id,
    u.first_name,
    u.last_name,
    u.email,
    jo.title as job_title,
    a.status,
    p1e.interview_metier_score,
    p1e.interview_talent_score,
    p1e.interview_paradigme_score,
    p1e.interview_metier_comments,
    p1e.interview_talent_comments,
    p1e.interview_paradigme_comments
FROM applications a
INNER JOIN users u ON a.candidate_id = u.id
INNER JOIN job_offers jo ON a.job_offer_id = jo.id
INNER JOIN protocol1_evaluations p1e ON a.id = p1e.application_id
WHERE a.status = 'refuse'
  AND (
    p1e.interview_metier_score > 0 
    OR p1e.interview_talent_score > 0 
    OR p1e.interview_paradigme_score > 0
  )
ORDER BY a.created_at DESC;

-- 2. Mettre à 0 les scores M, T, P et vider les commentaires pour les candidats refusés
UPDATE protocol1_evaluations 
SET 
    interview_metier_score = 0,
    interview_talent_score = 0,
    interview_paradigme_score = 0,
    interview_metier_comments = '',
    interview_talent_comments = '',
    interview_paradigme_comments = '',
    updated_at = now()
WHERE application_id IN (
    SELECT a.id 
    FROM applications a
    WHERE a.status = 'refuse'
);

-- 3. Vérifier le résultat
SELECT 
    COUNT(*) as total_updated,
    'Candidatures refusées corrigées' as description
FROM protocol1_evaluations p1e
INNER JOIN applications a ON p1e.application_id = a.id
WHERE a.status = 'refuse'
  AND p1e.interview_metier_score = 0
  AND p1e.interview_talent_score = 0
  AND p1e.interview_paradigme_score = 0;
