-- Migration pour améliorer la vérification du matricule
-- Version simplifiée et testée

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS verify_matricule(text);

-- Créer la nouvelle fonction
CREATE FUNCTION verify_matricule(p_matricule text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists_in_agents boolean := false;
    v_already_used boolean := false;
    v_message text;
    v_is_valid boolean;
BEGIN
    -- Vérifier existence dans seeg_agents (matricule est bigint, on le convertit en text)
    SELECT EXISTS (
        SELECT 1 
        FROM seeg_agents 
        WHERE CAST(matricule AS text) = p_matricule
    ) INTO v_exists_in_agents;

    -- Vérifier si déjà utilisé dans users (matricule est text)
    SELECT EXISTS (
        SELECT 1 
        FROM users 
        WHERE matricule = p_matricule
    ) INTO v_already_used;

    -- Déterminer validité et message
    IF v_exists_in_agents = false THEN
        v_is_valid := false;
        v_message := 'Ce matricule n existe pas dans la base SEEG';
    ELSIF v_already_used = true THEN
        v_is_valid := false;
        v_message := 'Le titulaire de ce matricule a deja postule lors de la campagne 1';
    ELSE
        v_is_valid := true;
        v_message := 'Matricule valide';
    END IF;

    -- Retourner le résultat
    RETURN json_build_object(
        'exists_in_agents', v_exists_in_agents,
        'already_used', v_already_used,
        'is_valid', v_is_valid,
        'message', v_message
    );
END;
$$;

-- Donner les permissions
GRANT EXECUTE ON FUNCTION verify_matricule(text) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_matricule(text) TO anon;

