-- Script SQL pour vérifier et corriger les dates d'entretien en base
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier les dates d'entretien actuelles
SELECT 
    id,
    interview_date,
    status,
    created_at,
    updated_at
FROM public.applications 
WHERE interview_date IS NOT NULL 
AND status = 'entretien_programme'
ORDER BY updated_at DESC
LIMIT 10;

-- 2. Vérifier le format des dates
SELECT 
    id,
    interview_date,
    EXTRACT(timezone FROM interview_date) as timezone_offset,
    interview_date AT TIME ZONE 'UTC' as utc_time,
    interview_date AT TIME ZONE 'Europe/Paris' as paris_time
FROM public.applications 
WHERE interview_date IS NOT NULL 
LIMIT 5;

-- 3. Test de correction de fuseau horaire
-- Si les dates sont stockées en UTC et qu'il y a un décalage, on peut les corriger
-- ATTENTION: Ne pas exécuter sans vérifier d'abord les résultats ci-dessus

-- Exemple de correction (à adapter selon vos besoins):
-- UPDATE public.applications 
-- SET interview_date = interview_date + INTERVAL '1 hour'
-- WHERE interview_date IS NOT NULL 
-- AND status = 'entretien_programme'
-- AND EXTRACT(timezone FROM interview_date) = 0; -- Seulement si stocké en UTC

-- 4. Vérifier les permissions sur la table applications
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'applications' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;
