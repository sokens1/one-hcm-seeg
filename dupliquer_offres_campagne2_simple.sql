-- DUPLICATION RAPIDE DES 3 OFFRES VERS LA CAMPAGNE 2
-- Date d'embauche : 01/02/2026
-- Date limite : 21/10/2025

INSERT INTO public.job_offers (
    recruiter_id, title, description, location, contract_type, department, profile,
    salary_min, salary_max, requirements, benefits, status, application_deadline,
    categorie_metier, date_limite, reporting_line, job_grade, salary_note,
    start_date, status_offerts, responsibilities, mtp_questions_metier,
    mtp_questions_talent, mtp_questions_paradigme, campaign_id, created_at, updated_at
)
SELECT 
    recruiter_id, title, description, location, contract_type, department, profile,
    salary_min, salary_max, requirements, benefits, 'active',
    '2025-10-21'::date,
    categorie_metier,
    '2025-10-21 23:59:59+00'::timestamptz,
    reporting_line, job_grade, salary_note,
    '2026-02-01'::date,
    status_offerts, responsibilities, mtp_questions_metier,
    mtp_questions_talent, mtp_questions_paradigme,
    2, now(), now()
FROM public.job_offers
WHERE campaign_id = 1
  AND title IN (
      'Directeur des Systèmes d''Information',
      'Directeur Audit & Contrôle interne',
      'Directeur Juridique, Communication & RSE'
  );

