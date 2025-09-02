-- Migration de diagnostic avancée pour application_drafts
-- Date: 2025-01-28

-- 1. Diagnostic complet de la table application_drafts
DO $$ 
DECLARE
    orphaned_users_count INTEGER;
    orphaned_jobs_count INTEGER;
    total_drafts_count INTEGER;
    constraint_exists BOOLEAN;
    rec RECORD;
BEGIN
    -- Compter les brouillons orphelins
    SELECT COUNT(*) INTO orphaned_users_count 
    FROM public.application_drafts 
    WHERE user_id NOT IN (SELECT id FROM public.users);
    
    SELECT COUNT(*) INTO orphaned_jobs_count 
    FROM public.application_drafts 
    WHERE job_offer_id NOT IN (SELECT id FROM public.job_offers);
    
    SELECT COUNT(*) INTO total_drafts_count 
    FROM public.application_drafts;
    
    -- Vérifier si la contrainte existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'application_drafts_user_id_fkey' 
        AND table_name = 'application_drafts'
    ) INTO constraint_exists;
    
    -- Afficher les résultats du diagnostic
    RAISE NOTICE '=== DIAGNOSTIC APPLICATION_DRAFTS ===';
    RAISE NOTICE 'Total brouillons: %', total_drafts_count;
    RAISE NOTICE 'Brouillons avec user_id orphelin: %', orphaned_users_count;
    RAISE NOTICE 'Brouillons avec job_offer_id orphelin: %', orphaned_jobs_count;
    RAISE NOTICE 'Contrainte user_id_fkey existe: %', constraint_exists;
    
    -- Afficher les user_id problématiques
    IF orphaned_users_count > 0 THEN
        RAISE NOTICE 'User IDs orphelins:';
        FOR rec IN 
            SELECT DISTINCT user_id 
            FROM public.application_drafts 
            WHERE user_id NOT IN (SELECT id FROM public.users)
        LOOP
            RAISE NOTICE '  - %', rec.user_id;
        END LOOP;
    END IF;
    
    -- Afficher les job_offer_id problématiques
    IF orphaned_jobs_count > 0 THEN
        RAISE NOTICE 'Job Offer IDs orphelins:';
        FOR rec IN 
            SELECT DISTINCT job_offer_id 
            FROM public.application_drafts 
            WHERE job_offer_id NOT IN (SELECT id FROM public.job_offers)
        LOOP
            RAISE NOTICE '  - %', rec.job_offer_id;
        END LOOP;
    END IF;
    
END $$;

-- 2. Supprimer TOUS les brouillons orphelins (plus agressif)
DELETE FROM public.application_drafts 
WHERE user_id NOT IN (SELECT id FROM public.users);

DELETE FROM public.application_drafts 
WHERE job_offer_id NOT IN (SELECT id FROM public.job_offers);

-- 3. Supprimer et recréer complètement les contraintes
ALTER TABLE public.application_drafts 
DROP CONSTRAINT IF EXISTS application_drafts_user_id_fkey;

ALTER TABLE public.application_drafts 
DROP CONSTRAINT IF EXISTS application_drafts_job_offer_id_fkey;

-- Recréer les contraintes avec validation
ALTER TABLE public.application_drafts 
ADD CONSTRAINT application_drafts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.application_drafts 
ADD CONSTRAINT application_drafts_job_offer_id_fkey 
FOREIGN KEY (job_offer_id) REFERENCES public.job_offers(id) ON DELETE CASCADE;

-- 4. Vérifier que les contraintes sont bien appliquées
DO $$ 
BEGIN
    -- Tester l'insertion d'un enregistrement invalide (doit échouer)
    BEGIN
        INSERT INTO public.application_drafts (user_id, job_offer_id, form_data, ui_state)
        VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', '{}', '{}');
        RAISE NOTICE 'ERREUR: La contrainte ne fonctionne pas - insertion invalide réussie!';
        ROLLBACK;
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'SUCCÈS: La contrainte de clé étrangère fonctionne correctement';
        WHEN OTHERS THEN
            RAISE NOTICE 'AUTRE ERREUR: %', SQLERRM;
    END;
END $$;

-- 5. Ajouter des triggers pour prévenir les futures violations
CREATE OR REPLACE FUNCTION validate_application_draft_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.user_id) THEN
        RAISE EXCEPTION 'User ID % does not exist in users table', NEW.user_id;
    END IF;
    
    -- Vérifier que l'offre d'emploi existe
    IF NOT EXISTS (SELECT 1 FROM public.job_offers WHERE id = NEW.job_offer_id) THEN
        RAISE EXCEPTION 'Job Offer ID % does not exist in job_offers table', NEW.job_offer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS validate_application_draft_trigger ON public.application_drafts;

-- Créer le trigger
CREATE TRIGGER validate_application_draft_trigger
    BEFORE INSERT OR UPDATE ON public.application_drafts
    FOR EACH ROW
    EXECUTE FUNCTION validate_application_draft_user();

-- 6. Commentaire final
COMMENT ON FUNCTION validate_application_draft_user() IS 'Fonction de validation pour s''assurer que les clés étrangères existent avant insertion/update';

