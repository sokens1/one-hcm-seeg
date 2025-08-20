import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RecruiterStats {
  totalJobs: number;
  totalCandidates: number; // candidats uniques
  newCandidates: number;
  interviewsScheduled: number;
  malePercent?: number;
  femalePercent?: number;
  multiPostCandidates?: number;
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

  const fetchDashboardData = async () => {
    if (!user) {
      return { stats: null, activeJobs: [] };
    }

    // Fetch job offers with application counts and applicant ids
    const { data: jobsData, error: jobsError } = await supabase
      .from('job_offers')
      .select(`
        id,
        title,
        location,
        contract_type,
        created_at,
        applications(id, status, created_at, candidate_id, job_offer_id)
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

    // Gather unique candidates across all active jobs for this recruiter
    const allApplications = (jobsData || []).flatMap(j => (j.applications || []));
    const candidateIds = Array.from(new Set(allApplications.map(a => a.candidate_id).filter(Boolean)));

    // Calculate stats
    const totalJobs = processedJobs.length;
    const totalCandidates = candidateIds.length; // uniques
    const newCandidates = processedJobs.reduce((sum, job) => sum + job.new_candidates, 0);

    // Count interviews scheduled (applications in 'incubation' status)
    const { data: interviewsData } = await supabase
      .from('applications')
      .select('id', { count: 'exact' })
      .in('job_offer_id', processedJobs.map(job => job.id))
      .eq('status', 'incubation');

    const interviewsScheduled = interviewsData?.length || 0;

    // Compute multi-post applicants (candidates who applied to 2+ jobs among this recruiter's jobs)
    const applicationsByCandidate = new Map<string, Set<string>>();
    for (const app of allApplications) {
      const cid = app.candidate_id as string | undefined;
      const jid = app.job_offer_id as string | undefined;
      if (!cid || !jid) continue;
      if (!applicationsByCandidate.has(cid)) applicationsByCandidate.set(cid, new Set());
      applicationsByCandidate.get(cid)!.add(jid);
    }
    let multiPostCandidates = 0;
    applicationsByCandidate.forEach(set => { if (set.size > 1) multiPostCandidates++; });

    // Compute gender distribution from candidate_profiles
    // Note: the current schema (src/integrations/supabase/types.ts) does not expose a 'gender' column on candidate_profiles.
    // To avoid 400 errors, we skip selecting a non-existent column and leave percentages undefined until the schema is updated.
    let malePercent: number | undefined = undefined;
    let femalePercent: number | undefined = undefined;
    if (candidateIds.length > 0) {
      // Attempt a minimal fetch to verify accessible rows without selecting non-existent columns.
      const { error: profilesError } = await supabase
        .from('candidate_profiles')
        .select('user_id')
        .in('user_id', candidateIds as string[]);
      if (profilesError) {
        // Do not throw; just skip gender computation to keep dashboard functional.
        console.warn('[Dashboard] candidate_profiles fetch skipped:', profilesError.message || profilesError);
      }
      // malePercent and femalePercent remain undefined to reflect unavailable data
    }

    const stats: RecruiterStats = {
      totalJobs,
      totalCandidates,
      newCandidates,
      interviewsScheduled,
      malePercent,
      femalePercent,
      multiPostCandidates,
    };

    return { stats, activeJobs: processedJobs };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recruiterDashboard', user?.id],
    queryFn: fetchDashboardData,
    enabled: !!user,
  });

  return {
    stats: data?.stats ?? { totalJobs: 0, totalCandidates: 0, newCandidates: 0, interviewsScheduled: 0 },
    activeJobs: data?.activeJobs ?? [],
    isLoading,
    error: error?.message || null,
    refetch
  };
}

export function useCreateJobOffer() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Minimal shapes for inserting/updating job_offers
  type JobOffersInsert = {
    recruiter_id: string;
    status: 'active' | 'draft' | string;
    title?: string;
    description?: string;
    location?: string;
    contract_type?: string;
    profile?: string;
    department?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    requirements?: string[] | null;
    benefits?: string[] | null;
    application_deadline?: string | null;
  };
  type JobOffersUpdate = Partial<Omit<JobOffersInsert, 'recruiter_id' | 'status'>> & {
    status?: 'active' | 'draft' | string;
  };

  const createJobOfferMutation = useMutation({
    mutationFn: async ({ jobData, status }: {
      jobData: {
        title: string;
        description: string;
        location: string;
        contract_type: string;
        profile?: string;
        department?: string;
        salary_min?: number;
        salary_max?: number;
        requirements?: string[];
        benefits?: string[];
        application_deadline?: string;
      };
      status: 'active' | 'draft';
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Build payload dynamically to avoid sending unknown columns
      const basePayload: JobOffersInsert = { recruiter_id: user.id, status };
      for (const [k, v] of Object.entries(jobData)) {
        if (v !== undefined && v !== null && v !== "") basePayload[k] = v;
      }

      const { error } = await supabase.from('job_offers').insert([basePayload]);

      // If backend complains about unknown column (e.g., profile), retry without it
      if (error && (error.message?.includes('column') || error.message?.includes('profile') || error.code === '409')) {
        const retryPayload = { ...basePayload };
        delete retryPayload.profile;
        const retry = await supabase.from('job_offers').insert([retryPayload]);
        if (retry.error) throw retry.error;
      } else if (error) {
        throw error;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['jobOffers'] });
    },
  });

  const updateJobOfferMutation = useMutation({
    mutationFn: async ({ jobId, jobData }: { jobId: string, jobData: Partial<Omit<RecruiterJobOffer, 'id' | 'candidate_count' | 'new_candidates' | 'created_at'>> & { description?: string; status?: string; profile?: string } }) => {
      if (!user) throw new Error("User not authenticated");

      // Only send defined fields
      const cleanData: JobOffersUpdate = {};
      for (const [k, v] of Object.entries(jobData)) {
        if (v !== undefined) cleanData[k] = v;
      }

      const { error } = await supabase
        .from('job_offers')
        .update(cleanData)
        .eq('id', jobId)
        .eq('recruiter_id', user.id);

      if (error && (error.message?.includes('column') || error.message?.includes('profile') || error.code === '409')) {
        const retryData = { ...cleanData };
        delete retryData.profile;
        const retry = await supabase
          .from('job_offers')
          .update(retryData)
          .eq('id', jobId)
          .eq('recruiter_id', user.id);
        if (retry.error) throw retry.error;
      } else if (error) {
        throw error;
      }
      return null;
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['jobOffers'] });
      queryClient.invalidateQueries({ queryKey: ['jobOffer', jobId] });
    },
  });

  return {
    createJobOffer: createJobOfferMutation.mutateAsync,
    isCreating: createJobOfferMutation.isPending,
    updateJobOffer: updateJobOfferMutation.mutateAsync,
    isUpdating: updateJobOfferMutation.isPending,
  };
}