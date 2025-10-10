-- NETTOYAGE SIMPLE ET SÛR

-- 1. Nettoyer les questions des offres (supprimer les &)
UPDATE job_offers
SET mtp_questions_metier = ARRAY(
  SELECT REPLACE(q, '&', '')
  FROM unnest(mtp_questions_metier) AS q
)
WHERE mtp_questions_metier IS NOT NULL;

UPDATE job_offers
SET mtp_questions_talent = ARRAY(
  SELECT REPLACE(q, '&', '')
  FROM unnest(mtp_questions_talent) AS q
)
WHERE mtp_questions_talent IS NOT NULL;

UPDATE job_offers
SET mtp_questions_paradigme = ARRAY(
  SELECT REPLACE(q, '&', '')
  FROM unnest(mtp_questions_paradigme) AS q
)
WHERE mtp_questions_paradigme IS NOT NULL;

-- 2. Nettoyer les réponses des candidatures (supprimer les &)
UPDATE applications
SET mtp_answers = jsonb_build_object(
  'metier', (
    SELECT jsonb_agg(REPLACE(value::text, '&', '')::jsonb)
    FROM jsonb_array_elements(mtp_answers->'metier') AS value
  ),
  'talent', (
    SELECT jsonb_agg(REPLACE(value::text, '&', '')::jsonb)
    FROM jsonb_array_elements(mtp_answers->'talent') AS value
  ),
  'paradigme', (
    SELECT jsonb_agg(REPLACE(value::text, '&', '')::jsonb)
    FROM jsonb_array_elements(mtp_answers->'paradigme') AS value
  )
)
WHERE mtp_answers IS NOT NULL;

-- 3. Vérification
SELECT '✅ NETTOYAGE TERMINÉ' as status;
