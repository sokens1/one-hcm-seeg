-- Mettre en statut 'interne' tous les utilisateurs inscrits avant le 11/09/2025 sans candidature

-- ÉTAPE 1 : Vérifier combien seront affectés
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS statut_actuel,
    u.statut AS statut_compte,
    u.created_at AS date_inscription
FROM 
    users u
WHERE 
    -- Inscrits avant le 11/09/2025
    u.created_at < '2025-09-11T00:00:00'
    -- Rôle candidat
    AND u.role IN ('candidat', 'candidate')
    -- N'ont JAMAIS candidaté (aucune application)
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a
        WHERE a.candidate_id = u.id
    )
ORDER BY 
    u.created_at DESC;

-- ÉTAPE 2 : Compter
SELECT 
    COUNT(*) AS total_a_modifier,
    COUNT(CASE WHEN u.email LIKE '%@seeg-gabon.com' THEN 1 END) AS avec_email_seeg,
    COUNT(CASE WHEN u.matricule IS NOT NULL AND u.matricule != '' THEN 1 END) AS avec_matricule
FROM 
    users u
WHERE 
    u.created_at < '2025-09-11T00:00:00'
    AND u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a
        WHERE a.candidate_id = u.id
    );

-- ÉTAPE 3 : UPDATE - Mettre en statut 'interne'
UPDATE users
SET 
    candidate_status = 'interne',
    no_seeg_email = CASE 
        WHEN email LIKE '%@seeg-gabon.com' THEN false
        ELSE true
    END,
    updated_at = NOW()
WHERE 
    -- Inscrits avant le 11/09/2025
    created_at < '2025-09-11T00:00:00'
    -- Rôle candidat
    AND role IN ('candidat', 'candidate')
    -- N'ont JAMAIS candidaté
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a
        WHERE a.candidate_id = users.id
    );

-- ÉTAPE 4 : Vérification après UPDATE
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS nouveau_statut,
    u.no_seeg_email,
    u.statut AS statut_compte,
    u.created_at AS date_inscription
FROM 
    users u
WHERE 
    u.created_at < '2025-09-11T00:00:00'
    AND u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a
        WHERE a.candidate_id = u.id
    )
ORDER BY 
    u.created_at DESC;

-- ÉTAPE 5 : Statistiques finales
SELECT 
    'Inscrits campagne 1 sans candidature' AS categorie,
    COUNT(*) AS nombre,
    COUNT(CASE WHEN candidate_status = 'interne' THEN 1 END) AS statut_interne,
    COUNT(CASE WHEN candidate_status = 'externe' THEN 1 END) AS statut_externe
FROM 
    users u
WHERE 
    u.created_at < '2025-09-11T00:00:00'
    AND u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a
        WHERE a.candidate_id = u.id
    );

