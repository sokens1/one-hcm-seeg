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
    v_message text;
    v_is_valid boolean;
BEGIN
    -- Vérifier si le matricule existe dans seeg_agents
    -- Conversion du matricule bigint en text pour la comparaison
    SELECT EXISTS (
        SELECT 1 
        FROM seeg_agents 
        WHERE matricule::text = p_matricule
    ) INTO v_exists_in_agents;

    -- Vérifier si le matricule est déjà utilisé dans users
    SELECT EXISTS (
        SELECT 1 
        FROM users 
        WHERE matricule = p_matricule
    ) INTO v_already_used;

    -- Déterminer la validité et le message
    IF NOT v_exists_in_agents THEN
        v_is_valid := false;
        v_message := 'Ce matricule n''existe pas dans la base SEEG';
    ELSIF v_already_used THEN
        v_is_valid := false;
        v_message := 'Ce matricule est déjà utilisé par un autre compte';
    ELSE
        v_is_valid := true;
        v_message := 'Matricule valide';
    END IF;

    -- Construire le résultat JSON
    RETURN json_build_object(
        'exists_in_agents', v_exists_in_agents,
        'already_used', v_already_used,
        'is_valid', v_is_valid,
        'message', v_message
    );
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION verify_matricule(text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_matricule(text) TO anon;

-- Commentaire
COMMENT ON FUNCTION verify_matricule(text) IS 'Vérifie que le matricule existe dans seeg_agents et n''est pas déjà utilisé dans users';

