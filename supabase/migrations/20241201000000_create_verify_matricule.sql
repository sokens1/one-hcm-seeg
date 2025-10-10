-- Migration pour créer la fonction verify_matricule
-- Cette fonction vérifie si un matricule existe dans la table seeg_agents
-- Date: 2024-12-01 (Avant les autres migrations)

-- 1. Créer la table seeg_agents si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.seeg_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricule TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter la colonne 'active' si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'seeg_agents' 
    AND column_name = 'active'
  ) THEN
    ALTER TABLE public.seeg_agents 
    ADD COLUMN active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_seeg_agents_matricule ON public.seeg_agents(matricule);
CREATE INDEX IF NOT EXISTS idx_seeg_agents_active ON public.seeg_agents(active) WHERE active IS NOT NULL;

-- 2. Fonction pour vérifier si un matricule existe
CREATE OR REPLACE FUNCTION public.verify_matricule(p_matricule TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_active_column BOOLEAN;
BEGIN
  -- Vérifier si la colonne 'active' existe
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'seeg_agents' 
    AND column_name = 'active'
  ) INTO v_has_active_column;
  
  -- Si la colonne 'active' existe, vérifier qu'elle est TRUE
  IF v_has_active_column THEN
    RETURN EXISTS (
      SELECT 1 
      FROM public.seeg_agents 
      WHERE matricule = p_matricule 
        AND active = TRUE
    );
  ELSE
    -- Sinon, juste vérifier l'existence du matricule
    RETURN EXISTS (
      SELECT 1 
      FROM public.seeg_agents 
      WHERE matricule = p_matricule
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Accorder les permissions (PUBLIC car utilisé lors de l'inscription)
GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_matricule(TEXT) TO authenticated;

-- 4. Insérer quelques matricules de test (OPTIONNEL - À ADAPTER)
-- Décommenter et adapter selon vos vrais matricules
/*
INSERT INTO public.seeg_agents (matricule, first_name, last_name, email, active)
VALUES 
  ('123456', 'Test', 'Agent1', 'test.agent1@seeg-gabon.com', TRUE),
  ('789012', 'Test', 'Agent2', 'test.agent2@seeg-gabon.com', TRUE),
  ('2001', 'Test', 'Agent3', 'test.agent3@seeg-gabon.com', TRUE)
ON CONFLICT (matricule) DO NOTHING;
*/

-- 5. Commentaire pour documentation
COMMENT ON FUNCTION public.verify_matricule(TEXT) IS 'Vérifie si un matricule existe dans la table seeg_agents et est actif';
COMMENT ON TABLE public.seeg_agents IS 'Liste des agents SEEG avec leurs matricules pour validation lors de l''inscription';

