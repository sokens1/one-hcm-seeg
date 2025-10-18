-- Liste des utilisateurs inscrits pendant la campagne 1 mais qui n'ont PAS candidaté à cette campagne
-- Campagne 1 : Avant le 11/09/2025

-- LISTE DÉTAILLÉE : Inscrits pendant campagne 1 SANS candidature à la campagne 1
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status,
    u.statut AS statut_compte,
    u.phone,
    u.created_at AS date_inscription,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM applications a 
            WHERE a.candidate_id = u.id
        ) THEN 'A candidaté à d''autres campagnes'
        ELSE 'N''a jamais candidaté'
    END AS statut_candidature
FROM 
    users u
WHERE 
    -- Inscrits pendant la campagne 1 (avant le 11/09/2025)
    u.created_at < '2025-09-11T00:00:00'
    -- Rôle candidat
    AND u.role IN ('candidat', 'candidate')
    -- N'ont PAS candidaté à la campagne 1
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a
        INNER JOIN job_offers jo ON a.job_offer_id = jo.id
        WHERE a.candidate_id = u.id
        AND jo.campaign_id = 1
    )
ORDER BY 
    u.created_at DESC;

-- STATISTIQUES : Répartition
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM applications a 
            WHERE a.candidate_id = u.id
        ) THEN 'A candidaté à d''autres campagnes'
        ELSE 'N''a jamais candidaté'
    END AS statut_candidature,
    u.candidate_status,
    COUNT(*) AS nombre
FROM 
    users u
WHERE 
    u.created_at < '2025-09-11T00:00:00'
    AND u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a
        INNER JOIN job_offers jo ON a.job_offer_id = jo.id
        WHERE a.candidate_id = u.id
        AND jo.campaign_id = 1
    )
GROUP BY 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM applications a 
            WHERE a.candidate_id = u.id
        ) THEN 'A candidaté à d''autres campagnes'
        ELSE 'N''a jamais candidaté'
    END,
    u.candidate_status;

-- STATISTIQUES : Par email SEEG
SELECT 
    CASE 
        WHEN u.email LIKE '%@seeg-gabon.com' THEN 'Email SEEG'
        ELSE 'Email externe'
    END AS type_email,
    CASE 
        WHEN u.matricule IS NOT NULL AND u.matricule != '' THEN 'Avec matricule'
        ELSE 'Sans matricule'
    END AS presence_matricule,
    COUNT(*) AS nombre
FROM 
    users u
WHERE 
    u.created_at < '2025-09-11T00:00:00'
    AND u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a
        INNER JOIN job_offers jo ON a.job_offer_id = jo.id
        WHERE a.candidate_id = u.id
        AND jo.campaign_id = 1
    )
GROUP BY 
    CASE 
        WHEN u.email LIKE '%@seeg-gabon.com' THEN 'Email SEEG'
        ELSE 'Email externe'
    END,
    CASE 
        WHEN u.matricule IS NOT NULL AND u.matricule != '' THEN 'Avec matricule'
        ELSE 'Sans matricule'
    END;

-- COMPTER le total
SELECT 
    COUNT(*) AS total_inscrits_campagne_1_sans_candidature
FROM 
    users u
WHERE 
    u.created_at < '2025-09-11T00:00:00'
    AND u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a
        INNER JOIN job_offers jo ON a.job_offer_id = jo.id
        WHERE a.candidate_id = u.id
        AND jo.campaign_id = 1
    );

