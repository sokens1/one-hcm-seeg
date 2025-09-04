-- Script pour corriger les dates d'entretien existantes qui ont un décalage
-- ATTENTION: Sauvegardez votre base de données avant d'exécuter ce script !

-- 1. Vérifier les dates problématiques
SELECT 
    id,
    interview_date,
    interview_date AT TIME ZONE 'UTC' as utc_time,
    interview_date AT TIME ZONE 'Europe/Paris' as paris_time,
    status
FROM public.applications 
WHERE interview_date IS NOT NULL 
AND status = 'entretien_programme'
ORDER BY updated_at DESC;

-- 2. Corriger les dates en ajoutant 1 heure (pour compenser le décalage UTC)
-- Cette correction s'applique aux dates qui ont été stockées avec un décalage de fuseau horaire
UPDATE public.applications 
SET 
    interview_date = interview_date + INTERVAL '1 hour',
    updated_at = NOW()
WHERE interview_date IS NOT NULL 
AND status = 'entretien_programme'
AND EXTRACT(timezone FROM interview_date) = 0; -- Seulement les dates UTC

-- 3. Vérifier le résultat de la correction
SELECT 
    id,
    interview_date,
    interview_date AT TIME ZONE 'UTC' as utc_time,
    interview_date AT TIME ZONE 'Europe/Paris' as paris_time,
    status,
    updated_at
FROM public.applications 
WHERE interview_date IS NOT NULL 
AND status = 'entretien_programme'
ORDER BY updated_at DESC;

-- 4. Confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Correction des dates d''entretien terminée';
    RAISE NOTICE '🔄 Rechargez votre application pour voir les changements';
END $$;
