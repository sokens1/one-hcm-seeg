-- Script optionnel : Ajouter le trigger pour mettre à jour updated_at automatiquement
-- Exécutez ce script APRÈS avoir créé la table avec le script simple
-- NOTE: Ce script est OPTIONNEL - la table fonctionne sans lui
-- Si ce script cause un timeout, vous pouvez l'ignorer complètement

-- Vérifier si la fonction existe déjà, sinon la créer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS update_candidate_ai_evaluations_updated_at ON candidate_ai_evaluations;

-- Créer le trigger
CREATE TRIGGER update_candidate_ai_evaluations_updated_at
  BEFORE UPDATE ON candidate_ai_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

