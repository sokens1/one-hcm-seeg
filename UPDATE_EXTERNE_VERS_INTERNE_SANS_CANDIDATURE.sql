-- Mettre à jour les utilisateurs inscrits sans candidature
-- Changer de 'externe' vers 'interne' ceux qui ont un email SEEG

-- ÉTAPE 1 : Vérifier combien seront affectés
SELECT 
    COUNT(*) AS nombre_a_modifier,
    COUNT(CASE WHEN email LIKE '%@seeg-gabon.com' THEN 1 END) AS avec_email_seeg
FROM 
    users u
WHERE 
    u.role IN ('candidat', 'candidate')
    AND u.candidate_status = 'externe'  -- Seulement ceux qui sont en 'externe'
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a 
        WHERE a.candidate_id = u.id
    );

-- ÉTAPE 2 : UPDATE - Mettre candidate_status = 'interne' pour ceux qui sont en 'externe'
UPDATE users
SET 
    candidate_status = 'interne',
    no_seeg_email = CASE 
        WHEN email LIKE '%@seeg-gabon.com' THEN false
        ELSE true
    END,
    updated_at = NOW()
WHERE 
    id IN (
        SELECT u.id
        FROM users u
        WHERE 
            u.role IN ('candidat', 'candidate')
            AND u.candidate_status = 'externe'  -- Seulement ceux en 'externe'
            AND NOT EXISTS (
                SELECT 1 
                FROM applications a 
                WHERE a.candidate_id = u.id
            )
    );

-- ÉTAPE 3 : Vérification après UPDATE
SELECT 
    u.id,
    u.email,
    u.matricule,
    u.first_name || ' ' || u.last_name AS nom_complet,
    u.candidate_status AS nouveau_statut,
    u.no_seeg_email,
    u.statut AS statut_compte
FROM 
    users u
WHERE 
    u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a 
        WHERE a.candidate_id = u.id
    )
ORDER BY 
    u.created_at DESC;

-- ÉTAPE 4 : Statistiques finales
SELECT 
    u.candidate_status,
    COUNT(*) AS nombre
FROM 
    users u
WHERE 
    u.role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a 
        WHERE a.candidate_id = u.id
    )
GROUP BY 
    u.candidate_status;

