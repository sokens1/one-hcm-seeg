-- Ajoute les champs manquants à la table 'candidate_profiles'
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Ajoute des commentaires pour clarifier l'usage des colonnes
COMMENT ON COLUMN public.candidate_profiles.gender IS 'Sexe du candidat (Homme/Femme).';
COMMENT ON COLUMN public.candidate_profiles.birth_date IS 'Date de naissance du candidat.';
