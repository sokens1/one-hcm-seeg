-- Migration: Optimiser les index de la base de données pour réduire l'utilisation des E/S disque
-- Date: 2025-10-14
-- Description: Ajoute des index manquants sur les colonnes fréquemment interrogées

-- ============================================================================
-- INDEX POUR LA TABLE applications
-- ============================================================================

-- Index pour les requêtes par candidate_id (très fréquent)
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id 
ON public.applications(candidate_id);

-- Index pour les requêtes par job_offer_id (très fréquent)
CREATE INDEX IF NOT EXISTS idx_applications_job_offer_id 
ON public.applications(job_offer_id);

-- Index pour les requêtes par status (filtrage fréquent)
CREATE INDEX IF NOT EXISTS idx_applications_status 
ON public.applications(status);

-- Index pour les requêtes par created_at (pour tri et filtrage temporel)
CREATE INDEX IF NOT EXISTS idx_applications_created_at 
ON public.applications(created_at DESC);

-- Index composé pour les requêtes combinées fréquentes
CREATE INDEX IF NOT EXISTS idx_applications_candidate_job 
ON public.applications(candidate_id, job_offer_id);

-- ============================================================================
-- INDEX POUR LA TABLE documents
-- ============================================================================

-- Index pour les requêtes par application_id (très fréquent)
CREATE INDEX IF NOT EXISTS idx_documents_application_id 
ON public.documents(application_id);

-- Index pour les requêtes par document_type
CREATE INDEX IF NOT EXISTS idx_documents_type 
ON public.documents(document_type);

-- ============================================================================
-- INDEX POUR LA TABLE protocol1_evaluations
-- ============================================================================

-- Index pour les requêtes par application_id (très fréquent)
CREATE INDEX IF NOT EXISTS idx_protocol1_application_id 
ON public.protocol1_evaluations(application_id);

-- Index pour les requêtes par status
CREATE INDEX IF NOT EXISTS idx_protocol1_status 
ON public.protocol1_evaluations(status);

-- Index pour les requêtes par completed
CREATE INDEX IF NOT EXISTS idx_protocol1_completed 
ON public.protocol1_evaluations(completed);

-- ============================================================================
-- INDEX POUR LA TABLE protocol2_evaluations
-- ============================================================================

-- Index pour les requêtes par application_id (très fréquent)
CREATE INDEX IF NOT EXISTS idx_protocol2_application_id 
ON public.protocol2_evaluations(application_id);

-- Index pour les requêtes par status
CREATE INDEX IF NOT EXISTS idx_protocol2_status 
ON public.protocol2_evaluations(status);

-- Index pour les requêtes par completed
CREATE INDEX IF NOT EXISTS idx_protocol2_completed 
ON public.protocol2_evaluations(completed);

-- ============================================================================
-- INDEX POUR LA TABLE job_offers
-- ============================================================================

-- Index pour les requêtes par campaign_id (filtrage fréquent)
CREATE INDEX IF NOT EXISTS idx_job_offers_campaign_id 
ON public.job_offers(campaign_id);

-- Index pour les requêtes par created_at (tri fréquent)
CREATE INDEX IF NOT EXISTS idx_job_offers_created_at 
ON public.job_offers(created_at DESC);

-- Index composé pour les requêtes combinées status + campaign
CREATE INDEX IF NOT EXISTS idx_job_offers_status_campaign 
ON public.job_offers(status, campaign_id) WHERE status = 'active';

-- ============================================================================
-- INDEX POUR LA TABLE users
-- ============================================================================

-- Index pour les requêtes par email (recherche fréquente)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON public.users(email);

-- Index pour les requêtes par matricule (recherche fréquente)
CREATE INDEX IF NOT EXISTS idx_users_matricule 
ON public.users(matricule) WHERE matricule IS NOT NULL;

-- Index pour les requêtes par candidate_status
CREATE INDEX IF NOT EXISTS idx_users_candidate_status 
ON public.users(candidate_status) WHERE candidate_status IS NOT NULL;

-- Index pour les requêtes par created_at (filtrage temporel)
CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON public.users(created_at DESC);

-- ============================================================================
-- INDEX POUR LA TABLE access_requests (avec vérification)
-- ============================================================================

-- Index pour les requêtes par status (filtrage fréquent)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'access_requests') THEN
        CREATE INDEX IF NOT EXISTS idx_access_requests_status 
        ON public.access_requests(status);
        
        CREATE INDEX IF NOT EXISTS idx_access_requests_created_at 
        ON public.access_requests(created_at DESC);
        
        -- Index pour viewed seulement si la colonne existe
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'access_requests' 
                   AND column_name = 'viewed') THEN
            CREATE INDEX IF NOT EXISTS idx_access_requests_viewed 
            ON public.access_requests(viewed) WHERE viewed = false;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- INDEX POUR LA TABLE interview_slots
-- ============================================================================

-- Index pour les requêtes par date (filtrage temporel)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'interview_slots' 
               AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_interview_slots_date 
        ON public.interview_slots(date);
    END IF;
END $$;

-- Index pour les requêtes par time
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'interview_slots' 
               AND column_name = 'time') THEN
        CREATE INDEX IF NOT EXISTS idx_interview_slots_time 
        ON public.interview_slots(time);
    END IF;
END $$;

-- Index pour les requêtes par is_available
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'interview_slots' 
               AND column_name = 'is_available') THEN
        CREATE INDEX IF NOT EXISTS idx_interview_slots_available 
        ON public.interview_slots(is_available) WHERE is_available = true;
    END IF;
END $$;

-- ============================================================================
-- INDEX POUR LA TABLE email_logs (avec vérification)
-- ============================================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'email_logs') THEN
        
        CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_id 
        ON public.email_logs(recipient_id);
        
        CREATE INDEX IF NOT EXISTS idx_email_logs_created_at 
        ON public.email_logs(created_at DESC);
        
        CREATE INDEX IF NOT EXISTS idx_email_logs_email_type 
        ON public.email_logs(email_type);
    END IF;
END $$;

-- ============================================================================
-- ANALYSE ET VACUUM (avec vérification)
-- ============================================================================

-- Mettre à jour les statistiques de la base de données pour l'optimiseur de requêtes
DO $$ 
BEGIN
    -- Tables principales (toujours présentes)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'applications') THEN
        EXECUTE 'ANALYZE public.applications';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
        EXECUTE 'ANALYZE public.documents';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'job_offers') THEN
        EXECUTE 'ANALYZE public.job_offers';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        EXECUTE 'ANALYZE public.users';
    END IF;
    
    -- Tables optionnelles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'protocol1_evaluations') THEN
        EXECUTE 'ANALYZE public.protocol1_evaluations';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'protocol2_evaluations') THEN
        EXECUTE 'ANALYZE public.protocol2_evaluations';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'access_requests') THEN
        EXECUTE 'ANALYZE public.access_requests';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'interview_slots') THEN
        EXECUTE 'ANALYZE public.interview_slots';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_logs') THEN
        EXECUTE 'ANALYZE public.email_logs';
    END IF;
END $$;

-- Note: Les index partiels (avec WHERE) sont utilisés pour réduire la taille de l'index
-- et améliorer les performances pour les cas d'utilisation spécifiques fréquents

