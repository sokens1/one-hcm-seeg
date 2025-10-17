-- Analyse détaillée des emails et matricules des 121 candidats de la campagne 1

-- 1. LISTE COMPLÈTE avec analyse email et matricule
SELECT 
    u.id,
    u.email,
    CASE 
        WHEN u.email LIKE '%@seeg-gabon.com' THEN '✓ Email SEEG'
        ELSE '✗ Email externe'
    END AS type_email,
    u.matricule,
    CASE 
        WHEN u.matricule IS NOT NULL AND u.matricule != '' THEN '✓ Matricule présent'
        ELSE '✗ Pas de matricule'
    END AS presence_matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS statut_declare,
    CASE 
        WHEN u.candidate_status = 'externe' AND u.email LIKE '%@seeg-gabon.com' THEN '⚠️ INCOHÉRENCE: Externe avec email SEEG'
        WHEN u.candidate_status = 'externe' AND (u.matricule IS NOT NULL AND u.matricule != '') THEN '⚠️ INCOHÉRENCE: Externe avec matricule'
        WHEN u.candidate_status = 'interne' AND u.email NOT LIKE '%@seeg-gabon.com' THEN '⚠️ INCOHÉRENCE: Interne sans email SEEG'
        ELSE '✓ Cohérent'
    END AS analyse_coherence,
    u.statut AS statut_compte
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
GROUP BY 
    u.id, u.email, u.matricule, u.first_name, u.last_name, 
    u.candidate_status, u.statut
ORDER BY 
    u.email;

-- 2. STATISTIQUES par type d'email
SELECT 
    CASE 
        WHEN u.email LIKE '%@seeg-gabon.com' THEN 'Email SEEG'
        ELSE 'Email externe'
    END AS type_email,
    COUNT(DISTINCT u.id) AS nombre_candidats
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
GROUP BY 
    CASE 
        WHEN u.email LIKE '%@seeg-gabon.com' THEN 'Email SEEG'
        ELSE 'Email externe'
    END;

-- 3. STATISTIQUES par présence de matricule
SELECT 
    CASE 
        WHEN u.matricule IS NOT NULL AND u.matricule != '' THEN 'Avec matricule'
        ELSE 'Sans matricule'
    END AS presence_matricule,
    COUNT(DISTINCT u.id) AS nombre_candidats
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
GROUP BY 
    CASE 
        WHEN u.matricule IS NOT NULL AND u.matricule != '' THEN 'Avec matricule'
        ELSE 'Sans matricule'
    END;

-- 4. INCOHÉRENCES : Candidats EXTERNES avec email SEEG
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS statut_declare,
    u.statut AS statut_compte
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
    AND u.candidate_status = 'externe'
    AND u.email LIKE '%@seeg-gabon.com'
GROUP BY 
    u.id, u.email, u.matricule, u.first_name, u.last_name, 
    u.candidate_status, u.statut
ORDER BY 
    u.email;

-- 5. INCOHÉRENCES : Candidats EXTERNES avec matricule
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS statut_declare,
    u.statut AS statut_compte
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
    AND u.candidate_status = 'externe'
    AND u.matricule IS NOT NULL 
    AND u.matricule != ''
GROUP BY 
    u.id, u.email, u.matricule, u.first_name, u.last_name, 
    u.candidate_status, u.statut
ORDER BY 
    u.matricule;

-- 6. INCOHÉRENCES : Candidats INTERNES sans email SEEG
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS statut_declare,
    u.statut AS statut_compte
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
    AND u.candidate_status = 'interne'
    AND u.email NOT LIKE '%@seeg-gabon.com'
GROUP BY 
    u.id, u.email, u.matricule, u.first_name, u.last_name, 
    u.candidate_status, u.statut
ORDER BY 
    u.email;

-- 7. RÉSUMÉ des incohérences
SELECT 
    'Externes avec email SEEG' AS type_incoherence,
    COUNT(DISTINCT u.id) AS nombre
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
    AND u.candidate_status = 'externe'
    AND u.email LIKE '%@seeg-gabon.com'

UNION ALL

SELECT 
    'Externes avec matricule' AS type_incoherence,
    COUNT(DISTINCT u.id) AS nombre
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
    AND u.candidate_status = 'externe'
    AND u.matricule IS NOT NULL 
    AND u.matricule != ''

UNION ALL

SELECT 
    'Internes sans email SEEG' AS type_incoherence,
    COUNT(DISTINCT u.id) AS nombre
FROM 
    users u
INNER JOIN 
    applications a ON a.candidate_id = u.id
INNER JOIN 
    job_offers jo ON a.job_offer_id = jo.id
WHERE 
    jo.campaign_id = 1
    AND u.candidate_status = 'interne'
    AND u.email NOT LIKE '%@seeg-gabon.com';

