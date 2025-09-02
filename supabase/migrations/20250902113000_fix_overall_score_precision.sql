-- Assurer la précision des scores globaux (2 décimales) pour Protocol 1 et 2
-- Convertit overall_score d'INTEGER vers NUMERIC(5,2)

ALTER TABLE public.protocol1_evaluations
  ALTER COLUMN overall_score TYPE NUMERIC(5,2)
  USING overall_score::numeric;

ALTER TABLE public.protocol1_evaluations
  ALTER COLUMN total_score TYPE NUMERIC(5,2)
  USING COALESCE(total_score, 0)::numeric;

ALTER TABLE public.protocol2_evaluations
  ALTER COLUMN overall_score TYPE NUMERIC(5,2)
  USING overall_score::numeric;

-- Optionnel: s'assurer que les valeurs existantes respectent le format
UPDATE public.protocol1_evaluations
SET overall_score = ROUND(overall_score::numeric, 2),
    total_score = ROUND(COALESCE(total_score, 0)::numeric, 2)
WHERE TRUE;

UPDATE public.protocol2_evaluations
SET overall_score = ROUND(overall_score::numeric, 2)
WHERE TRUE;

COMMENT ON COLUMN public.protocol1_evaluations.overall_score IS 'Score global en pourcentage avec deux décimales';
COMMENT ON COLUMN public.protocol1_evaluations.total_score IS 'Score global exact en pourcentage, deux décimales';
COMMENT ON COLUMN public.protocol2_evaluations.overall_score IS 'Score global en pourcentage avec deux décimales (pondéré 50/20/30)';


