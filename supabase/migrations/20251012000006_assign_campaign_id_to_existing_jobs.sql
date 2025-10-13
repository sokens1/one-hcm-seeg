-- ============================================================================
-- ASSIGNER campaign_id AUX OFFRES EXISTANTES
-- Date: 2025-10-12
-- ============================================================================

-- Mettre à jour les offres existantes avec campaign_id basé sur leur date de création
-- Périodes des campagnes :
-- - Campagne 1 : Avant le 11/09/2025
-- - Campagne 2 : Du 11/09/2025 au 21/10/2025
-- - Campagne 3 : Après le 21/10/2025

UPDATE public.job_offers
SET campaign_id = CASE
    -- Campagne 1 : Créées avant le 11/09/2025
    WHEN created_at < '2025-09-11 00:00:00+00'::timestamptz THEN 1
    
    -- Campagne 2 : Créées entre le 11/09/2025 et le 21/10/2025
    WHEN created_at >= '2025-09-11 00:00:00+00'::timestamptz 
         AND created_at <= '2025-10-21 23:59:59+00'::timestamptz THEN 2
    
    -- Campagne 3 : Créées après le 21/10/2025
    WHEN created_at > '2025-10-21 23:59:59+00'::timestamptz THEN 3
    
    -- Par défaut : Campagne actuelle (on utilise la date d'aujourd'hui)
    ELSE CASE
        WHEN CURRENT_TIMESTAMP < '2025-09-11 00:00:00+00'::timestamptz THEN 1
        WHEN CURRENT_TIMESTAMP <= '2025-10-21 23:59:59+00'::timestamptz THEN 2
        ELSE 3
    END
END
WHERE campaign_id IS NULL;

-- Vérifier la distribution des offres par campagne
SELECT 
    COALESCE(campaign_id::text, 'NULL') as campaign_id,
    COUNT(*) as nombre_offres,
    string_agg(title, ', ') as exemples_titres
FROM public.job_offers
GROUP BY campaign_id
ORDER BY campaign_id NULLS LAST;

