-- Script pour vérifier quelles offres ont des questions MTP vides
-- À exécuter AVANT le script de récupération

SELECT 
  'OFFRES AVEC QUESTIONS VIDES' as type_verification,
  title,
  status_offerts,
  CASE 
    WHEN mtp_questions_metier IS NULL THEN 'NULL'
    WHEN array_length(mtp_questions_metier, 1) = 0 THEN 'VIDE'
    ELSE array_length(mtp_questions_metier, 1)::text || ' questions'
  END as metier_count,
  CASE 
    WHEN mtp_questions_talent IS NULL THEN 'NULL'
    WHEN array_length(mtp_questions_talent, 1) = 0 THEN 'VIDE'
    ELSE array_length(mtp_questions_talent, 1)::text || ' questions'
  END as talent_count,
  CASE 
    WHEN mtp_questions_paradigme IS NULL THEN 'NULL'
    WHEN array_length(mtp_questions_paradigme, 1) = 0 THEN 'VIDE'
    ELSE array_length(mtp_questions_paradigme, 1)::text || ' questions'
  END as paradigme_count,
  created_at
FROM job_offers 
WHERE 
  (mtp_questions_metier IS NULL OR array_length(mtp_questions_metier, 1) = 0) OR
  (mtp_questions_talent IS NULL OR array_length(mtp_questions_talent, 1) = 0) OR
  (mtp_questions_paradigme IS NULL OR array_length(mtp_questions_paradigme, 1) = 0)
ORDER BY title;

-- Compter le nombre d'offres avec questions vides
SELECT 
  'RÉSUMÉ' as type_verification,
  COUNT(*) as total_offres_avec_questions_vides,
  COUNT(CASE WHEN status_offerts = 'interne' THEN 1 END) as offres_internes_vides,
  COUNT(CASE WHEN status_offerts = 'externe' THEN 1 END) as offres_externes_vides
FROM job_offers 
WHERE 
  (mtp_questions_metier IS NULL OR array_length(mtp_questions_metier, 1) = 0) OR
  (mtp_questions_talent IS NULL OR array_length(mtp_questions_talent, 1) = 0) OR
  (mtp_questions_paradigme IS NULL OR array_length(mtp_questions_paradigme, 1) = 0);

-- Lister les titres exacts des offres pour vérification
SELECT 
  'TITRES EXACTS' as type_verification,
  title as titre_exact
FROM job_offers 
WHERE 
  (mtp_questions_metier IS NULL OR array_length(mtp_questions_metier, 1) = 0) OR
  (mtp_questions_talent IS NULL OR array_length(mtp_questions_talent, 1) = 0) OR
  (mtp_questions_paradigme IS NULL OR array_length(mtp_questions_paradigme, 1) = 0)
ORDER BY title;
