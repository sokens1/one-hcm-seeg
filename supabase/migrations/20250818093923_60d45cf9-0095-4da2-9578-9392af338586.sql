-- Configuration de la base de données SEEG

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
  ref_contacts TEXT, -- Renommé de "references" qui est un mot réservé
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

-- RLS Policies pour users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies pour candidate_profiles
CREATE POLICY "Candidates can view their own profile" ON public.candidate_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Candidates can update their own profile" ON public.candidate_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Candidates can insert their own profile" ON public.candidate_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Recruiters can view candidate profiles" ON public.candidate_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
    )
  );

-- RLS Policies pour job_offers
CREATE POLICY "Everyone can view active job offers" ON public.job_offers
  FOR SELECT USING (status = 'active');

CREATE POLICY "Recruiters can manage their job offers" ON public.job_offers
  FOR ALL USING (
    recruiter_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Recruiters can create job offers" ON public.job_offers
  FOR INSERT WITH CHECK (
    recruiter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
    )
  );

-- RLS Policies pour applications
CREATE POLICY "Candidates can view their own applications" ON public.applications
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can create applications" ON public.applications
  FOR INSERT WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Candidates can update their own applications" ON public.applications
  FOR UPDATE USING (candidate_id = auth.uid());

CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.job_offers jo
      JOIN public.users u ON u.id = auth.uid()
      WHERE jo.id = job_offer_id 
      AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

CREATE POLICY "Recruiters can update applications for their jobs" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.job_offers jo
      JOIN public.users u ON u.id = auth.uid()
      WHERE jo.id = job_offer_id 
      AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

-- RLS Policies pour application_documents
CREATE POLICY "Candidates can manage their application documents" ON public.application_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id AND a.candidate_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can view documents for applications to their jobs" ON public.application_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.job_offers jo ON jo.id = a.job_offer_id
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.id = application_id 
      AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

-- RLS Policies pour protocol1_evaluations
CREATE POLICY "Recruiters can manage protocol1 evaluations" ON public.protocol1_evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.job_offers jo ON jo.id = a.job_offer_id
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.id = application_id 
      AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

-- RLS Policies pour protocol2_evaluations
CREATE POLICY "Recruiters can manage protocol2 evaluations" ON public.protocol2_evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.job_offers jo ON jo.id = a.job_offer_id
      JOIN public.users u ON u.id = auth.uid()
      WHERE a.id = application_id 
      AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
    )
  );

-- RLS Policies pour application_history
CREATE POLICY "Users can view history for their applications" ON public.application_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = application_id 
      AND (a.candidate_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM public.job_offers jo
             JOIN public.users u ON u.id = auth.uid()
             WHERE jo.id = a.job_offer_id 
             AND (jo.recruiter_id = auth.uid() OR u.role = 'admin')
           ))
    )
  );

-- RLS Policies pour notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON public.candidate_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_offers_updated_at BEFORE UPDATE ON public.job_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_protocol1_evaluations_updated_at BEFORE UPDATE ON public.protocol1_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_protocol2_evaluations_updated_at BEFORE UPDATE ON public.protocol2_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour l'historique des candidatures
CREATE OR REPLACE FUNCTION track_application_status_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.application_history (application_id, previous_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER track_application_status_changes_trigger
    AFTER UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION track_application_status_changes();

-- Données de test
INSERT INTO public.users (id, email, role, first_name, last_name, phone) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@seeg.ga', 'admin', 'Admin', 'SEEG', '+241 01 23 45 67'),
('550e8400-e29b-41d4-a716-446655440001', 'recruteur@seeg.ga', 'recruteur', 'Marie', 'Recruteuse', '+241 01 23 45 68'),
('550e8400-e29b-41d4-a716-446655440002', 'jean.dupont@email.com', 'candidat', 'Jean', 'Dupont', '+241 01 23 45 69');

INSERT INTO public.job_offers (id, recruiter_id, title, description, location, contract_type, department, salary_min, salary_max) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Directeur des Ressources Humaines', 'La SEEG recherche un Directeur RH expérimenté pour piloter la stratégie des ressources humaines et accompagner le développement de nos équipes.', 'Libreville', 'CDI', 'Ressources Humaines', 2000000, 3000000),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Directeur des Systèmes d''Information', 'Poste de Directeur SI pour superviser l''évolution technologique et la transformation digitale de la SEEG.', 'Libreville', 'CDI', 'IT', 2500000, 3500000),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Directeur Financier', 'Rejoignez la direction générale de la SEEG en tant que Directeur Financier pour piloter la stratégie financière.', 'Libreville', 'CDI', 'Finance', 3000000, 4000000);