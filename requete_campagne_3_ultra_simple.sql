-- Version ultra simple - Toutes les offres de la campagne 3
SELECT 
    id,
    title,
    department,
    location,
    contract_type,
    status,
    status_offerts,
    campaign_id,
    created_at,
    recruiter_id
FROM 
    public.job_offers
WHERE 
    campaign_id = 3
ORDER BY 
    created_at DESC;

