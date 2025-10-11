-- Script pour gérer les campagnes multiples
-- Campagne 1 : masquée pour candidats et public
-- Campagne 2 : active et visible
-- Les recruteurs voient toutes les campagnes

-- 1. Ajouter une colonne campaign_id aux tables job_offers et applications
-- Vérifier d'abord si la colonne existe
DO $$ 
BEGIN
    -- Ajouter campaign_id à job_offers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_offers' AND column_name = 'campaign_id'
    ) THEN
        ALTER TABLE job_offers 
        ADD COLUMN campaign_id INTEGER DEFAULT 2;
        
        COMMENT ON COLUMN job_offers.campaign_id IS 'Identifiant de la campagne (1, 2, 3, etc.)';
    END IF;
    
    -- Ajouter campaign_id à applications
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' AND column_name = 'campaign_id'
    ) THEN
        ALTER TABLE applications 
        ADD COLUMN campaign_id INTEGER;
        
        COMMENT ON COLUMN applications.campaign_id IS 'Identifiant de la campagne (hérité de job_offers)';
    END IF;
END $$;

-- 2. Identifier et marquer toutes les offres de la Campagne 1
-- Offres créées avant une certaine date = Campagne 1
-- Exemple : Offres créées avant le 2025-01-01 = Campagne 1
UPDATE job_offers
SET campaign_id = 1
WHERE created_at < '2025-01-01 00:00:00+00'::timestamptz
   OR title IN (
      'Directeur Audit & Contrôle interne',
      'Directeur des Systèmes d''Information', 
      'Directeur Juridique, Communication & RSE'
   );

-- 3. Marquer toutes les nouvelles offres comme Campagne 2
UPDATE job_offers
SET campaign_id = 2
WHERE campaign_id IS NULL OR campaign_id != 1;

-- 4. Propager le campaign_id aux candidatures
UPDATE applications a
SET campaign_id = jo.campaign_id
FROM job_offers jo
WHERE a.job_offer_id = jo.id
  AND a.campaign_id IS NULL;

-- 5. Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_job_offers_campaign_id ON job_offers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON applications(campaign_id);

-- 6. Vérifier la répartition des campagnes
SELECT 
  campaign_id,
  COUNT(*) as nombre_offres,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as offres_actives
FROM job_offers
GROUP BY campaign_id
ORDER BY campaign_id;

SELECT 
  campaign_id,
  COUNT(*) as nombre_candidatures
FROM applications
GROUP BY campaign_id
ORDER BY campaign_id;

-- 7. Lister les offres de la Campagne 1 (qui seront masquées)
SELECT 
  id,
  title,
  campaign_id,
  status,
  created_at
FROM job_offers
WHERE campaign_id = 1
ORDER BY created_at DESC;

-- 8. Lister les offres de la Campagne 2 (qui seront visibles)
SELECT 
  id,
  title,
  campaign_id,
  status,
  created_at
FROM job_offers
WHERE campaign_id = 2
ORDER BY created_at DESC;

