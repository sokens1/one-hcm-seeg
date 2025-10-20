-- ROLLBACK : Restaurer les candidate_status à leur état précédent

-- OPTION 1 : Remettre TOUS les candidats de la campagne 1 en 'externe'
-- (Ce qu'ils étaient à l'origine selon vos données)
UPDATE users
SET 
    candidate_status = 'externe',
    no_seeg_email = false,
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT a.candidate_id
    FROM applications a
    INNER JOIN job_offers jo ON a.job_offer_id = jo.id
    WHERE jo.campaign_id = 1
);

-- OPTION 2 : Remettre TOUS les utilisateurs sans candidature en 'externe'
UPDATE users
SET 
    candidate_status = 'externe',
    no_seeg_email = false,
    updated_at = NOW()
WHERE 
    role IN ('candidat', 'candidate')
    AND NOT EXISTS (
        SELECT 1 
        FROM applications a 
        WHERE a.candidate_id = users.id
    );

-- OPTION 3 : Restaurer TOUT LE MONDE (candidats campagne 1 + inscrits sans candidature) en 'externe'
UPDATE users
SET 
    candidate_status = 'externe',
    no_seeg_email = false,
    updated_at = NOW()
WHERE 
    role IN ('candidat', 'candidate')
    AND (
        -- Candidats de la campagne 1
        id IN (
            SELECT DISTINCT a.candidate_id
            FROM applications a
            INNER JOIN job_offers jo ON a.job_offer_id = jo.id
            WHERE jo.campaign_id = 1
        )
        OR
        -- Utilisateurs sans candidature
        NOT EXISTS (
            SELECT 1 
            FROM applications a 
            WHERE a.candidate_id = users.id
        )
    );

-- Vérification après rollback
SELECT 
    candidate_status,
    COUNT(*) AS nombre,
    COUNT(CASE WHEN email LIKE '%@seeg-gabon.com' THEN 1 END) AS avec_email_seeg
FROM users
WHERE role IN ('candidat', 'candidate')
GROUP BY candidate_status;

