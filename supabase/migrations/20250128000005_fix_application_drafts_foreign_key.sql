-- Migration pour diagnostiquer et corriger les problèmes de clé étrangère dans application_drafts
-- Date: 2025-01-28

-- 1. D'abord, vérifions les données orphelines dans application_drafts
-- (Cette requête sera exécutée pour diagnostic)

-- 2. Supprimer les brouillons orphelins (user_id qui n'existent pas dans users)
DELETE FROM public.application_drafts 
WHERE user_id NOT IN (SELECT id FROM public.users);

-- 3. Supprimer les brouillons orphelins (job_offer_id qui n'existent pas dans job_offers)
DELETE FROM public.application_drafts 
WHERE job_offer_id NOT IN (SELECT id FROM public.job_offers);

-- 4. Ajouter une contrainte de vérification pour éviter les futures violations
-- Vérifier que la contrainte de clé étrangère existe et fonctionne correctement
DO $$ 
BEGIN
    -- Vérifier si la contrainte existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'application_drafts_user_id_fkey' 
        AND table_name = 'application_drafts'
    ) THEN
        -- Recréer la contrainte si elle n'existe pas
        ALTER TABLE public.application_drafts 
        ADD CONSTRAINT application_drafts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Vérifier si la contrainte job_offer_id existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'application_drafts_job_offer_id_fkey' 
        AND table_name = 'application_drafts'
    ) THEN
        -- Recréer la contrainte si elle n'existe pas
        ALTER TABLE public.application_drafts 
        ADD CONSTRAINT application_drafts_job_offer_id_fkey 
        FOREIGN KEY (job_offer_id) REFERENCES public.job_offers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_application_drafts_user_id ON public.application_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_application_drafts_job_offer_id ON public.application_drafts(job_offer_id);

-- 6. Commentaires pour documentation
COMMENT ON TABLE public.application_drafts IS 'Table pour stocker les brouillons de candidatures avec synchronisation cross-device';
COMMENT ON COLUMN public.application_drafts.user_id IS 'Référence vers l''utilisateur candidat (doit exister dans users)';
COMMENT ON COLUMN public.application_drafts.job_offer_id IS 'Référence vers l''offre d''emploi (doit exister dans job_offers)';
COMMENT ON COLUMN public.application_drafts.form_data IS 'Données du formulaire de candidature en JSON';
COMMENT ON COLUMN public.application_drafts.ui_state IS 'État de l''interface utilisateur (étape, onglet actif)';

