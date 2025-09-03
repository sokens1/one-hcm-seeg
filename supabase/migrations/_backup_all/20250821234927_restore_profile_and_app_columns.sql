-- Migration de restauration: aligner le schéma avec le code front
-- Objectif:
-- 1) Corriger les erreurs 400 sur candidate_profiles en ajoutant les colonnes manquantes (gender, birth_date)
-- 2) Aligner la table applications avec le code (reference_contacts, mtp_answers)

BEGIN;

-- 1) candidate_profiles: colonnes attendues par le front
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Index utile pour les jointures/requêtes fréquentes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'idx_candidate_profiles_user_id'
  ) THEN
    CREATE INDEX idx_candidate_profiles_user_id ON public.candidate_profiles(user_id);
  END IF;
END $$;

-- 2) applications: colonnes utilisées par le front
-- Eviter le mot-clé réservé "references" et offrir le champ attendu
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS reference_contacts TEXT;

-- Si l'ancienne colonne "references" existe et que la nouvelle est NULL, tenter un backfill
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'references'
  ) THEN
    UPDATE public.applications
      SET reference_contacts = COALESCE(reference_contacts, CAST("references" AS TEXT))
    WHERE reference_contacts IS NULL;
  END IF;
END $$;

-- Champ JSON pour les réponses MTP (si pas déjà créé par une autre migration)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS mtp_answers JSONB;

COMMIT;
