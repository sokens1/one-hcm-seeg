-- Vérifier si les questions MTP dans la base de données contiennent des caractères corrompus
SELECT 
  title,
  'MÉTIER' as type_question,
  mtp_questions_metier[1] as question_1,
  CASE 
    WHEN mtp_questions_metier[1] LIKE '%&%' THEN '⚠️ CONTIENT &'
    WHEN mtp_questions_metier[1] LIKE '%''%' THEN '⚠️ CONTIENT APOSTROPHE CORROMPUE'
    ELSE '✅ OK'
  END as status_encodage
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL
LIMIT 5;

-- Vérifier toutes les questions métier pour trouver les corruptions
SELECT 
  title,
  unnest(mtp_questions_metier) as question,
  CASE 
    WHEN unnest(mtp_questions_metier) LIKE '%&amp;%' THEN '⚠️ CONTIENT &amp;'
    WHEN unnest(mtp_questions_metier) LIKE '%&%' THEN '⚠️ CONTIENT &'
    WHEN unnest(mtp_questions_metier) LIKE '%'%' THEN '⚠️ CONTIENT APOSTROPHE TYPOGRAPHIQUE'
    ELSE '✅ OK'
  END as status_encodage
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL
AND (
  unnest(mtp_questions_metier) LIKE '%&%' OR 
  unnest(mtp_questions_metier) LIKE '%'%'
);

-- Nettoyer les apostrophes dans les questions MTP (si nécessaire)
UPDATE job_offers
SET 
  mtp_questions_metier = (
    SELECT ARRAY_AGG(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(elem, '&amp;', ''''),
              '&', ''''),
            ''', ''''),
          ''', ''''),
        '`', '''')
    )
    FROM unnest(mtp_questions_metier) AS elem
  ),
  mtp_questions_talent = (
    SELECT ARRAY_AGG(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(elem, '&amp;', ''''),
              '&', ''''),
            ''', ''''),
          ''', ''''),
        '`', '''')
    )
    FROM unnest(mtp_questions_talent) AS elem
  ),
  mtp_questions_paradigme = (
    SELECT ARRAY_AGG(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(elem, '&amp;', ''''),
              '&', ''''),
            ''', ''''),
          ''', ''''),
        '`', '''')
    )
    FROM unnest(mtp_questions_paradigme) AS elem
  )
WHERE mtp_questions_metier IS NOT NULL
   OR mtp_questions_talent IS NOT NULL
   OR mtp_questions_paradigme IS NOT NULL;

-- Vérification après nettoyage
SELECT 
  'VÉRIFICATION FINALE' as etape,
  COUNT(*) as total_offres,
  COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM unnest(mtp_questions_metier) AS q WHERE q LIKE '%&%'
  ) THEN 1 END) as offres_avec_esperluette,
  COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM unnest(mtp_questions_metier) AS q WHERE q LIKE '%'%'
  ) THEN 1 END) as offres_avec_apostrophe_typographique
FROM job_offers
WHERE mtp_questions_metier IS NOT NULL;
