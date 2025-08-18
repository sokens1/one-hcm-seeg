import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RecruiterStats {
  totalJobs: number;
  totalCandidates: number;
  newCandidates: number;
  interviewsScheduled: number;
}

export interface RecruiterJobOffer {
  id: string;
  title: string;
  location: string;
  contract_type: string;
  candidate_count: number;
  new_candidates: number;
  created_at: string;
}

export function useRecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<RecruiterStats>({
    totalJobs: 0,
    totalCandidates: 0,
    newCandidates: 0,
    interviewsScheduled: 0
  });
  const [activeJobs, setActiveJobs] = useState<RecruiterJobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch job offers with application counts
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_offers')
        .select(`
          id,
          title,
          location,
          contract_type,
          created_at,
          applications(id, status, created_at)
        `)
        .eq('recruiter_id', user.id)
        .eq('status', 'active');

      if (jobsError) throw jobsError;

      // Process jobs data
      const processedJobs: RecruiterJobOffer[] = (jobsData || []).map(job => {
        const totalApplications = job.applications?.length || 0;
        const newApplications = job.applications?.filter(app => {
          const appDate = new Date(app.created_at);
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          return appDate > oneDayAgo;
        }).length || 0;

        return {
          id: job.id,
          title: job.title,
          location: job.location,
          contract_type: job.contract_type,
          candidate_count: totalApplications,
          new_candidates: newApplications,
          created_at: job.created_at
        };
      });

      setActiveJobs(processedJobs);

      // Calculate stats
      const totalJobs = processedJobs.length;
      const totalCandidates = processedJobs.reduce((sum, job) => sum + job.candidate_count, 0);
      const newCandidates = processedJobs.reduce((sum, job) => sum + job.new_candidates, 0);

      // Count interviews scheduled (applications in 'incubation' status)
      const { data: interviewsData } = await supabase
        .from('applications')
        .select('id')
        .in('job_offer_id', processedJobs.map(job => job.id))
        .eq('status', 'incubation');

      const interviewsScheduled = interviewsData?.length || 0;

      setStats({
        totalJobs,
        totalCandidates,
        newCandidates,
        interviewsScheduled
      });

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  return {
    stats,
    activeJobs,
    isLoading,
    error,
    refetch: fetchDashboardData
  };
}

export function useCreateJobOffer() {
  const { user } = useAuth();

  const createJobOffer = async (jobData: {
    title: string;
    description: string;
    location: string;
    contract_type: string;
    department?: string;
    salary_min?: number;
    salary_max?: number;
    requirements?: string[];
    benefits?: string[];
    application_deadline?: string;
  }) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('job_offers')
      .insert([{
        recruiter_id: user.id,
        ...jobData,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  };

  const updateJobOffer = async (jobId: string, jobData: Partial<{
    title: string;
    description: string;
    location: string;
    contract_type: string;
    department: string;
    salary_min: number;
    salary_max: number;
    requirements: string[];
    benefits: string[];
    application_deadline: string;
    status: string;
  }>) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('job_offers')
      .update(jobData)
      .eq('id', jobId)
      .eq('recruiter_id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  };

  return {
    createJobOffer,
    updateJobOffer
  };
}