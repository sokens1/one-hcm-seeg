-- Vérifier les 3 offres dans la campagne 1 et voir si elles existent dans la campagne 2

SELECT 
    id,
    title,
    campaign_id,
    status,
    start_date,
    date_limite,
    created_at
FROM public.job_offers
WHERE title IN (
    'Directeur des Systèmes d''Information',
    'Directeur Audit & Contrôle interne',
    'Directeur Juridique, Communication & RSE'
)
ORDER BY campaign_id, title;

