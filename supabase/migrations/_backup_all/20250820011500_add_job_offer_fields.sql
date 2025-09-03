-- Ajouter les nouveaux champs à la table job_offers
ALTER TABLE public.job_offers 
ADD COLUMN IF NOT EXISTS categorie_metier text CHECK (categorie_metier IN ('metier_eau', 'metier_electricite', 'metier_clientele', 'metier_support')),
ADD COLUMN IF NOT EXISTS date_limite timestamptz;

-- Note: Les catégories métier seront insérées dans la migration suivante qui crée la table job_categories

-- Créer un index sur la catégorie métier pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_job_offers_categorie_metier ON public.job_offers(categorie_metier);
CREATE INDEX IF NOT EXISTS idx_job_offers_date_limite ON public.job_offers(date_limite);

-- Ajouter un commentaire pour documenter les nouveaux champs
COMMENT ON COLUMN public.job_offers.categorie_metier IS 'Catégorie métier de l''offre d''emploi';
COMMENT ON COLUMN public.job_offers.date_limite IS 'Date limite pour postuler à cette offre';
