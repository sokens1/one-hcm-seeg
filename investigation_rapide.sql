-- Investigation rapide de la candidature suspecte
-- ID Candidature: 822f209c-24ec-4bb8-aeb8-73610396a2e4
-- ID Utilisateur: 82039eb9-c1af-4876-bdfc-bf30aa98cf04

-- Requête principale pour analyser la candidature suspecte
SELECT 
    a.id as candidature_id,
    a.created_at as date_candidature,
    a.candidature_status,
    u.id as user_id,
    u.email,
    u.first_name || ' ' || u.last_name as nom_complet,
    u.candidate_status,
    u.created_at as date_inscription_utilisateur,
    j.title as titre_offre,
    j.status_offerts as statut_offre,
    j.application_deadline as date_limite_offre,
    CASE 
        WHEN a.created_at > '2025-10-22 00:00:00+01:00'::timestamp with time zone THEN 
            'ANOMALIE: Candidature externe après fermeture du 22/10/2025 00h00'
        ELSE 
            'Candidature normale'
    END as analyse_anomalie,
    EXTRACT(EPOCH FROM (a.created_at - '2025-10-22 00:00:00+01:00'::timestamp with time zone))/3600 as heures_apres_fermeture
FROM public.applications a
JOIN public.users u ON a.candidate_id = u.id
JOIN public.job_offers j ON a.job_offer_id = j.id
WHERE a.id = '822f209c-24ec-4bb8-aeb8-73610396a2e4';

-- Requête pour vérifier s'il y a d'autres candidatures externes après fermeture
SELECT 
    'Autres candidatures externes après fermeture' as type_analyse,
    COUNT(*) as nombre_candidatures,
    MIN(created_at) as premiere_candidature_apres_fermeture,
    MAX(created_at) as derniere_candidature_apres_fermeture
FROM public.applications 
WHERE candidature_status = 'externe'
AND created_at > '2025-10-22 00:00:00+01:00'::timestamp with time zone;

-- Requête pour voir toutes les candidatures externes après fermeture avec détails
SELECT 
    a.id as candidature_id,
    a.created_at as date_candidature,
    u.email,
    u.first_name || ' ' || u.last_name as nom_candidat,
    j.title as titre_offre,
    EXTRACT(EPOCH FROM (a.created_at - '2025-10-22 00:00:00+01:00'::timestamp with time zone))/3600 as heures_apres_fermeture
FROM public.applications a
JOIN public.users u ON a.candidate_id = u.id
JOIN public.job_offers j ON a.job_offer_id = j.id
WHERE a.candidature_status = 'externe'
AND a.created_at > '2025-10-22 00:00:00+01:00'::timestamp with time zone
ORDER BY a.created_at DESC;
