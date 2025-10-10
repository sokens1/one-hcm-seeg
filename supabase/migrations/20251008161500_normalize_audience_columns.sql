-- Normalize audience columns to canonical names
-- Created: 2025-10-08 16:15:00+01:00

-- USERS: ensure candidate_status exists and is populated from candidat_status if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'candidate_status'
  ) THEN
    ALTER TABLE public.users ADD COLUMN candidate_status text;
  END IF;

  -- Backfill candidate_status from typo column candidat_status when candidate_status is NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'candidat_status'
  ) THEN
    UPDATE public.users
    SET candidate_status = COALESCE(candidate_status, candidat_status)
    WHERE candidate_status IS NULL;
  END IF;

  -- Add CHECK constraint (ignore if already exists)
  BEGIN
    ALTER TABLE public.users
      ADD CONSTRAINT users_candidate_status_chk_norm CHECK (candidate_status IN ('interne','externe'));
  EXCEPTION WHEN duplicate_object THEN
    -- constraint already exists, ignore
  END;
END $$;

-- JOB_OFFERS: ensure status_offers exists and is populated from status_offerts if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_offers' AND column_name = 'status_offers'
  ) THEN
    ALTER TABLE public.job_offers ADD COLUMN status_offers text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_offers' AND column_name = 'status_offerts'
  ) THEN
    UPDATE public.job_offers
    SET status_offers = COALESCE(status_offers, status_offerts)
    WHERE status_offers IS NULL;
  END IF;

  -- Add CHECK constraint (ignore if already exists)
  BEGIN
    ALTER TABLE public.job_offers
      ADD CONSTRAINT job_offers_status_offers_chk_norm CHECK (status_offers IN ('interne','externe'));
  EXCEPTION WHEN duplicate_object THEN
    -- constraint already exists, ignore
  END;
END $$;

-- APPLICATIONS: ensure candidature_status exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'candidature_status'
  ) THEN
    ALTER TABLE public.applications ADD COLUMN candidature_status text;
  END IF;

  BEGIN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_candidature_status_chk_norm CHECK (candidature_status IN ('interne','externe'));
  EXCEPTION WHEN duplicate_object THEN
    -- constraint already exists, ignore
  END;
END $$;

-- Optional: drop typo columns after backfill (commented out for safety)
-- ALTER TABLE public.users DROP COLUMN IF EXISTS candidat_status;
-- ALTER TABLE public.job_offers DROP COLUMN IF EXISTS status_offerts;
