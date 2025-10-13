-- Add internal/external audience columns and validation
-- Created on 2025-10-08 14:15:36+01:00

-- 1) Users: candidate_status (interne|externe)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS candidate_status text;

ALTER TABLE public.users
  ADD CONSTRAINT users_candidate_status_chk
  CHECK (candidate_status IN ('interne','externe'));

-- 2) Job offers: status_offers (interne|externe)
ALTER TABLE public.job_offers
  ADD COLUMN IF NOT EXISTS status_offers text;

ALTER TABLE public.job_offers
  ADD CONSTRAINT job_offers_status_offers_chk
  CHECK (status_offers IN ('interne','externe'));

-- Optional: you can set a default for future rows
-- ALTER TABLE public.job_offers ALTER COLUMN status_offers SET DEFAULT 'externe';

-- 3) Applications: candidature_status (interne|externe)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS candidature_status text;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_candidature_status_chk
  CHECK (candidature_status IN ('interne','externe'));

-- 4) Trigger to default applications.candidature_status from users.candidate_status or job_offers.status_offers
CREATE OR REPLACE FUNCTION public.set_and_validate_candidature_status()
RETURNS trigger AS $$
DECLARE
  v_user_status text;
  v_offer_status text;
BEGIN
  -- Fetch candidate_status from users
  IF NEW.candidate_id IS NOT NULL THEN
    SELECT candidate_status INTO v_user_status FROM public.users WHERE id = NEW.candidate_id;
  END IF;

  -- Fetch status_offers from job_offers
  IF NEW.job_offer_id IS NOT NULL THEN
    SELECT status_offers INTO v_offer_status FROM public.job_offers WHERE id = NEW.job_offer_id;
  END IF;

  -- Default the candidature_status if missing
  IF NEW.candidature_status IS NULL THEN
    NEW.candidature_status := COALESCE(v_user_status, v_offer_status);
  END IF;

  -- Validate consistency when both sides are known
  IF NEW.candidature_status IS NOT NULL THEN
    IF v_user_status IS NOT NULL AND NEW.candidature_status <> v_user_status THEN
      RAISE EXCEPTION USING MESSAGE = 'Candidature non autorisée: votre statut candidat ne correspond pas à cette candidature (interne/externe).';
    END IF;
    IF v_offer_status IS NOT NULL AND NEW.candidature_status <> v_offer_status THEN
      RAISE EXCEPTION USING MESSAGE = 'Candidature non autorisée: cette offre n''est pas ouverte à votre type de candidature (interne/externe).';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_set_and_validate_candidature_status ON public.applications;
CREATE TRIGGER trg_set_and_validate_candidature_status
BEFORE INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.set_and_validate_candidature_status();
