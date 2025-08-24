-- Goal: Add 'CDI avec période d''essai' to the allowed contract types.
-- Problem: The existing CHECK constraint on the job_offers table is too restrictive.

-- To make this migration idempotent, we first drop the old constraint if it exists.
-- The constraint name is typically derived from the table and column name.
ALTER TABLE public.job_offers DROP CONSTRAINT IF EXISTS job_offers_contract_type_check;

-- Now, we add a new constraint with the updated list of allowed values.
-- Note the double single-quote to escape the apostrophe in the string.
ALTER TABLE public.job_offers
ADD CONSTRAINT job_offers_contract_type_check
CHECK (contract_type IN ('CDI', 'CDD', 'Stage', 'Freelance', 'CDI avec période d''essai'));
