-- Ajout de colonnes liées à la fiche de poste détaillée
-- Champs inspirés de la fiche : ligne hiérarchique, catégorie (niveau), salaire, date d'embauche,
-- missions principales, connaissances/savoir/requis

ALTER TABLE public.job_offers
  ADD COLUMN IF NOT EXISTS reporting_line text,
  ADD COLUMN IF NOT EXISTS job_grade text CHECK (job_grade IN (
    'Cadre de Direction', 'Cadre', 'Manager', 'Agent de maîtrise', 'Employé'
  )),
  ADD COLUMN IF NOT EXISTS salary_note text,
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS responsibilities text[],
  ADD COLUMN IF NOT EXISTS requirements text[];

COMMENT ON COLUMN public.job_offers.reporting_line IS 'Ligne hiérarchique directe (manager ou département)';
COMMENT ON COLUMN public.job_offers.job_grade IS 'Catégorie / niveau du poste (ex: Cadre de Direction)';
COMMENT ON COLUMN public.job_offers.salary_note IS 'Note libre sur la rémunération (ex: grille salariale, avantages)';
COMMENT ON COLUMN public.job_offers.start_date IS 'Date d''embauche souhaitée';
COMMENT ON COLUMN public.job_offers.responsibilities IS 'Missions principales (liste)';
COMMENT ON COLUMN public.job_offers.requirements IS 'Connaissances et requis (liste)';
