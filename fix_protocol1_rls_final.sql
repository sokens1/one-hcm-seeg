-- Correction RLS pour protocol1_evaluations - Version optimisée
-- À exécuter directement dans l'interface SQL de Supabase

-- Étape 1: Vérifier si la table existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'protocol1_evaluations') THEN
        
        -- Étape 2: Désactiver temporairement RLS
        ALTER TABLE public.protocol1_evaluations DISABLE ROW LEVEL SECURITY;
        
        -- Étape 3: Supprimer toutes les politiques existantes
        DROP POLICY IF EXISTS "Recruteurs peuvent voir toutes les évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent créer des évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent modifier leurs évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Recruteurs peuvent supprimer leurs évaluations protocol1" ON public.protocol1_evaluations;
        DROP POLICY IF EXISTS "Admins peuvent tout faire sur protocol1_evaluations" ON public.protocol1_evaluations;
        
        -- Étape 4: Réactiver RLS
        ALTER TABLE public.protocol1_evaluations ENABLE ROW LEVEL SECURITY;
        
        -- Étape 5: Créer une politique simple et efficace
        CREATE POLICY "Allow recruiters to manage protocol1 evaluations" 
        ON public.protocol1_evaluations FOR ALL 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE id = auth.uid() 
                AND role IN ('recruteur', 'recruiter', 'admin')
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE id = auth.uid() 
                AND role IN ('recruteur', 'recruiter', 'admin')
            )
        );
        
        -- Étape 6: Créer un index pour améliorer les performances
        CREATE INDEX IF NOT EXISTS idx_protocol1_evaluations_app_id ON public.protocol1_evaluations(application_id);
        
        RAISE NOTICE 'RLS policies for protocol1_evaluations have been successfully updated';
    ELSE
        RAISE NOTICE 'Table protocol1_evaluations does not exist';
    END IF;
END $$;
