-- Corriger les politiques RLS pour protocol1_evaluations
-- Cette migration corrige les erreurs 403 lors de la sauvegarde

-- Vérifier si la table existe avant de la modifier
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'protocol1_evaluations'
    ) THEN
        -- Supprimer les anciennes politiques si elles existent
        DROP POLICY IF EXISTS "Recruteurs peuvent voir toutes les évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent créer des évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent modifier leurs évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent supprimer leurs évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Admins peuvent tout faire sur protocol1_evaluations" ON public.protocol1_evaluations;

        -- Activer RLS sur la table protocol1_evaluations
        ALTER TABLE public.protocol1_evaluations ENABLE ROW LEVEL SECURITY;

        -- Politique pour permettre aux recruteurs d'insérer des évaluations
        CREATE POLICY "Recruteurs peuvent créer des évaluations protocol1" 
        ON public.protocol1_evaluations FOR INSERT 
        TO authenticated 
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('recruteur', 'recruiter', 'admin')
          )
        );

        -- Politique pour permettre aux recruteurs de mettre à jour leurs évaluations
        CREATE POLICY "Recruteurs peuvent modifier leurs évaluations protocol1" 
        ON public.protocol1_evaluations FOR UPDATE 
        TO authenticated 
        USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('recruteur', 'recruiter', 'admin')
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('recruteur', 'recruiter', 'admin')
          )
        );

        -- Index pour améliorer les performances des requêtes RLS
        CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_application_id ON public.protocol1_evaluations(application_id);
        
        RAISE NOTICE 'RLS policies for protocol1_evaluations updated successfully';
    ELSE
        RAISE NOTICE 'Table protocol1_evaluations does not exist, skipping migration';
    END IF;
END $$;