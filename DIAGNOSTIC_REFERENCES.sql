-- Diagnostic des références manquantes
-- Ce script va nous aider à comprendre pourquoi les références sont null

-- 1. Vérifier le statut des offres pour ces candidatures
SELECT 
  a.id as application_id,
  a.created_at as application_date,
  jo.title as job_title,
  jo.status_offerts as offer_status,
  a.reference_full_name,
  a.reference_email,
  a.reference_contact,
  a.reference_company,
  a.candidature_status,
  CASE 
    WHEN jo.status_offerts = 'interne' THEN 'Offre interne - Références non obligatoires'
    WHEN jo.status_offerts = 'externe' THEN 'Offre externe - Références OBLIGATOIRES'
    ELSE 'Statut indéterminé'
  END as reference_requirement
FROM applications a
JOIN job_offers jo ON a.job_offer_id = jo.id
WHERE a.id IN (
  'e8ef5f42-d6c3-438f-84b8-e04e00d4847e',
  '15b9aa2e-6b04-4084-ad04-81da7a52157d',
  '976d4713-50fe-4ac8-a02f-9e6c0ca16e22',
  'b95c15a3-643c-452f-b231-ac0b292d4c64',
  'f1f3203c-d1fa-4922-b2da-3dd5e8892d03'
)
ORDER BY a.created_at DESC;

-- 2. Vérifier toutes les candidatures avec références manquantes
SELECT 
  COUNT(*) as total_applications,
  COUNT(CASE WHEN jo.status_offerts = 'interne' THEN 1 END) as internal_offers,
  COUNT(CASE WHEN jo.status_offerts = 'externe' THEN 1 END) as external_offers,
  COUNT(CASE WHEN jo.status_offerts = 'externe' AND a.reference_full_name IS NULL THEN 1 END) as external_without_references
FROM applications a
JOIN job_offers jo ON a.job_offer_id = jo.id
WHERE a.created_at >= NOW() - INTERVAL '30 days';

-- 3. Vérifier les candidatures externes sans références (PROBLÈME)
SELECT 
  a.id,
  jo.title,
  a.created_at,
  a.reference_full_name,
  a.reference_email,
  a.reference_contact,
  a.reference_company
FROM applications a
JOIN job_offers jo ON a.job_offer_id = jo.id
WHERE jo.status_offerts = 'externe' 
AND (a.reference_full_name IS NULL OR a.reference_full_name = '')
ORDER BY a.created_at DESC
LIMIT 10;
