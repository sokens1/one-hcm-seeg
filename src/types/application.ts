// This interface represents the data we get from the API
export interface Application {
  id: string;
  candidate_id: string;
  job_offer_id: string;
  cover_letter: string | null;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse' | 'entretien_programme' | 'simulation_programmee';
  motivation: string | null;
  availability_start: string | null;
  reference_contacts?: string | null;
  ref_contacts?: string | null;
  interview_date?: string | null; // Date et heure de l'entretien programmé
  simulation_date?: string | null; // Date et heure de la simulation programmée
  mtp_answers?: {
    metier?: string[];
    talent?: string[];
    paradigme?: string[];
  } | null;
  created_at: string;
  updated_at: string;
  job_offers?: {
    date_limite: string;
    title: string;
    location: string;
    contract_type: string;
    recruiter_id?: string;
  } | null;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    candidate_profiles?: {
      id: string;
      gender: string;
      date_of_birth: string;
      current_position: string;
      address: string;
      linkedin_profile: string;
      portfolio_url: string;
      experiences: Array<{
        id: string;
        title: string;
        company: string;
        location: string;
        start_date: string;
        end_date: string | null;
        description: string;
      }>;
      educations: Array<{
        id: string;
        institution: string;
        degree: string;
        field_of_study: string;
        start_date: string;
        end_date: string | null;
      }>;
      skills: Array<{
        id: string;
        name: string;
        level?: number;
      }>;
    } | null;
  } | null;
  // Additional fields for PDF generation
  cv?: { name: string; url: string } | null;
  integrity_letter?: { name: string; url: string } | null;
  project_idea?: { name: string; url: string } | null;
  certificates?: { name: string; url: string }[];
  recommendations?: { name: string; url: string }[];
}

// This interface is used for the PDF generation
export interface ApplicationData {
  // From Application
  id: string
  created_at: string;
  status: string;
  gender: string;
  cv?: { name: string; url: string } | null;
  certificates?: { name: string; url: string }[];
  recommendations?: { name: string; url: string }[];
  metier1?: string;
  metier2?: string;
  metier3?: string;
  talent1?: string;
  talent2?: string;
  talent3?: string;
  paradigme1?: string;
  paradigme2?: string;
  paradigme3?: string;
  
  // Additional/transformed fields
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | null;
  currentPosition: string;
  coverLetter?: { name: string; url: string } | null;
  integrityLetter?: { name: string; url: string } | null;
  projectIdea?: { name: string; url: string } | null;
  jobTitle: string;
  interviewDate?: string | null; // Date et heure de l'entretien programmé
}
