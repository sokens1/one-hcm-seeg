-- Migration : Ajout des colonnes de synthèse à la table applications
-- Date : 2025-01-20
-- Description : Ajoute les colonnes pour stocker les points forts, points d'amélioration et conclusion de la synthèse

-- 1. Ajouter les colonnes de synthèse à la table applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS synthesis_points_forts TEXT,
ADD COLUMN IF NOT EXISTS synthesis_points_amelioration TEXT,
ADD COLUMN IF NOT EXISTS synthesis_conclusion TEXT;

-- 2. Créer des commentaires sur les colonnes pour la documentation
COMMENT ON COLUMN public.applications.synthesis_points_forts IS 
'Points forts identifiés lors de la synthèse de l''évaluation du candidat';

COMMENT ON COLUMN public.applications.synthesis_points_amelioration IS 
'Points d''amélioration identifiés lors de la synthèse de l''évaluation du candidat';

COMMENT ON COLUMN public.applications.synthesis_conclusion IS 
'Conclusion générale de la synthèse de l''évaluation du candidat';
