-- Ajoute les URLs LinkedIn et Portfolio à la table des profils candidats

BEGIN;

ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

COMMIT;
