-- Récupérer toutes les offres de la campagne 3
SELECT 
    jo.id,
    jo.title AS titre,
    jo.description,
    jo.location AS localisation,
    jo.contract_type AS type_contrat,
    jo.department AS departement,
    jo.salary_min AS salaire_min,
    jo.salary_max AS salaire_max,
    jo.status AS statut,
    jo.status_offerts AS type_candidature,
    jo.application_deadline AS date_limite_candidature,
    jo.campaign_id AS campagne,
    jo.created_at AS date_creation,
    jo.updated_at AS date_mise_a_jour,
    u.first_name || ' ' || u.last_name AS nom_recruteur,
    u.email AS email_recruteur,
    COUNT(DISTINCT a.id) AS nombre_candidatures
FROM 
    public.job_offers jo
    LEFT JOIN public.users u ON jo.recruiter_id::uuid = u.id
    LEFT JOIN public.applications a ON jo.id = a.job_offer_id
WHERE 
    jo.campaign_id = 3
GROUP BY 
    jo.id, 
    jo.title, 
    jo.description, 
    jo.location, 
    jo.contract_type, 
    jo.department, 
    jo.salary_min, 
    jo.salary_max, 
    jo.status, 
    jo.status_offerts, 
    jo.application_deadline, 
    jo.campaign_id, 
    jo.created_at, 
    jo.updated_at,
    u.first_name,
    u.last_name,
    u.email
ORDER BY 
    jo.created_at DESC;

