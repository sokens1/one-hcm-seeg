-- CORRECTION DÉFINITIVE DU PROBLÈME ID POUR protocol2_evaluations
-- Ce script force la correction de la colonne id avec génération automatique d'UUID

-- 1. Vérifier l'état actuel de la colonne id
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'id'
AND table_schema = 'public';

-- 2. Supprimer la contrainte NOT NULL temporairement
ALTER TABLE public.protocol2_evaluations 
ALTER COLUMN id DROP NOT NULL;

-- 3. Modifier le type de la colonne id pour être sûr qu'elle est en UUID
ALTER TABLE public.protocol2_evaluations 
ALTER COLUMN id TYPE UUID USING 
    CASE 
        WHEN id IS NULL THEN gen_random_uuid()
        WHEN id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN id::UUID
        ELSE gen_random_uuid()
    END;

-- 4. Définir la valeur par défaut
ALTER TABLE public.protocol2_evaluations 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 5. Remettre la contrainte NOT NULL
ALTER TABLE public.protocol2_evaluations 
ALTER COLUMN id SET NOT NULL;

-- 6. Vérifier que la colonne id a bien une valeur par défaut
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'id'
AND table_schema = 'public';

-- 7. Tester l'insertion avec un application_id réel
-- D'abord, trouver un application_id existant
SELECT id as real_application_id 
FROM public.applications 
LIMIT 1;

-- 8. Tester l'insertion (décommentez si vous voulez tester)
-- INSERT INTO public.protocol2_evaluations (
--     application_id,
--     evaluator_id,
--     details
-- ) VALUES (
--     (SELECT id FROM public.applications LIMIT 1),
--     'test-evaluator-id',
--     '{"test": "data"}'::jsonb
-- );

-- 9. Vérifier l'état final de la table
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol2_evaluations';

-- 10. Vérifier que la colonne id génère bien des UUID
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_default LIKE '%gen_random_uuid%' THEN '✅ UUID généré automatiquement'
        WHEN column_default LIKE '%uuid_generate%' THEN '✅ UUID généré automatiquement'
        ELSE '❌ Pas de génération automatique'
    END as status
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'id'
AND table_schema = 'public';
