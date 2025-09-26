import { api } from "./client";
import { endpoints } from "./endpoints";

export interface RecruiterDashboardResponse {
  stats: any;
  activeJobs: any[];
  jobCoverage: any[];
  statusEvolution: any[];
  applicationsPerJob: any[];
  departmentStats?: any[];
}

export const analyticsService = {
  async recruiterDashboard(params?: { recruiter_id?: string }): Promise<RecruiterDashboardResponse> {
    const qs = params?.recruiter_id ? `?recruiter_id=${encodeURIComponent(params.recruiter_id)}` : "";
    const { data } = await api.get<RecruiterDashboardResponse>(`${endpoints.recruiterDashboard}${qs}`);
    return (data as RecruiterDashboardResponse) || {
      stats: null,
      activeJobs: [],
      jobCoverage: [],
      statusEvolution: [],
      applicationsPerJob: [],
      departmentStats: [],
    };
  },
};




