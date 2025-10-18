/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { CAMPAIGN_MODE, CAMPAIGN_JOBS, CAMPAIGN_JOB_PATTERNS, isInCampaignPeriod, getCampaignById, GLOBAL_VIEW } from "@/config/campaign";
import { CAMPAIGN_CONFIG } from "@/config/campaigns";

export interface RecruiterStats {
  totalJobs: number;
  totalCandidates: number; // candidats uniques
  newCandidates: number;
  interviewsScheduled: number;
  malePercent?: number;
  femalePercent?: number;
  multiPostCandidates?: number;
}

export interface DepartmentStats {
  department: string;
  jobCount: number;
  applicationCount: number;
  coverageRate: number;
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

export interface JobCoverageData {
  id: string;
  title: string;
  current_applications: number;
  coverage_rate: number;
  coverage_status: 'excellent' | 'good' | 'moderate' | 'low';
}

export interface StatusEvolutionData {
  date: string;
  candidature: number;
  incubation: number;
  embauche: number;
  refuse: number;
  entretien_programme?: number;
}

export interface ApplicationsPerJobData {
  id: string;
  title: string;
  applications_count: number;
  new_applications_24h: number;
}

export function useRecruiterDashboard(campaignId?: string) {
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) {
      return { 
        stats: null, 
        activeJobs: [], 
        jobCoverage: [],
        statusEvolution: [],
        applicationsPerJob: []
      };
    }

    // Check user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // Fetch job offers filtered by campaign
    const activeCampaignId = campaignId || GLOBAL_VIEW.id;
    
    let jobsQuery = supabase
      .from('job_offers')
      .select(`
        id,
        title,
        location,
        contract_type,
        created_at,
        recruiter_id,
        department,
        campaign_id
      `)
      .eq('status', 'active');
    
    // Filtrer par campagne si ce n'est pas la vue globale
    if (activeCampaignId !== GLOBAL_VIEW.id) {
      // Extraire le numéro depuis "campaign-1" → 1, "campaign-2" → 2, etc.
      const match = activeCampaignId.match(/campaign-(\d+)/);
      if (match) {
        const campaignIdNumber = parseInt(match[1], 10);
        console.log(`🔍 [DASHBOARD] Filtre campagne: "${activeCampaignId}" → campaign_id=${campaignIdNumber}`);
        jobsQuery = jobsQuery.eq('campaign_id', campaignIdNumber);
      } else {
        console.warn(`⚠️ [DASHBOARD] ID de campagne invalide: "${activeCampaignId}"`);
      }
    } else {
      console.log(`🔍 [DASHBOARD] Vue globale - Toutes les campagnes`);
    }
    
    const { data: jobsData, error: jobsError } = await jobsQuery;

    // Récupérer TOUTES les candidatures avec la fonction optimisée
    const { data: combinedEntries, error: rpcError } = await supabase.rpc('get_all_recruiter_applications');
    
    if (rpcError) {
      console.error('❌ [DASHBOARD] Erreur RPC get_all_recruiter_applications:', rpcError);
    } else {
      console.log(`✅ [DASHBOARD] RPC réussie - ${(combinedEntries || []).length} candidatures récupérées`);
    }
    
    // Filtrer les candidatures en fonction de la campagne sélectionnée
    let allEntries = (combinedEntries || []);
    
    // Si on a filtré les offres par campagne, filtrer aussi les candidatures
    if (activeCampaignId !== GLOBAL_VIEW.id) {
      // Extraire le numéro de campagne
      const match = activeCampaignId.match(/campaign-(\d+)/);
      if (match) {
        const campaignIdNumber = parseInt(match[1], 10);
        // Filtrer les candidatures par les offres de cette campagne uniquement
        const campaignJobIds = new Set((jobsData || []).map((j: any) => j.id));
        allEntries = allEntries.filter((app: any) => {
          const jobOfferId = app?.application_details?.job_offer_id;
          return campaignJobIds.has(jobOfferId);
        });
        console.log(`🔍 [DASHBOARD] Candidatures filtrées pour campagne ${campaignIdNumber}: ${allEntries.length} candidatures`);
      }
    } else {
      console.log(`🔍 [DASHBOARD] Vue globale - ${allEntries.length} candidatures au total`);
    }

    // Extraire les détails des candidatures
    const allApplicationsData = (allEntries || []).map((app: any) => app.application_details);

    if (jobsError) {
      throw jobsError;
    }
    
    // Offres filtrées par campagne
    const campaignJobs = (jobsData || []);
    
    // Debug: Afficher les campaign_id des offres récupérées
    const campaignDistribution = campaignJobs.reduce((acc: Record<string, number>, job: any) => {
      const cid = job.campaign_id ?? 'NULL';
      acc[cid] = (acc[cid] || 0) + 1;
      return acc;
    }, {});
    
    // Debug: Afficher le nombre de candidatures par offre
    const appsPerJob = campaignJobs.reduce((acc: Record<string, number>, job: any) => {
      const count = allApplicationsData.filter((app: any) => app.job_offer_id === job.id).length;
      if (count > 0) {
        acc[job.title] = count;
      }
      return acc;
    }, {});
    
    if (activeCampaignId === GLOBAL_VIEW.id) {
      console.log(`📊 [DASHBOARD] Vue globale - ${campaignJobs.length} offres affichées (toutes campagnes)`);
      console.log(`📊 [DASHBOARD] Distribution par campagne:`, campaignDistribution);
      console.log(`📊 [DASHBOARD] Total des candidatures: ${allApplicationsData.length}`);
      console.log(`📊 [DASHBOARD] Candidatures par offre:`, appsPerJob);
    } else {
      console.log(`📊 [DASHBOARD] Campagne ${activeCampaignId} - ${campaignJobs.length} offres affichées`);
      console.log(`📊 [DASHBOARD] Distribution par campagne:`, campaignDistribution);
      console.log(`📊 [DASHBOARD] Total des candidatures: ${allApplicationsData.length}`);
      console.log(`📊 [DASHBOARD] Candidatures par offre:`, appsPerJob);
    }

    // Process jobs data with filtered applications
    const processedJobs: RecruiterJobOffer[] = (campaignJobs || []).map(job => {
      // Find all applications for this job from the separate query
      const jobApplications = (allApplicationsData || []).filter(app => app.job_offer_id === job.id);
      
      const totalApplications = jobApplications.length;
      const newApplications = jobApplications.filter(app => {
        const appDate = new Date(app.created_at);
        // Calculer la date d'il y a 24h en respectant le fuseau horaire local
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        return appDate > oneDayAgo;
      }).length;

      return {
        id: job.id,
        title: job.title,
        location: job.location,
        contract_type: job.contract_type,
        created_at: job.created_at,
        recruiter_id: job.recruiter_id,
        totalApplications,
        newApplications,
        candidate_count: totalApplications, // Alias pour le dashboard
        new_candidates: newApplications,    // Alias pour le dashboard
      };
    });

    // Gather unique candidates across ALL applications
    const candidateIds = Array.from(new Set((allApplicationsData || []).map(a => a.candidate_id).filter(Boolean)));

    // Calculate stats
    // Pour la vue globale, soustraire 3 du nombre total d'offres
    const totalJobs = activeCampaignId === GLOBAL_VIEW.id 
      ? Math.max(0, processedJobs.length - 3) 
      : processedJobs.length;
    const totalCandidates = candidateIds.length; // uniques
    const newCandidates = processedJobs.reduce((sum, job) => sum + job.new_candidates, 0);

    // Count unique candidates with at least one application in 'entretien_programme' status
    const candidatesWithInterviews = new Set(
      (allApplicationsData || [])
        .filter(app => app.status === 'entretien_programme')
        .map(app => app.candidate_id)
        .filter(Boolean)
    );
    const interviewsScheduled = candidatesWithInterviews.size;

    // Compute multi-post applicants (candidates who applied to 2+ jobs)
    const applicationsByCandidate = new Map<string, Set<string>>();
    for (const app of (allApplicationsData || [])) {
      const cid = app.candidate_id as string | undefined;
      const jid = app.job_offer_id as string | undefined;
      if (!cid || !jid) continue;
      if (!applicationsByCandidate.has(cid)) applicationsByCandidate.set(cid, new Set());
      applicationsByCandidate.get(cid)!.add(jid);
    }
    let multiPostCandidates = 0;
    applicationsByCandidate.forEach(set => { if (set.size > 1) multiPostCandidates++; });

    // Compute gender distribution from RPC data (robust normalization)
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
      // Extract gender data from RPC results instead of making a separate query
      const candidateGenders = new Map<string, string | null>();
      
      // Get unique candidates with their gender from RPC data
      (allEntries || []).forEach((app: any) => {
        const candidateId = app.candidate_details?.id || app.application_details?.candidate_id;
        const gender = app.candidate_details?.gender || app.candidate_details?.candidate_profiles?.gender; // Vérifier les deux emplacements
        if (candidateId && !candidateGenders.has(candidateId)) {
          candidateGenders.set(candidateId, gender);
        }
      });

      // Debug: Log gender data extraction
      // console.log('[DASHBOARD DEBUG] Full candidate_details object:', JSON.stringify(allEntries?.[0]?.candidate_details, null, 2));
      // console.log('[DASHBOARD DEBUG] Direct gender from candidate_details:', allEntries?.[0]?.candidate_details?.gender);
      // console.log('[DASHBOARD DEBUG] Candidate genders map:', candidateGenders);
      
      // Extraire le genre depuis candidate_profiles si disponible
      if (allEntries?.[0]?.candidate_details?.candidate_profiles?.gender) {
        const profileGender = allEntries[0].candidate_details.candidate_profiles.gender;
        // console.log('[DASHBOARD DEBUG] Gender from candidate_profiles:', profileGender);
      }

      // Normalize genders for unique candidates
      const normalized: Array<{ user_id: string; gender: 'Homme' | 'Femme' | null }> = 
        Array.from(candidateGenders.entries()).map(([userId, gender]) => ({
          user_id: userId,
          gender: normalizeGender(gender)
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

    const stats: RecruiterStats = {
      totalJobs,
      totalCandidates,
      newCandidates,
      interviewsScheduled,
      malePercent,
      femalePercent,
      multiPostCandidates,
    };

    // Calculate job coverage data - using a scoring system based on application count
    const jobCoverage: JobCoverageData[] = (jobsData || []).map(job => {
      const jobApplications = (allApplicationsData || []).filter(app => app.job_offer_id === job.id);
      const currentApplications = jobApplications.length;
      
      // Create a coverage score based on number of applications
      // This replaces the target_positions calculation
      let coverageScore = 0;
      let coverageStatus: JobCoverageData['coverage_status'] = 'low';
      
      if (currentApplications >= 10) {
        coverageScore = 100;
        coverageStatus = 'excellent';
      } else if (currentApplications >= 7) {
        coverageScore = 85;
        coverageStatus = 'good';
      } else if (currentApplications >= 4) {
        coverageScore = 70;
        coverageStatus = 'moderate';
      } else if (currentApplications >= 1) {
        coverageScore = 50;
        coverageStatus = 'low';
      }

      return {
        id: job.id,
        title: job.title,
        current_applications: currentApplications,
        coverage_rate: coverageScore,
        coverage_status: coverageStatus
      };
    });

    // Calculate applications per job data
    const applicationsPerJob: ApplicationsPerJobData[] = (jobsData || []).map(job => {
      const jobApplications = (allApplicationsData || []).filter(app => app.job_offer_id === job.id);
      const newApplications24h = jobApplications.filter(app => {
        const appDate = new Date(app.created_at);
        // Calculer la date d'il y a 24h en respectant le fuseau horaire local
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        return appDate > oneDayAgo;
      }).length;

      return {
        id: job.id,
        title: job.title,
        applications_count: jobApplications.length,
        new_applications_24h: newApplications24h
      };
    });

    // Calculate department statistics
    const departmentStats: DepartmentStats[] = [];
    const departments = ['Eau', 'Électricité', 'Support'];
    
    // Debug: Log all jobs and their departments
    // console.log('[DASHBOARD DEBUG] All jobs:', jobsData);
    // console.log('[DASHBOARD DEBUG] Jobs with departments:', (jobsData || []).map(job => ({ id: job.id, title: job.title, department: job.department })));
    
    departments.forEach(dept => {
      const deptJobs = (jobsData || []).filter(job => job.department === dept);
      let deptJobCount = deptJobs.length;
      
      // Pour la vue globale, soustraire 3 du nombre de postes de type Support
      if (activeCampaignId === GLOBAL_VIEW.id && dept === 'Support') {
        deptJobCount = Math.max(0, deptJobCount - 3);
      }
      
      // Debug: Log department filtering
      // console.log(`[DASHBOARD DEBUG] Department "${dept}":`, { deptJobCount, jobs: deptJobs.map(j => j.title) });
      
      // Always add the department, even if no jobs
      const deptApplications = deptJobs.reduce((sum, job) => {
        const jobApplications = (allApplicationsData || []).filter(app => app.job_offer_id === job.id);
        return sum + jobApplications.length;
      }, 0);
      
      const coverageRate = deptJobCount > 0 ? Math.round((deptApplications / deptJobCount) * 100) : 0;
      
      departmentStats.push({
        department: dept,
        jobCount: deptJobCount,
        applicationCount: deptApplications,
        coverageRate
      });
    });
    
    // Debug: Log final department stats
    // console.log('[DASHBOARD DEBUG] Final department stats:', departmentStats);

    // Calculate status evolution day by day
    const statusEvolution: StatusEvolutionData[] = [];
    
    // Déterminer la plage de dates en fonction de la campagne
    let startDate: Date;
    let endDate: Date;
    
    if (activeCampaignId === GLOBAL_VIEW.id) {
      // Vue globale : depuis la première campagne
      startDate = new Date('2025-08-23');
      endDate = new Date();
    } else {
      // Campagne spécifique : période exacte de la campagne
      const campaign = getCampaignById(activeCampaignId);
      if (campaign) {
        startDate = new Date(campaign.startDate);
        endDate = new Date(campaign.endDate);
        // Si la campagne n'est pas encore terminée, utiliser aujourd'hui
        const now = new Date();
        if (now < endDate) {
          endDate = now;
        }
      } else {
        // Fallback
        startDate = new Date('2025-08-23');
        endDate = new Date();
      }
    }
    
    // Calculer tous les jours de la période
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Générer tous les jours de la période
    const allDays = Array.from({ length: daysDiff + 1 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date.toLocaleDateString('fr-CA'); // Format YYYY-MM-DD
    });

    // Pour chaque jour de la période, calculer l'évolution des statuts
    allDays.forEach(date => {
      // Candidatures créées ce jour-là (pas cumulatif)
      const dayApplications = (allApplicationsData || []).filter(app => {
        const appDate = new Date(app.created_at);
        const appDateLocal = appDate.toLocaleDateString('fr-CA');
        return appDateLocal === date; // Exactement ce jour
      });

      // Compter par statut ACTUEL pour les candidatures de ce jour
      const candidature = dayApplications.filter(app => app.status === 'candidature').length;
      const incubation = dayApplications.filter(app => app.status === 'incubation').length;
      const embauche = dayApplications.filter(app => app.status === 'embauche').length;
      const refuse = dayApplications.filter(app => app.status === 'refuse').length;
      const entretien_programme = dayApplications.filter(app => app.status === 'entretien_programme').length;

      // Ne pas ajouter de jour vide (0 candidatures)
      const totalApplications = candidature + incubation + embauche + refuse + entretien_programme;
      
      if (totalApplications > 0) {
        statusEvolution.push({
          date,
          candidature,
          incubation,
          embauche,
          refuse,
          entretien_programme
        });
      }
    });

    // Si aucune donnée, ajouter au moins une entrée vide pour éviter les erreurs
    if (statusEvolution.length === 0) {
      statusEvolution.push({
        date: new Date().toLocaleDateString('fr-CA'),
        candidature: 0,
        incubation: 0,
        embauche: 0,
        refuse: 0,
        entretien_programme: 0
      });
    }

    return { 
      stats, 
      activeJobs: processedJobs,
      jobCoverage,
      statusEvolution,
      applicationsPerJob,
      departmentStats
    };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recruiterDashboard', user?.id, campaignId || GLOBAL_VIEW.id],
    queryFn: fetchDashboardData,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Les données restent fraîches pendant 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh toutes les 5 minutes au lieu de 30 secondes
    refetchOnWindowFocus: true, // Rafraîchir quand l'utilisateur revient sur la page
  });

  return {
    stats: data?.stats ?? { totalJobs: 0, totalCandidates: 0, newCandidates: 0, interviewsScheduled: 0 },
    activeJobs: data?.activeJobs ?? [],
    jobCoverage: data?.jobCoverage ?? [],
    statusEvolution: data?.statusEvolution ?? [],
    applicationsPerJob: data?.applicationsPerJob ?? [],
    departmentStats: data?.departmentStats ?? [],
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
    status_offerts?: string | null;
    responsibilities?: string[] | null;
    // MTP Questions
    mtp_questions_metier?: string[] | null;
    mtp_questions_talent?: string[] | null;
    mtp_questions_paradigme?: string[] | null;
    // Campaign
    campaign_id?: number | null;
  };
  type JobOffersUpdate = Partial<Omit<JobOffersInsert, 'recruiter_id' | 'status'>> & {
    status?: 'active' | 'draft' | string;
  };

  const createJobOfferMutation = useMutation({
    mutationFn: async ({ jobData, status }: {
      jobData: any;
      status: 'active' | 'draft' | 'inactive' | 'closed';
    }) => {
      if (!user) throw new Error("User not authenticated");

      // console.log('[CreateJobOffer] Input data:', { jobData, status });
      // console.log('[CreateJobOffer] User ID:', user.id);

      // Utiliser le campaign_id passé manuellement, ou fallback sur la campagne active
      const campaignId = jobData.campaign_id ?? CAMPAIGN_CONFIG.ACTIVE_CAMPAIGN_ID;
      
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
        status_offerts: jobData.status_offerts,
        start_date: jobData.start_date,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        mtp_questions_metier: jobData.mtp_questions_metier,
        mtp_questions_talent: jobData.mtp_questions_talent,
        mtp_questions_paradigme: jobData.mtp_questions_paradigme,
        campaign_id: campaignId
      };
      
      console.log(`📊 [CreateJobOffer] Création d'offre avec campaign_id: ${campaignId} (manuel: ${jobData.campaign_id !== undefined})`);

      // Remove undefined/null/empty values
      Object.keys(basePayload).forEach(key => {
        if (basePayload[key] === undefined || basePayload[key] === null || basePayload[key] === '') {
          delete basePayload[key];
        }
      });

      // console.log('[CreateJobOffer] Final payload:', basePayload);

      const { data, error } = await supabase.from('job_offers').insert([basePayload]).select();

      if (error) {
        console.error('[CreateJobOffer] Database error:', error);
        throw new Error(`Erreur lors de la création de l'offre: ${error.message}`);
      }
      
      // console.log('[CreateJobOffer] Success:', data);
      return data;
    },
    onSuccess: () => {
      // console.log('[CreateJobOffer] Mutation successful, invalidating queries');
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
        .eq('id', jobId);

      if (error && (error.message?.includes('column') || error.message?.includes('profile') || error.code === '409')) {
        const retryData = { ...cleanData };
        delete retryData.profile;
        const retry = await supabase
          .from('job_offers')
          .update(retryData)
          .eq('id', jobId);
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
        .eq('id', jobId);

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
