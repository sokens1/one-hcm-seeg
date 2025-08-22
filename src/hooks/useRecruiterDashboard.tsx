/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Compute gender distribution from candidate_profiles (robust normalization)
    let malePercent: number | undefined = 0;
    let femalePercent: number | undefined = 0;

    // Helper to normalize various inputs to 'Homme' | 'Femme' | null
    const normalizeGender = (g?: string | null): 'Homme' | 'Femme' | null => {
      if (!g) return null;
      const s = g.trim().toLowerCase();
      const maleSet = new Set(['h', 'm', 'homme', 'masculin', 'male', 'mâle']);
      const femaleSet = new Set(['f', 'femme', 'feminin', 'féminin', 'female']);
      if (maleSet.has(s)) return 'Homme';
      if (femaleSet.has(s)) return 'Femme';
      return null;
    };

    if (candidateIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('candidate_profiles')
        .select('user_id, gender')
        .in('user_id', candidateIds as string[]);

      if (profilesError) {
        console.warn('[Dashboard] Could not fetch candidate profiles for gender stats:', profilesError.message);
      } else if (profiles) {
        // Ensure unique candidates and normalized genders
        const normalized: Array<{ user_id: string; gender: 'Homme' | 'Femme' | null }> = profiles.map(p => ({
          user_id: (p as any).user_id,
          gender: normalizeGender((p as any).gender)
        }));

        const withGender = normalized.filter(p => p.gender !== null);
        const totalWithGender = withGender.length;
        if (totalWithGender > 0) {
          const maleCount = withGender.filter(p => p.gender === 'Homme').length;
          const femaleCount = withGender.filter(p => p.gender === 'Femme').length;
          malePercent = (maleCount / totalWithGender) * 100;
          femalePercent = (femaleCount / totalWithGender) * 100;
        } else {
          malePercent = 0;
          femalePercent = 0;
        }
      }
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
    // New columns
    categorie_metier?: string | null;
    date_limite?: string | null;
    reporting_line?: string | null;
    job_grade?: string | null;
    salary_note?: string | null;
    start_date?: string | null;
    responsibilities?: string[] | null;
  };
  type JobOffersUpdate = Partial<Omit<JobOffersInsert, 'recruiter_id' | 'status'>> & {
    status?: 'active' | 'draft' | string;
  };

  const createJobOfferMutation = useMutation({
    mutationFn: async ({ jobData, status }: {
      jobData: any;
      status: 'active' | 'draft';
    }) => {
      if (!user) throw new Error("User not authenticated");

      console.log('[CreateJobOffer] Input data:', { jobData, status });
      console.log('[CreateJobOffer] User ID:', user.id);

      // Build payload with proper field mapping
      const basePayload: JobOffersInsert = { 
        recruiter_id: user.id, 
        status,
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        contract_type: jobData.contract_type,
        profile: jobData.profile,
        categorie_metier: jobData.categorie_metier,
        date_limite: jobData.date_limite,
        reporting_line: jobData.reporting_line,
        salary_note: jobData.salary_note,
        start_date: jobData.start_date,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements
      };

      // Remove undefined/null/empty values
      Object.keys(basePayload).forEach(key => {
        if (basePayload[key] === undefined || basePayload[key] === null || basePayload[key] === '') {
          delete basePayload[key];
        }
      });

      console.log('[CreateJobOffer] Final payload:', basePayload);

      const { data, error } = await supabase.from('job_offers').insert([basePayload]).select();

      if (error) {
        console.error('[CreateJobOffer] Database error:', error);
        throw new Error(`Erreur lors de la création de l'offre: ${error.message}`);
      }
      
      console.log('[CreateJobOffer] Success:', data);
      return data;
    },
    onSuccess: () => {
      console.log('[CreateJobOffer] Mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['jobOffers'] });
    },
    onError: (error) => {
      console.error('[CreateJobOffer] Mutation error:', error);
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

  interface DeleteJobOfferVariables {
    jobId: string;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }

  const deleteJobOfferMutation = useMutation<null, Error, DeleteJobOfferVariables>({
    mutationFn: async ({ jobId }) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('job_offers')
        .update({ status: 'closed' })
        .eq('id', jobId)
        .eq('recruiter_id', user.id);

      if (error) throw error;
      return null;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recruiterDashboard', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['jobOffers'] });
      queryClient.invalidateQueries({ queryKey: ['jobOffer', variables.jobId] });
      variables.onSuccess?.();
    },
    onError: (error, variables) => {
      variables.onError?.(error);
    },
  });

  return {
    createJobOffer: createJobOfferMutation.mutateAsync,
    isCreating: createJobOfferMutation.isPending,
    updateJobOffer: updateJobOfferMutation.mutateAsync,
    isUpdating: updateJobOfferMutation.isPending,
    deleteJobOffer: deleteJobOfferMutation.mutate,
    isDeleting: deleteJobOfferMutation.isPending,
  };
}