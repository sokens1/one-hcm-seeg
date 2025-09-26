import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CampaignStats {
  total_jobs: number;
  total_candidates: number;
  total_applications: number;
  applications_per_job: Array<{
    job_id: string;
    job_title: string;
    candidate_count: number;
    application_count: number;
  }>;
}

export function useCampaignStats() {
  return useQuery({
    queryKey: ['campaignStats'],
    queryFn: async (): Promise<CampaignStats> => {
      const { data, error } = await supabase.rpc('get_campaign_stats');
      
      if (error) {
        console.error('Erreur lors de la récupération des statistiques de campagne:', error);
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return {
          total_jobs: 0,
          total_candidates: 0,
          total_applications: 0,
          applications_per_job: []
        };
      }

      const stats = data[0];
      return {
        total_jobs: Number(stats.total_jobs) || 0,
        total_candidates: Number(stats.total_candidates) || 0,
        total_applications: Number(stats.total_applications) || 0,
        applications_per_job: stats.applications_per_job || []
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCampaignApplications() {
  return useQuery({
    queryKey: ['campaignApplications'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_campaign_applications');
      
      if (error) {
        console.error('Erreur lors de la récupération des candidatures de campagne:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
