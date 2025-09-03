-- Assurer la précision des scores globaux (2 décimales) pour Protocol 1
-- Convertit overall_score d'INTEGER vers NUMERIC(5,2)

-- Vérifier si la table protocol1_evaluations existe avant de la modifier
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'protocol1_evaluations'
    ) THEN
        -- Modifier les colonnes de scores pour protocol1_evaluations
        ALTER TABLE public.protocol1_evaluations
          ALTER COLUMN overall_score TYPE NUMERIC(5,2)
          USING overall_score::numeric;

        ALTER TABLE public.protocol1_evaluations
          ALTER COLUMN total_score TYPE NUMERIC(5,2)
          USING COALESCE(total_score, 0)::numeric;

        -- Optionnel: s'assurer que les valeurs existantes respectent le format
        UPDATE public.protocol1_evaluations
        SET overall_score = ROUND(overall_score::numeric, 2),
            total_score = ROUND(COALESCE(total_score, 0)::numeric, 2)
        WHERE TRUE;

        COMMENT ON COLUMN public.protocol1_evaluations.overall_score IS 'Score global en pourcentage avec deux décimales';
        COMMENT ON COLUMN public.protocol1_evaluations.total_score IS 'Score global exact en pourcentage, deux décimales';
        
        RAISE NOTICE 'Protocol1_evaluations score precision updated successfully';
    ELSE
        RAISE NOTICE 'Table protocol1_evaluations does not exist, skipping migration';
    END IF;
END $$;



