-- 🚨 ACTION IMMÉDIATE - À exécuter MAINTENANT pour réduire le Disk IO
-- Copier et exécuter TOUT ce fichier dans Supabase SQL Editor

-- Index critiques pour les tables les plus utilisées
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_offer_id ON applications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_campaign_id ON job_offers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_users_matricule ON users(matricule);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);

-- Vérifier que les index sont créés
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'applications', 'job_offers')
ORDER BY tablename, indexname;

