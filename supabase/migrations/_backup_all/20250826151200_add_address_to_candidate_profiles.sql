-- Ajoute la colonne 'address' à la table 'candidate_profiles'
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS address TEXT;

-- Ajoute un commentaire pour clarifier l'usage de la colonne
COMMENT ON COLUMN public.candidate_profiles.address IS 'Adresse complète du candidat.';
