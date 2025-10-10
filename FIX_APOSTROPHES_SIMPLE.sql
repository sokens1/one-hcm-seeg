-- Script simple pour remplacer les apostrophes corrompues
-- Exécuter ce script dans Supabase SQL Editor

-- Nettoyer les questions Métier
UPDATE job_offers
SET mtp_questions_metier = ARRAY(
  SELECT REPLACE(REPLACE(REPLACE(q, '''', ''''), ''', ''''), '`', '''')
  FROM unnest(mtp_questions_metier) AS q
)
WHERE mtp_questions_metier IS NOT NULL;

-- Nettoyer les questions Talent
UPDATE job_offers
SET mtp_questions_talent = ARRAY(
  SELECT REPLACE(REPLACE(REPLACE(q, '''', ''''), ''', ''''), '`', '''')
  FROM unnest(mtp_questions_talent) AS q
)
WHERE mtp_questions_talent IS NOT NULL;

-- Nettoyer les questions Paradigme
UPDATE job_offers
SET mtp_questions_paradigme = ARRAY(
  SELECT REPLACE(REPLACE(REPLACE(q, '''', ''''), ''', ''''), '`', '''')
  FROM unnest(mtp_questions_paradigme) AS q
)
WHERE mtp_questions_paradigme IS NOT NULL;

-- Afficher un exemple pour vérifier
SELECT 
  title,
  mtp_questions_metier[1] as question_exemple
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL
LIMIT 1;
