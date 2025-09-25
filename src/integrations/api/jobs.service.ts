import { api } from "./client";
import { endpoints } from "./endpoints";

export interface ApiJobOffer {
  id: string;
  title: string;
  description?: string;
  location?: string | string[];
  contract_type?: string;
  profile?: string | null;
  department?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  requirements?: string | string[] | null;
  benefits?: string[] | null;
  status: string;
  application_deadline?: string | null;
  created_at: string;
  updated_at: string;
  recruiter_id?: string;
  categorie_metier?: string | null;
  date_limite?: string | null;
  reporting_line?: string | null;
  job_grade?: string | null;
  salary_note?: string | null;
  start_date?: string | null;
  responsibilities?: string | string[] | null;
  candidate_count?: number;
  new_candidates?: number;
}

export const jobsService = {
  async list(): Promise<ApiJobOffer[]> {
    const { data } = await api.get<ApiJobOffer[]>(endpoints.listJobs);
    return data ?? [];
  },
  async get(id: string): Promise<ApiJobOffer | null> {
    if (!id) return null;
    const { data } = await api.get<ApiJobOffer>(endpoints.getJob(id));
    return (data as ApiJobOffer) ?? null;
  },
};




