-- ============================================================================
-- FONCTIONS ET PROCÉDURES STOCKÉES POUR AZURE SQL
-- Source: Supabase → Azure
-- ============================================================================
-- Ces fonctions sont nécessaires pour la logique métier
-- Adapter selon les capacités d'Azure SQL Server
-- ============================================================================

-- ============================================================================
-- FONCTION 1: Validation Statut Interne/Externe (Applications)
-- ============================================================================
-- ⚠️ À adapter selon Azure SQL (Triggers différents de PostgreSQL)

CREATE OR ALTER TRIGGER trg_validate_candidature_status
ON applications
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @candidate_status NVARCHAR(50);
    DECLARE @offer_status NVARCHAR(50);
    DECLARE @candidature_status NVARCHAR(50);
    DECLARE @candidate_id UNIQUEIDENTIFIER;
    DECLARE @job_offer_id UNIQUEIDENTIFIER;
    
    -- Pour chaque ligne insérée
    DECLARE cur CURSOR FOR SELECT candidate_id, job_offer_id, candidature_status FROM inserted;
    OPEN cur;
    
    FETCH NEXT FROM cur INTO @candidate_id, @job_offer_id, @candidature_status;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Récupérer le statut du candidat
        SELECT @candidate_status = candidate_status 
        FROM users 
        WHERE id = @candidate_id;
        
        -- Récupérer le statut de l'offre
        SELECT @offer_status = status_offers 
        FROM job_offers 
        WHERE id = @job_offer_id;
        
        -- Définir candidature_status par défaut si NULL
        IF @candidature_status IS NULL
        BEGIN
            SET @candidature_status = COALESCE(@candidate_status, @offer_status);
        END
        
        -- Validation: Vérifier cohérence candidat
        IF @candidate_status IS NOT NULL AND @candidature_status <> @candidate_status
        BEGIN
            RAISERROR('Candidature non autorisée: votre statut candidat ne correspond pas à cette candidature (interne/externe).', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Validation: Vérifier cohérence offre
        IF @offer_status IS NOT NULL AND @candidature_status <> @offer_status
        BEGIN
            RAISERROR('Candidature non autorisée: cette offre n''est pas ouverte à votre type de candidature (interne/externe).', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Insérer la ligne validée
        INSERT INTO applications (
            candidate_id, 
            job_offer_id, 
            candidature_status
            -- Ajouter toutes les autres colonnes ici
        )
        SELECT 
            candidate_id, 
            job_offer_id, 
            @candidature_status
            -- Ajouter toutes les autres colonnes correspondantes
        FROM inserted
        WHERE candidate_id = @candidate_id AND job_offer_id = @job_offer_id;
        
        FETCH NEXT FROM cur INTO @candidate_id, @job_offer_id, @candidature_status;
    END
    
    CLOSE cur;
    DEALLOCATE cur;
END
GO

-- ============================================================================
-- FONCTION 2: Reset 'viewed' sur nouvelles demandes d'accès
-- ============================================================================

CREATE OR ALTER TRIGGER trg_reset_viewed_on_new_request
ON access_requests
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- S'assurer que toutes les nouvelles demandes sont marquées comme non vues
    UPDATE access_requests
    SET viewed = 0
    WHERE id IN (SELECT id FROM inserted);
END
GO

-- ============================================================================
-- PROCÉDURE 1: Marquer une demande d'accès comme vue
-- ============================================================================

CREATE OR ALTER PROCEDURE sp_mark_access_request_as_viewed
    @request_id UNIQUEIDENTIFIER,
    @user_id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Vérifier que l'utilisateur est autorisé (admin/recruteur)
    DECLARE @user_role NVARCHAR(50);
    SELECT @user_role = role FROM users WHERE id = @user_id;
    
    IF @user_role NOT IN ('admin', 'recruteur', 'observateur')
    BEGIN
        RAISERROR('Non autorisé: seuls les admins et recruteurs peuvent marquer les demandes comme vues.', 16, 1);
        RETURN;
    END
    
    -- Marquer la demande comme vue
    UPDATE access_requests
    SET viewed = 1
    WHERE id = @request_id;
    
    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('Demande d''accès introuvable.', 16, 1);
        RETURN;
    END
    
    SELECT 'Success' AS Result;
END
GO

-- ============================================================================
-- PROCÉDURE 2: Marquer toutes les demandes comme vues
-- ============================================================================

CREATE OR ALTER PROCEDURE sp_mark_all_access_requests_as_viewed
    @user_id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Vérifier que l'utilisateur est autorisé
    DECLARE @user_role NVARCHAR(50);
    SELECT @user_role = role FROM users WHERE id = @user_id;
    
    IF @user_role NOT IN ('admin', 'recruteur', 'observateur')
    BEGIN
        RAISERROR('Non autorisé.', 16, 1);
        RETURN;
    END
    
    -- Marquer toutes les demandes en attente comme vues
    UPDATE access_requests
    SET viewed = 1
    WHERE status = 'pending' AND viewed = 0;
    
    SELECT @@ROWCOUNT AS [Rows Updated], 'Success' AS Result;
END
GO

-- ============================================================================
-- PROCÉDURE 3: Rejeter une demande d'accès avec motif
-- ============================================================================

CREATE OR ALTER PROCEDURE sp_reject_access_request
    @request_id UNIQUEIDENTIFIER,
    @rejection_reason NVARCHAR(MAX) = NULL,
    @reviewer_id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Vérifier que l'utilisateur est autorisé
        DECLARE @reviewer_role NVARCHAR(50);
        SELECT @reviewer_role = role FROM users WHERE id = @reviewer_id;
        
        IF @reviewer_role NOT IN ('admin', 'recruteur')
        BEGIN
            RAISERROR('Non autorisé: seuls les admins et recruteurs peuvent rejeter des demandes.', 16, 1);
            RETURN;
        END
        
        -- Récupérer l'user_id de la demande
        DECLARE @user_id_to_block UNIQUEIDENTIFIER;
        SELECT @user_id_to_block = user_id
        FROM access_requests
        WHERE id = @request_id;
        
        IF @user_id_to_block IS NULL
        BEGIN
            RAISERROR('Demande non trouvée.', 16, 1);
            RETURN;
        END
        
        -- Mettre à jour le statut de l'utilisateur à 'bloqué'
        UPDATE users
        SET statut = 'bloqué', 
            updated_at = GETDATE()
        WHERE id = @user_id_to_block;
        
        -- Mettre à jour le statut de la demande avec le motif
        UPDATE access_requests
        SET 
            status = 'rejected',
            rejection_reason = @rejection_reason,
            reviewed_at = GETDATE(),
            reviewed_by = CAST(@reviewer_id AS NVARCHAR(50))
        WHERE id = @request_id;
        
        COMMIT TRANSACTION;
        SELECT 'Success' AS Result;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- ============================================================================
-- PROCÉDURE 4: Approuver une demande d'accès
-- ============================================================================

CREATE OR ALTER PROCEDURE sp_approve_access_request
    @request_id UNIQUEIDENTIFIER,
    @reviewer_id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Vérifier que l'utilisateur est autorisé
        DECLARE @reviewer_role NVARCHAR(50);
        SELECT @reviewer_role = role FROM users WHERE id = @reviewer_id;
        
        IF @reviewer_role NOT IN ('admin', 'recruteur')
        BEGIN
            RAISERROR('Non autorisé.', 16, 1);
            RETURN;
        END
        
        -- Récupérer l'user_id de la demande
        DECLARE @user_id_to_approve UNIQUEIDENTIFIER;
        SELECT @user_id_to_approve = user_id
        FROM access_requests
        WHERE id = @request_id;
        
        IF @user_id_to_approve IS NULL
        BEGIN
            RAISERROR('Demande non trouvée.', 16, 1);
            RETURN;
        END
        
        -- Mettre à jour le statut de l'utilisateur à 'actif'
        UPDATE users
        SET statut = 'actif', 
            updated_at = GETDATE()
        WHERE id = @user_id_to_approve;
        
        -- Mettre à jour le statut de la demande
        UPDATE access_requests
        SET 
            status = 'approved',
            reviewed_at = GETDATE(),
            reviewed_by = CAST(@reviewer_id AS NVARCHAR(50))
        WHERE id = @request_id;
        
        COMMIT TRANSACTION;
        SELECT 'Success' AS Result;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- ============================================================================
-- FONCTION UTILITAIRE: Obtenir les statistiques par campagne
-- ============================================================================

CREATE OR ALTER FUNCTION fn_get_campaign_statistics()
RETURNS TABLE
AS
RETURN
(
    SELECT 
        jo.campaign_id,
        COUNT(DISTINCT jo.id) as total_offers,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'rejected' THEN a.id END) as rejected_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_applications
    FROM job_offers jo
    LEFT JOIN applications a ON jo.id = a.job_offer_id
    WHERE jo.campaign_id IS NOT NULL
    GROUP BY jo.campaign_id
)
GO

-- ============================================================================
-- EXEMPLES D'UTILISATION
-- ============================================================================

/*
-- Marquer une demande comme vue
EXEC sp_mark_access_request_as_viewed 
    @request_id = 'GUID-HERE',
    @user_id = 'USER-GUID-HERE';

-- Marquer toutes les demandes comme vues
EXEC sp_mark_all_access_requests_as_viewed 
    @user_id = 'USER-GUID-HERE';

-- Rejeter une demande avec motif
EXEC sp_reject_access_request 
    @request_id = 'GUID-HERE',
    @rejection_reason = 'Profil ne correspond pas aux critères',
    @reviewer_id = 'REVIEWER-GUID-HERE';

-- Approuver une demande
EXEC sp_approve_access_request 
    @request_id = 'GUID-HERE',
    @reviewer_id = 'REVIEWER-GUID-HERE';

-- Statistiques par campagne
SELECT * FROM fn_get_campaign_statistics();
*/

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================
/*
⚠️ DIFFÉRENCES POSTGRESQL vs SQL SERVER:

1. SECURITY DEFINER (PostgreSQL) → EXECUTE AS OWNER (SQL Server)
2. auth.uid() (Supabase) → Remplacer par votre système d'authentification
3. Les UUID sont de type UNIQUEIDENTIFIER dans SQL Server
4. Les triggers BEFORE INSERT n'existent pas en SQL Server (utiliser INSTEAD OF)
5. RAISE EXCEPTION → RAISERROR ou THROW
6. BOOLEAN → BIT (0/1)
7. TEXT → NVARCHAR(MAX)

⚠️ SÉCURITÉ:
- Dans Supabase, l'authentification est gérée par auth.uid()
- Dans Azure, vous devez implémenter votre propre système d'authentification
- Adaptez les procédures pour utiliser votre mécanisme d'auth (JWT, sessions, etc.)

⚠️ RLS (Row Level Security):
- PostgreSQL utilise des politiques RLS intégrées
- SQL Server nécessite une approche différente (vues, prédicats de sécurité)
- Considérez l'utilisation de Row-Level Security dans Azure SQL Database
*/

