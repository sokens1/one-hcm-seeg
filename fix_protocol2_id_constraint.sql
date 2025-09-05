-- CORRECTION DU PROBLÈME DE CONTRAINTE ID POUR protocol2_evaluations
-- Ce script corrige la colonne id pour qu'elle génère automatiquement des UUID

-- 1. Vérifier la structure actuelle de la colonne id
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'id'
AND table_schema = 'public';

-- 2. Modifier la colonne id pour qu'elle génère automatiquement des UUID
ALTER TABLE public.protocol2_evaluations 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Vérifier que la fonction gen_random_uuid() existe, sinon la créer
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4. Alternative: utiliser uuid_generate_v4() si gen_random_uuid() ne fonctionne pas
-- ALTER TABLE public.protocol2_evaluations 
-- ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 5. Vérifier la structure finale de la colonne id
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'id'
AND table_schema = 'public';

-- 6. Trouver un application_id réel existant pour le test
SELECT id as real_application_id 
FROM public.applications 
LIMIT 1;

-- 7. Tester l'insertion avec un application_id réel (remplacez par un ID réel)
-- INSERT INTO public.protocol2_evaluations (
--     application_id,
--     evaluator_id,
--     details
-- ) VALUES (
--     (SELECT id FROM public.applications LIMIT 1),
--     'test-evaluator-id',
--     '{"test": "data"}'::jsonb
-- );

-- 8. Vérifier que la colonne id a bien une valeur par défaut
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'protocol2_evaluations' 
AND column_name = 'id'
AND table_schema = 'public';

-- 9. Vérifier l'état final de la table
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'protocol2_evaluations';
