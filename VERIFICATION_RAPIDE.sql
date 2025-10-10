-- Vérification rapide de l'état des questions MTP
SELECT 
  title,
  status_offerts,
  CASE 
    WHEN mtp_questions_metier IS NULL THEN 'NULL'
    WHEN array_length(mtp_questions_metier, 1) = 0 THEN 'VIDE'
    ELSE array_length(mtp_questions_metier, 1)::text || ' questions'
  END as metier_status,
  CASE 
    WHEN mtp_questions_talent IS NULL THEN 'NULL'
    WHEN array_length(mtp_questions_talent, 1) = 0 THEN 'VIDE'
    ELSE array_length(mtp_questions_talent, 1)::text || ' questions'
  END as talent_status,
  CASE 
    WHEN mtp_questions_paradigme IS NULL THEN 'NULL'
    WHEN array_length(mtp_questions_paradigme, 1) = 0 THEN 'VIDE'
    ELSE array_length(mtp_questions_paradigme, 1)::text || ' questions'
  END as paradigme_status
FROM job_offers 
ORDER BY title;
