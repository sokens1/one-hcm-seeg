import { api } from "./client";
import { endpoints } from "./endpoints";

export interface ApiApplicationPayload {
  candidate_id: string;
  job_offer_id: string;
  mtp_answers?: unknown;
  reference_contacts?: string | null;
}

export interface ApiApplicationUpdate {
  status?: string;
  interview_date?: string | null;
  simulation_date?: string | null;
  reference_contacts?: string | null;
}

export const applicationsService = {
  async list(params?: Record<string, string | number | boolean>): Promise<any[]> {
    const qs = params ? `?${new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => { acc[k] = String(v); return acc; }, {} as Record<string, string>))}` : "";
    const { data } = await api.get<any[]>(`${endpoints.listApplications}${qs}`);
    return data ?? [];
  },
  async get(id: string): Promise<any | null> {
    const { data } = await api.get<any>(endpoints.getApplication(id));
    return (data as any) ?? null;
  },
  async create(payload: ApiApplicationPayload): Promise<any> {
    const { data } = await api.post<any>(endpoints.createApplication, payload);
    return data;
  },
  async update(id: string, payload: ApiApplicationUpdate): Promise<any> {
    const { data } = await api.patch<any>(endpoints.updateApplication(id), payload);
    return data;
  },
};




