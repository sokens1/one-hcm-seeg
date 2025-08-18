-- Configuration de la base de données SEEG (Correction)

-- 1. Table des utilisateurs (candidats et recruteurs)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  matricule TEXT UNIQUE, -- Pour les employés SEEG existants
  role TEXT NOT NULL CHECK (role IN ('candidat', 'recruteur', 'admin')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Table des profils candidats détaillés
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  current_position TEXT,
  current_department TEXT,
  years_experience INTEGER,
  education TEXT,
  availability TEXT,
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,
  skills TEXT[], -- Array de compétences
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Table des offres d'emploi
CREATE TABLE public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('CDI', 'CDD', 'Stage', 'Freelance')),
  department TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  requirements TEXT[],
  benefits TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'draft')),
  application_deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Table des candidatures
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  job_offer_id UUID REFERENCES public.job_offers(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT DEFAULT 'candidature' CHECK (status IN ('candidature', 'incubation', 'embauche', 'refuse')),
  motivation TEXT,
  availability_start DATE,
  candidate_references TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(candidate_id, job_offer_id)
);

-- 5. Table des documents joints aux candidatures
CREATE TABLE public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('cv', 'cover_letter', 'diploma', 'certificate', 'recommendation')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Table des évaluations Protocol 1
CREATE TABLE public.protocol1_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  documents_verified BOOLEAN DEFAULT false,
  adherence_metier BOOLEAN DEFAULT false,
  adherence_talent BOOLEAN DEFAULT false,
  adherence_paradigme BOOLEAN DEFAULT false,
  metier_notes TEXT,
  talent_notes TEXT,
  paradigme_notes TEXT,
  overall_score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(application_id)
);

-- 7. Table des évaluations Protocol 2
CREATE TABLE public.protocol2_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  physical_visit BOOLEAN DEFAULT false,
  interview_completed BOOLEAN DEFAULT false,
  qcm_role_completed BOOLEAN DEFAULT false,
  qcm_codir_completed BOOLEAN DEFAULT false,
  job_sheet_created BOOLEAN DEFAULT false,
  skills_gap_assessed BOOLEAN DEFAULT false,
  interview_notes TEXT,
  visit_notes TEXT,
  qcm_role_score INTEGER,
  qcm_codir_score INTEGER,
  skills_gap_notes TEXT,
  overall_score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(application_id)
);

-- 8. Table de l'historique des candidatures
CREATE TABLE public.application_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES public.users(id),
  notes TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Table des notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  related_application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol1_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol2_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;