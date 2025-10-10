-- DIAGNOSTIC COMPLET : Identifier exactement où se trouve la corruption

-- 1. Vérifier les questions dans job_offers
SELECT 
  'QUESTIONS OFFRES' as type,
  title,
  mtp_questions_metier[1] as question_1,
  CASE 
    WHEN mtp_questions_metier[1] LIKE '%&%' THEN '⚠️ CONTIENT &'
    WHEN mtp_questions_metier[1] LIKE '%''%' THEN '⚠️ CONTIENT APOSTROPHE TYPO'
    ELSE '✅ OK'
  END as status
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL
LIMIT 5;

-- 2. Vérifier les réponses dans applications
SELECT 
  'RÉPONSES CANDIDATURES' as type,
  id,
  mtp_answers->'metier'->>0 as reponse_1,
  CASE 
    WHEN (mtp_answers->'metier'->>0) LIKE '%&%' THEN '⚠️ CONTIENT &'
    WHEN (mtp_answers->'metier'->>0) LIKE '%''%' THEN '⚠️ CONTIENT APOSTROPHE TYPO'
    ELSE '✅ OK'
  END as status
FROM applications
WHERE mtp_answers IS NOT NULL
AND mtp_answers->'metier' IS NOT NULL
LIMIT 5;

-- 3. Compter les corruptions
SELECT 
  'RÉSUMÉ CORRUPTIONS' as type,
  COUNT(*) as total_offres,
  COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM unnest(mtp_questions_metier) AS q 
    WHERE q LIKE '%&%'
  ) THEN 1 END) as offres_avec_esperluette,
  COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM unnest(mtp_questions_metier) AS q 
    WHERE q LIKE '%''%' OR q LIKE '%''%'
  ) THEN 1 END) as offres_avec_apostrophe_corrompue
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL;
