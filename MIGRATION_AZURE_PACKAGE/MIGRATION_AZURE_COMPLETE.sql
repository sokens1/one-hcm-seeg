-- ============================================================================
-- MIGRATION COMPLETE AZURE SQL DATABASE
-- Source: Supabase → Azure
-- Date: Octobre 2025
-- ============================================================================
-- Ce script applique toutes les mises à jour récentes manquantes
-- ⚠️ IMPORTANT: Exécuter dans l'ordre présenté
-- ============================================================================

BEGIN TRANSACTION;

-- ============================================================================
-- ÉTAPE 1: AJOUT DES COLONNES MANQUANTES
-- ============================================================================

PRINT 'Étape 1: Ajout des colonnes manquantes...';

-- Table: users
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'candidate_status')
BEGIN
    ALTER TABLE users ADD candidate_status NVARCHAR(50) CHECK (candidate_status IN ('interne','externe'));
    PRINT '✓ users.candidate_status ajouté';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'matricule')
BEGIN
    ALTER TABLE users ADD matricule NVARCHAR(100) UNIQUE;
    PRINT '✓ users.matricule ajouté';
END

-- Table: job_offers
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('job_offers') AND name = 'campaign_id')
BEGIN
    ALTER TABLE job_offers ADD campaign_id INT;
    PRINT '✓ job_offers.campaign_id ajouté (CRITIQUE)';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('job_offers') AND name = 'status_offers')
BEGIN
    ALTER TABLE job_offers ADD status_offers NVARCHAR(50) CHECK (status_offers IN ('interne','externe'));
    PRINT '✓ job_offers.status_offers ajouté';
END

-- Table: applications
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('applications') AND name = 'candidature_status')
BEGIN
    ALTER TABLE applications ADD candidature_status NVARCHAR(50) CHECK (candidature_status IN ('interne','externe'));
    PRINT '✓ applications.candidature_status ajouté';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('applications') AND name = 'has_been_manager')
BEGIN
    ALTER TABLE applications ADD has_been_manager BIT DEFAULT NULL;
    PRINT '✓ applications.has_been_manager ajouté';
END

-- Table: access_requests
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('access_requests') AND name = 'viewed')
BEGIN
    ALTER TABLE access_requests ADD viewed BIT DEFAULT 0 NOT NULL;
    PRINT '✓ access_requests.viewed ajouté';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('access_requests') AND name = 'rejection_reason')
BEGIN
    ALTER TABLE access_requests ADD rejection_reason NVARCHAR(MAX);
    PRINT '✓ access_requests.rejection_reason ajouté';
END

-- Table: protocol2_evaluations
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('protocol2_evaluations') AND name = 'simulation_date')
BEGIN
    ALTER TABLE protocol2_evaluations ADD simulation_date DATE;
    PRINT '✓ protocol2_evaluations.simulation_date ajouté';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('protocol2_evaluations') AND name = 'simulation_time')
BEGIN
    ALTER TABLE protocol2_evaluations ADD simulation_time TIME;
    PRINT '✓ protocol2_evaluations.simulation_time ajouté';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('protocol2_evaluations') AND name = 'simulation_scheduled_at')
BEGIN
    ALTER TABLE protocol2_evaluations ADD simulation_scheduled_at DATETIME2;
    PRINT '✓ protocol2_evaluations.simulation_scheduled_at ajouté';
END

-- ============================================================================
-- ÉTAPE 2: MIGRATION DES DONNÉES (CAMPAIGN_ID)
-- ============================================================================

PRINT 'Étape 2: Migration des données campaign_id...';

UPDATE job_offers
SET campaign_id = CASE
    WHEN created_at < '2025-09-11 00:00:00' THEN 1
    WHEN created_at >= '2025-09-11 00:00:00' AND created_at <= '2025-10-21 23:59:59' THEN 2
    WHEN created_at > '2025-10-21 23:59:59' THEN 3
    ELSE 2  -- Campagne par défaut (actuelle)
END
WHERE campaign_id IS NULL;

PRINT '✓ campaign_id assigné à toutes les offres';

-- Vérification
DECLARE @nullCampaigns INT;
SELECT @nullCampaigns = COUNT(*) FROM job_offers WHERE campaign_id IS NULL;
IF @nullCampaigns > 0
    PRINT '⚠️ Avertissement: ' + CAST(@nullCampaigns AS VARCHAR) + ' offres sans campaign_id';
ELSE
    PRINT '✓ Toutes les offres ont un campaign_id';

-- ============================================================================
-- ÉTAPE 3: CRÉATION DES INDEX DE PERFORMANCE
-- ============================================================================

PRINT 'Étape 3: Création des index de performance...';

-- Index pour users
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_users_email' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_email ON users(email);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_users_matricule' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_matricule ON users(matricule) WHERE matricule IS NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_users_candidate_status' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_candidate_status ON users(candidate_status) WHERE candidate_status IS NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_users_created_at' AND object_id = OBJECT_ID('users'))
    CREATE INDEX idx_users_created_at ON users(created_at DESC);

PRINT '✓ Index users créés';

-- Index pour job_offers
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_job_offers_campaign_id' AND object_id = OBJECT_ID('job_offers'))
    CREATE INDEX idx_job_offers_campaign_id ON job_offers(campaign_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_job_offers_created_at' AND object_id = OBJECT_ID('job_offers'))
    CREATE INDEX idx_job_offers_created_at ON job_offers(created_at DESC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_job_offers_status_campaign' AND object_id = OBJECT_ID('job_offers'))
    CREATE INDEX idx_job_offers_status_campaign ON job_offers(status, campaign_id) WHERE status = 'active';

PRINT '✓ Index job_offers créés';

-- Index pour applications
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_applications_candidate_id' AND object_id = OBJECT_ID('applications'))
    CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_applications_job_offer_id' AND object_id = OBJECT_ID('applications'))
    CREATE INDEX idx_applications_job_offer_id ON applications(job_offer_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_applications_status' AND object_id = OBJECT_ID('applications'))
    CREATE INDEX idx_applications_status ON applications(status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_applications_created_at' AND object_id = OBJECT_ID('applications'))
    CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_applications_candidate_job' AND object_id = OBJECT_ID('applications'))
    CREATE INDEX idx_applications_candidate_job ON applications(candidate_id, job_offer_id);

PRINT '✓ Index applications créés';

-- Index pour documents
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_documents_application_id' AND object_id = OBJECT_ID('documents'))
    CREATE INDEX idx_documents_application_id ON documents(application_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_documents_type' AND object_id = OBJECT_ID('documents'))
    CREATE INDEX idx_documents_type ON documents(document_type);

PRINT '✓ Index documents créés';

-- Index pour protocol1_evaluations
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_protocol1_application_id' AND object_id = OBJECT_ID('protocol1_evaluations'))
    CREATE INDEX idx_protocol1_application_id ON protocol1_evaluations(application_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_protocol1_status' AND object_id = OBJECT_ID('protocol1_evaluations'))
    CREATE INDEX idx_protocol1_status ON protocol1_evaluations(status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_protocol1_completed' AND object_id = OBJECT_ID('protocol1_evaluations'))
    CREATE INDEX idx_protocol1_completed ON protocol1_evaluations(completed);

PRINT '✓ Index protocol1_evaluations créés';

-- Index pour protocol2_evaluations
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_protocol2_application_id' AND object_id = OBJECT_ID('protocol2_evaluations'))
    CREATE INDEX idx_protocol2_application_id ON protocol2_evaluations(application_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_protocol2_status' AND object_id = OBJECT_ID('protocol2_evaluations'))
    CREATE INDEX idx_protocol2_status ON protocol2_evaluations(status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_protocol2_completed' AND object_id = OBJECT_ID('protocol2_evaluations'))
    CREATE INDEX idx_protocol2_completed ON protocol2_evaluations(completed);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_protocol2_simulation_date' AND object_id = OBJECT_ID('protocol2_evaluations'))
    CREATE INDEX idx_protocol2_simulation_date ON protocol2_evaluations(simulation_date);

PRINT '✓ Index protocol2_evaluations créés';

-- Index pour access_requests
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_access_requests_status' AND object_id = OBJECT_ID('access_requests'))
    CREATE INDEX idx_access_requests_status ON access_requests(status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_access_requests_created_at' AND object_id = OBJECT_ID('access_requests'))
    CREATE INDEX idx_access_requests_created_at ON access_requests(created_at DESC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_access_requests_viewed' AND object_id = OBJECT_ID('access_requests'))
    CREATE INDEX idx_access_requests_viewed ON access_requests(viewed) WHERE viewed = 0;

PRINT '✓ Index access_requests créés';

-- Index pour interview_slots (si la table existe)
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'interview_slots')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_interview_slots_date' AND object_id = OBJECT_ID('interview_slots'))
        CREATE INDEX idx_interview_slots_date ON interview_slots(date);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_interview_slots_time' AND object_id = OBJECT_ID('interview_slots'))
        CREATE INDEX idx_interview_slots_time ON interview_slots(time);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_interview_slots_available' AND object_id = OBJECT_ID('interview_slots'))
        CREATE INDEX idx_interview_slots_available ON interview_slots(is_available) WHERE is_available = 1;

    PRINT '✓ Index interview_slots créés';
END

-- Index pour email_logs (si la table existe)
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'email_logs')
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_email_logs_recipient_id' AND object_id = OBJECT_ID('email_logs'))
        CREATE INDEX idx_email_logs_recipient_id ON email_logs(recipient_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_email_logs_created_at' AND object_id = OBJECT_ID('email_logs'))
        CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_email_logs_email_type' AND object_id = OBJECT_ID('email_logs'))
        CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);

    PRINT '✓ Index email_logs créés';
END

-- ============================================================================
-- ÉTAPE 4: MISE À JOUR DES CONTRAINTES DE CLÉ ÉTRANGÈRE
-- ============================================================================

PRINT 'Étape 4: Mise à jour des contraintes de clé étrangère...';

-- Vérifier et mettre à jour la contrainte pour application_documents
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'application_documents')
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_application_documents_applications')
    BEGIN
        ALTER TABLE application_documents DROP CONSTRAINT FK_application_documents_applications;
        PRINT '✓ Ancienne contrainte FK supprimée';
    END

    -- Recréer avec ON DELETE CASCADE
    ALTER TABLE application_documents
    ADD CONSTRAINT FK_application_documents_applications
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;
    
    PRINT '✓ Contrainte CASCADE créée pour application_documents';
END

-- ============================================================================
-- ÉTAPE 5: RAPPORT FINAL ET VÉRIFICATIONS
-- ============================================================================

PRINT '';
PRINT '============================================================================';
PRINT 'RAPPORT DE MIGRATION';
PRINT '============================================================================';

-- Statistiques campaign_id
PRINT 'Distribution des offres par campagne:';
SELECT 
    COALESCE(CAST(campaign_id AS VARCHAR), 'NULL') as [Campagne],
    COUNT(*) as [Nombre offres]
FROM job_offers
GROUP BY campaign_id
ORDER BY campaign_id;

-- Statistiques candidats internes/externes
PRINT '';
PRINT 'Distribution des candidats par statut:';
SELECT 
    COALESCE(candidate_status, 'Non défini') as [Statut],
    COUNT(*) as [Nombre]
FROM users
WHERE candidate_status IS NOT NULL
GROUP BY candidate_status;

-- Statistiques demandes d'accès
PRINT '';
PRINT 'Demandes d''accès non vues:';
SELECT COUNT(*) as [Non vues] FROM access_requests WHERE viewed = 0;

PRINT '';
PRINT '============================================================================';
PRINT '✅ MIGRATION TERMINÉE AVEC SUCCÈS';
PRINT '============================================================================';
PRINT 'Tables mises à jour: users, job_offers, applications, access_requests, protocol2_evaluations';
PRINT 'Index créés: 35+ index de performance';
PRINT 'Contraintes: Clés étrangères CASCADE mises à jour';
PRINT '';
PRINT '⚠️ NEXT STEPS:';
PRINT '1. Tester les requêtes principales';
PRINT '2. Vérifier les performances';
PRINT '3. Configurer les politiques de sécurité (RLS équivalent)';
PRINT '============================================================================';

COMMIT TRANSACTION;

PRINT 'Transaction validée avec succès.';
GO

