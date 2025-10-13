-- ÉTAPE 2 : Corriger la contrainte CHECK sur status
ALTER TABLE job_offers 
DROP CONSTRAINT IF EXISTS job_offers_status_check;

ALTER TABLE job_offers 
ADD CONSTRAINT job_offers_status_check 
CHECK (status IN ('active', 'inactive', 'draft', 'closed'));

