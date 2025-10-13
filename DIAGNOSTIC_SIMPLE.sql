-- DIAGNOSTIC SIMPLE ET SÛR

-- 1. Vérifier les questions dans job_offers
SELECT 
  title,
  mtp_questions_metier[1] as question_exemple
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL
LIMIT 3;

-- 2. Vérifier les réponses dans applications  
SELECT 
  id,
  mtp_answers->'metier'->>0 as reponse_exemple
FROM applications
WHERE mtp_answers IS NOT NULL
AND mtp_answers->'metier' IS NOT NULL
LIMIT 3;

-- 3. Chercher spécifiquement les caractères corrompus
SELECT 
  'OFFRES AVEC &' as type,
  COUNT(*) as nombre
FROM job_offers
WHERE mtp_questions_metier::text LIKE '%&%';

SELECT 
  'CANDIDATURES AVEC &' as type,
  COUNT(*) as nombre
FROM applications
WHERE mtp_answers::text LIKE '%&%';
