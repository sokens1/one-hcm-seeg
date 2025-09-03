-- Ajouter une colonne JSONB 'details' pour stocker les annotations complètes du Protocole 2
-- La colonne permettra de persister toutes les étoiles, commentaires et niveaux saisis dans l'UI

ALTER TABLE public.protocol2_evaluations
ADD COLUMN IF NOT EXISTS details JSONB;

COMMENT ON COLUMN public.protocol2_evaluations.details IS 'Détails complets de l\'évaluation Protocole 2 (étoiles, commentaires, niveaux, etc.)';


