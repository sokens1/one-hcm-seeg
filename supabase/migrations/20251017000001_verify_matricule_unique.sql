-- Migration pour améliorer la vérification du matricule
-- Vérifie que le matricule existe dans seeg_agents ET qu'il n'est pas déjà utilisé dans users

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS verify_matricule(text);

-- Créer la nouvelle fonction améliorée
CREATE OR REPLACE FUNCTION verify_matricule(p_matricule text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists_in_agents boolean;
    v_already_used boolean;
    v_result json;
BEGIN
    -- Vérifier si le matricule existe dans seeg_agents
    -- Conversion du matricule text en bigint pour la comparaison
    SELECT EXISTS (
        SELECT 1 
        FROM seeg_agents 
        WHERE matricule::text = p_matricule
    ) INTO v_exists_in_agents;

    -- Vérifier si le matricule est déjà utilisé dans users
    -- Le matricule dans users est déjà en text, pas de conversion nécessaire
    SELECT EXISTS (
        SELECT 1 
        FROM users 
        WHERE matricule = p_matricule
    ) INTO v_already_used;

    -- Construire le résultat JSON
    v_result := json_build_object(
        'exists_in_agents', v_exists_in_agents,
        'already_used', v_already_used,
        'is_valid', v_exists_in_agents AND NOT v_already_used,
        'message', CASE 
            WHEN NOT v_exists_in_agents THEN 'Ce matricule n''existe pas dans la base SEEG'
            WHEN v_already_used THEN 'Ce matricule est déjà utilisé par un autre compte'
            ELSE 'Matricule valide'
        END
    );

    RETURN v_result;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION verify_matricule(text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_matricule(text) TO anon;

-- Commentaire
COMMENT ON FUNCTION verify_matricule(text) IS 'Vérifie que le matricule existe dans seeg_agents et n''est pas déjà utilisé dans users';

