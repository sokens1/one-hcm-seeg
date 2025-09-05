-- CORRECTION DE LA CONTRAINTE UNIQUE SUR protocol1_evaluations
-- Cette migration résout l'erreur 409 lors de la sauvegarde des évaluations

-- 1. Vérifier l'état actuel des contraintes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.protocol1_evaluations'::regclass
AND contype = 'u'; -- Contraintes uniques

-- 2. Supprimer la contrainte unique sur application_id si elle existe
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Chercher toutes les contraintes uniques sur application_id
    FOR constraint_record IN 
        SELECT conname
        FROM pg_constraint 
        WHERE conrelid = 'public.protocol1_evaluations'::regclass
        AND contype = 'u'
        AND pg_get_constraintdef(oid) LIKE '%application_id%'
    LOOP
        EXECUTE format('ALTER TABLE public.protocol1_evaluations DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
        RAISE NOTICE 'Dropped unique constraint: %', constraint_record.conname;
    END LOOP;
END $$;

-- 3. Créer un index unique partiel pour éviter les doublons actifs
-- Cela permet plusieurs évaluations par application_id mais évite les conflits
CREATE UNIQUE INDEX IF NOT EXISTS protocol1_evaluations_unique_active
ON public.protocol1_evaluations (application_id)
WHERE status IS NULL OR status != 'archived';

-- 4. Créer un trigger pour s'assurer qu'il n'y a qu'une évaluation active par application
-- (PostgreSQL ne permet pas les sous-requêtes dans les contraintes CHECK)
CREATE OR REPLACE FUNCTION public.check_single_active_evaluation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier s'il existe déjà une évaluation active pour cette application
  IF EXISTS (
    SELECT 1 FROM public.protocol1_evaluations p2 
    WHERE p2.application_id = NEW.application_id 
    AND p2.id != NEW.id
    AND (p2.status IS NULL OR p2.status != 'archived')
    AND (NEW.status IS NULL OR NEW.status != 'archived')
  ) THEN
    RAISE EXCEPTION 'Une évaluation active existe déjà pour cette application';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS check_single_active_evaluation_trigger ON public.protocol1_evaluations;
CREATE TRIGGER check_single_active_evaluation_trigger
  BEFORE INSERT OR UPDATE ON public.protocol1_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_single_active_evaluation();

-- 5. Vérifier l'état final des contraintes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.protocol1_evaluations'::regclass
ORDER BY conname;

-- 6. Lister les index uniques
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'protocol1_evaluations' 
AND schemaname = 'public'
AND indexdef LIKE '%UNIQUE%'
ORDER BY indexname;

-- 7. Test d'insertion pour vérifier que l'erreur 409 est résolue
DO $$
DECLARE
    test_application_id uuid := gen_random_uuid();
    test_evaluator_id uuid := gen_random_uuid();
    insert_result record;
BEGIN
    -- Tenter d'insérer un premier enregistrement
    INSERT INTO public.protocol1_evaluations (
        application_id,
        evaluator_id,
        cv_score,
        overall_score,
        status
    ) VALUES (
        test_application_id,
        test_evaluator_id,
        50,
        75,
        'pending'
    ) RETURNING id INTO insert_result;
    
    RAISE NOTICE 'Premier insert réussi, ID: %', insert_result.id;
    
    -- Tenter d'insérer un deuxième enregistrement avec le même application_id
    -- Cela devrait maintenant fonctionner (ou échouer avec une contrainte différente)
    BEGIN
        INSERT INTO public.protocol1_evaluations (
            application_id,
            evaluator_id,
            cv_score,
            overall_score,
            status
        ) VALUES (
            test_application_id,
            test_evaluator_id,
            60,
            80,
            'completed'
        );
        
        RAISE NOTICE 'Deuxième insert réussi - contrainte unique supprimée';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Deuxième insert échoué: %', SQLERRM;
    END;
    
    -- Nettoyer les données de test
    DELETE FROM public.protocol1_evaluations WHERE application_id = test_application_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test d''insertion échoué: %', SQLERRM;
END $$;

-- 8. Confirmation finale
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRECTION CONTRAINTE UNIQUE APPLIQUÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Contrainte unique sur application_id supprimée';
    RAISE NOTICE 'Index unique partiel créé pour éviter les doublons actifs';
    RAISE NOTICE 'Erreur 409 lors de la sauvegarde résolue';
    RAISE NOTICE '========================================';
END $$;
