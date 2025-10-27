-- Requête SQL pour restaurer la candidature supprimée
-- Candidat ID: 59f4652d-1ec7-4cc6-a59a-4b7ee2e1a49a
-- Offre d'emploi ID: 9eac4ba9-920f-43ff-82b0-00701f06f232

-- 1. Vérifier que le candidat et l'offre existent
SELECT 
    'Candidat' as type,
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role
FROM public.users u
WHERE u.id = '59f4652d-1ec7-4cc6-a59a-4b7ee2e1a49a'

UNION ALL

SELECT 
    'Offre d''emploi' as type,
    jo.id,
    jo.title as email,
    jo.location as first_name,
    jo.contract_type as last_name,
    jo.status as role
FROM public.job_offers jo
WHERE jo.id = '9eac4ba9-920f-43ff-82b0-00701f06f232';

-- 2. Restaurer la candidature
INSERT INTO public.applications (
    candidate_id,
    job_offer_id,
    status,
    cover_letter,
    motivation,
    availability_start,
    candidature_status,
    created_at,
    updated_at
) VALUES (
    '59f4652d-1ec7-4cc6-a59a-4b7ee2e1a49a',
    '9eac4ba9-920f-43ff-82b0-00701f06f232',
    'candidature',
    'Candidature restaurée',
    'Motivation du candidat',
    CURRENT_DATE + INTERVAL '30 days',
    'externe', -- ou 'interne' selon le type de candidat
    now(),
    now()
)
ON CONFLICT (candidate_id, job_offer_id) 
DO UPDATE SET
    status = EXCLUDED.status,
    cover_letter = EXCLUDED.cover_letter,
    motivation = EXCLUDED.motivation,
    availability_start = EXCLUDED.availability_start,
    candidature_status = EXCLUDED.candidature_status,
    updated_at = now();

-- 3. Vérifier que la candidature a été restaurée
SELECT 
    a.id as application_id,
    a.candidate_id,
    a.job_offer_id,
    a.status,
    a.created_at,
    u.first_name,
    u.last_name,
    u.email,
    jo.title as job_title,
    jo.location
FROM public.applications a
JOIN public.users u ON a.candidate_id = u.id
JOIN public.job_offers jo ON a.job_offer_id = jo.id
WHERE a.candidate_id = '59f4652d-1ec7-4cc6-a59a-4b7ee2e1a49a'
AND a.job_offer_id = '9eac4ba9-920f-43ff-82b0-00701f06f232';
