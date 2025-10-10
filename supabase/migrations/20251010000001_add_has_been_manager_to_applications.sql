-- Migration pour ajouter le champ "has_been_manager" à la table applications
-- Ce champ est utilisé pour les candidatures aux offres internes uniquement
-- Il indique si le candidat a déjà eu un poste de chef/manager

ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS has_been_manager BOOLEAN DEFAULT NULL;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.applications.has_been_manager IS 'Indique si le candidat a déjà été chef/manager dans un poste quelconque (pour offres internes uniquement)';

