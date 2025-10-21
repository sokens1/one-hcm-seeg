-- URGENCE : Ajouter des index pour réduire le Disk IO
-- À exécuter IMMÉDIATEMENT pour optimiser les performances

-- Index sur applications (table très sollicitée)
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_offer_id ON applications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Index sur job_offers
CREATE INDEX IF NOT EXISTS idx_job_offers_campaign_id ON job_offers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_job_offers_status_offerts ON job_offers(status_offerts);
CREATE INDEX IF NOT EXISTS idx_job_offers_date_limite ON job_offers(date_limite);

-- Index sur users (table utilisateurs)
CREATE INDEX IF NOT EXISTS idx_users_matricule ON users(matricule);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_candidate_status ON users(candidate_status);

-- Index composites pour requêtes complexes
CREATE INDEX IF NOT EXISTS idx_job_offers_status_campaign ON job_offers(status, campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_status ON applications(job_offer_id, status);

-- Vérifier les index créés
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'applications', 'job_offers')
ORDER BY tablename, indexname;

