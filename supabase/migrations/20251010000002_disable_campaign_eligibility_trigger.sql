-- Migration pour désactiver la restriction de date de campagne
-- Permet à tous les utilisateurs de postuler sans restriction de date

-- 1. Supprimer le trigger de vérification d'éligibilité
DROP TRIGGER IF EXISTS check_campaign_eligibility_trigger ON public.applications;

-- 2. Supprimer la fonction de vérification (optionnel, on la garde au cas où)
-- DROP FUNCTION IF EXISTS public.check_campaign_eligibility();

-- Commentaire: La fonction check_campaign_eligibility() est conservée mais le trigger est désactivé
-- pour permettre à tous les utilisateurs de postuler sans restriction de date de création de compte.

