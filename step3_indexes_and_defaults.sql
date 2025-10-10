-- ÉTAPE 3 : Créer les index et fixer les valeurs par défaut
CREATE INDEX IF NOT EXISTS idx_job_offers_status_offerts ON job_offers(status_offerts);

ALTER TABLE job_offers 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE job_offers
ALTER COLUMN id SET NOT NULL;

