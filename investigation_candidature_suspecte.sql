-- Investigation de la candidature externe soumise après fermeture
-- ID Candidature: 822f209c-24ec-4bb8-aeb8-73610396a2e4
-- ID Utilisateur: 82039eb9-c1af-4876-bdfc-bf30aa98cf04

-- 1. Informations complètes sur la candidature suspecte
SELECT 
    a.id as candidature_id,
    a.created_at as date_candidature,
    a.candidature_status,
    a.status as statut_candidature,
    a.cover_letter,
    a.motivation,
    a.availability_start,
    a.updated_at,
    u.email,
    u.first_name || ' ' || u.last_name as nom_candidat,
    u.candidate_status,
    u.created_at as date_inscription_utilisateur,
    j.title as titre_offre,
    j.status_offerts as statut_offre,
    j.application_deadline as date_limite_offre,
    CASE 
        WHEN a.created_at > '2025-10-22 00:00:00+01:00'::timestamp with time zone THEN 'ANOMALIE: Candidature externe après fermeture'
        ELSE 'Candidature normale'
    END as analyse_anomalie,
    EXTRACT(EPOCH FROM (a.created_at - '2025-10-22 00:00:00+01:00'::timestamp with time zone))/3600 as heures_apres_fermeture
FROM public.applications a
JOIN public.users u ON a.candidate_id = u.id
JOIN public.job_offers j ON a.job_offer_id = j.id
WHERE a.id = '822f209c-24ec-4bb8-aeb8-73610396a2e4';

-- 2. Autres candidatures du même candidat
SELECT 
    'Autres candidatures du candidat' as type_analyse,
    a.id as autre_candidature_id,
    a.created_at as date_autre_candidature,
    a.candidature_status,
    j.title as titre_offre,
    j.status_offerts
FROM public.applications a
JOIN public.job_offers j ON a.job_offer_id = j.id
WHERE a.candidate_id = '82039eb9-c1af-4876-bdfc-bf30aa98cf04'
AND a.id != '822f209c-24ec-4bb8-aeb8-73610396a2e4'
ORDER BY a.created_at DESC;

-- 3. Autres candidatures externes après fermeture
SELECT 
    'Autres candidatures externes après fermeture' as type_analyse,
    a.id as candidature_externe_id,
    a.created_at as date_candidature,
    u.email as email_candidat,
    u.first_name || ' ' || u.last_name as nom_candidat,
    j.title as titre_offre,
    EXTRACT(EPOCH FROM (a.created_at - '2025-10-22 00:00:00+01:00'::timestamp with time zone))/3600 as heures_apres_fermeture
FROM public.applications a
JOIN public.users u ON a.candidate_id = u.id
JOIN public.job_offers j ON a.job_offer_id = j.id
WHERE a.candidature_status = 'externe'
AND a.created_at > '2025-10-22 00:00:00+01:00'::timestamp with time zone
ORDER BY a.created_at DESC;

-- 4. Comptage des candidatures externes après fermeture
SELECT 
    'Statistiques candidatures externes après fermeture' as type_analyse,
    COUNT(*) as nombre_candidatures,
    MIN(created_at) as premiere_candidature_apres_fermeture,
    MAX(created_at) as derniere_candidature_apres_fermeture
FROM public.applications 
WHERE candidature_status = 'externe'
AND created_at > '2025-10-22 00:00:00+01:00'::timestamp with time zone;

-- 5. Profil détaillé du candidat
SELECT 
    'Profil détaillé du candidat' as type_analyse,
    cp.current_position,
    cp.current_department,
    cp.years_experience,
    cp.education,
    cp.availability,
    cp.cv_url,
    cp.created_at as date_creation_profil
FROM public.candidate_profiles cp
WHERE cp.user_id = '82039eb9-c1af-4876-bdfc-bf30aa98cf04';

-- 6. Documents associés à la candidature
SELECT 
    'Documents associés' as type_analyse,
    ad.document_type,
    ad.file_name,
    ad.file_url,
    ad.uploaded_at as date_upload
FROM public.application_documents ad
WHERE ad.application_id = '822f209c-24ec-4bb8-aeb8-73610396a2e4';
