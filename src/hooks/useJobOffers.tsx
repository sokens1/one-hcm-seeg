/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CAMPAIGN_MODE, CAMPAIGN_JOBS, CAMPAIGN_JOB_PATTERNS } from "@/config/campaign";

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  location: string | string[];
  contract_type: string;
  profile?: string | null;
  department?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  requirements?: string | string[] | null;
  benefits?: string[] | null;
  status: string;
  // interne | externe
  status_offers?: string | null;
  // handle existing typo variant in DB
  status_offerts?: string | null;
  application_deadline?: string | null;
  created_at: string;
  updated_at: string;
  recruiter_id: string;
  categorie_metier?: string | null;
  date_limite?: string | null;
  // New job post detail fields
  reporting_line?: string | null;
  job_grade?: string | null;
  salary_note?: string | null;
  start_date?: string | null;
  responsibilities?: string | string[] | null;
  candidate_count: number;
  new_candidates: number;
}

const fetchJobOffers = async () => {
  try {
    // Determine current user's audience (interne/externe)
    let candidateAudience: string | null = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      if (uid) {
        const { data: u } = await supabase
          .from('users')
          .select('candidate_status, matricule')
          .eq('id', uid)
          .maybeSingle();
        const row = u as { candidate_status?: string | null; matricule?: string | null } | null;
        candidateAudience = row?.candidate_status || (row?.matricule ? 'interne' : 'externe');
      }
    } catch (e) {
      // Fail soft if we cannot determine audience
      candidateAudience = null;
    }

    // 1. Fetch all active job offers, filtered by audience when available
    let offers: any[] | null = null;
    let queryError: any = null;
    try {
      const query = supabase
        .from('job_offers')
        .select('id,title,description,location,contract_type,requirements,status,status_offers,status_offerts,created_at,updated_at,recruiter_id,categorie_metier,date_limite,reporting_line,job_grade,salary_note,start_date,responsibilities')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      offers = data;
    } catch (err: any) {
      queryError = err;
      // If the error is due to unknown column status_offers (e.g., migration not applied yet), retry without it
      const isUnknownColumn = typeof err?.message === 'string' && (
        err.message.includes('column') && err.message.includes('status_offers') ||
        err.message.includes('42703')
      );
      if (isUnknownColumn) {
        try {
          const { data, error } = await supabase
            .from('job_offers')
            .select('id,title,description,location,contract_type,requirements,status,status_offerts,created_at,updated_at,recruiter_id,categorie_metier,date_limite,reporting_line,job_grade,salary_note,start_date,responsibilities')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
          if (error) throw error;
          offers = data || [];
          queryError = null;
        } catch (e) {
          queryError = e;
        }
      }
    }

    if (queryError) {
      console.error('[useJobOffers] Error fetching job offers:', queryError);
      
      // If it's a 500 error (RLS issue), return fallback data
      if (String(queryError.message || '').includes('500') || String(queryError.message || '').includes('Internal Server Error')) {
        console.warn('[useJobOffers] Server error detected, returning fallback data');
        return getFallbackJobOffers();
      }
      
      // Otherwise, return empty list to avoid showing fallback jobs to candidates
      return [] as JobOffer[];
    }
    
    if (!offers || offers.length === 0) return [];

    // Client-side audience filtering to avoid column name issues
    const filteredByAudience = (offers || []).filter((o: any) => {
      if (!candidateAudience) return true;
      const oa = o?.status_offers ?? o?.status_offerts ?? null;
      return oa === candidateAudience;
    });

    // 2. Récupérer les candidatures via RPC par offre (signature 1-argument)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let applications: Array<{ job_offer_id: string; created_at: string }> = [];
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_recruiter_applications');
      
      if (rpcError) {
        console.warn('RPC get_all_recruiter_applications failed:', rpcError.message);
        applications = [];
      } else {
        applications = (rpcData || []).map((app: any) => ({
          job_offer_id: app.application_details?.job_offer_id,
          created_at: app.application_details?.created_at,
        })).filter(app => app.job_offer_id && app.created_at);
      }
    } catch (e) {
      // Fail soft: garder le dashboard fonctionnel même si l'agrégat échoue
      console.warn('Error calling RPC get_all_recruiter_applications:', e);
      applications = [];
    }

    // 3. Count total and new applications for each offer
    // Filtre campagne: ne compter que les candidatures à partir du 25/09/2025
    const CAMPAIGN_START = new Date('2025-09-25');
    const applicationsCampaign = (applications || []).filter(a => new Date(a.created_at) >= CAMPAIGN_START);

    const applicationStats = (applicationsCampaign || []).reduce((acc, app) => {
      if (!acc[app.job_offer_id]) {
        acc[app.job_offer_id] = { total: 0, new: 0 };
      }
      acc[app.job_offer_id].total += 1;
      if (new Date(app.created_at) > new Date(twentyFourHoursAgo)) {
        acc[app.job_offer_id].new += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; new: number }>);

    // 4. Combine offers with their application counts
    const offersWithStats = filteredByAudience.map(offer => ({
      ...offer,
      candidate_count: applicationStats[offer.id]?.total || 0,
      new_candidates: applicationStats[offer.id]?.new || 0,
    }));

    // 5. Filter offers based on campaign mode
    if (CAMPAIGN_MODE) {
      console.log('🔍 [CAMPAIGN] All offers titles:', offersWithStats.map(o => o.title));
      console.log('🎯 [CAMPAIGN] Campaign jobs:', CAMPAIGN_JOBS);
      
      const filteredOffers = offersWithStats.filter(offer => {
        // Essayer d'abord la correspondance exacte
        let isIncluded = CAMPAIGN_JOBS.includes(offer.title);
        
        // Si pas de correspondance exacte, essayer avec les patterns
        if (!isIncluded) {
          isIncluded = CAMPAIGN_JOB_PATTERNS.some(pattern => pattern.test(offer.title));
        }
        
        console.log(`📋 [CAMPAIGN] "${offer.title}" - ${isIncluded ? '✅ INCLUDED' : '❌ EXCLUDED'}`);
        
        // Debug spécial pour le poste problématique
        if (offer.title.includes("Systèmes") || offer.title.includes("Systemes")) {
          console.log(`🔍 [DEBUG] Systèmes title: "${offer.title}"`);
          console.log(`🔍 [DEBUG] Title length: ${offer.title.length}`);
          console.log(`🔍 [DEBUG] Title charCodes:`, offer.title.split('').map(c => c.charCodeAt(0)));
          console.log(`🔍 [DEBUG] Campaign job: "${CAMPAIGN_JOBS[1]}"`);
          console.log(`🔍 [DEBUG] Campaign job length: ${CAMPAIGN_JOBS[1].length}`);
          console.log(`🔍 [DEBUG] Campaign job charCodes:`, CAMPAIGN_JOBS[1].split('').map(c => c.charCodeAt(0)));
          console.log(`🔍 [DEBUG] Exact match: ${offer.title === CAMPAIGN_JOBS[1]}`);
          console.log(`🔍 [DEBUG] Pattern match: ${CAMPAIGN_JOB_PATTERNS[1].test(offer.title)}`);
        }
        
        return isIncluded;
      });
      
      console.log('✅ [CAMPAIGN] Filtered offers count:', filteredOffers.length);
      return filteredOffers;
    }

    return offersWithStats;
  } catch (error) {
    console.error('[useJobOffers] Unexpected error:', error);
    const msg = String((error as any)?.message || '');
    if (msg.includes('500') || msg.includes('Internal Server Error')) {
      return getFallbackJobOffers();
    }
    // Otherwise, return empty to avoid showing fallback in candidate view
    return [] as JobOffer[];
  }
};

// Fonction de fallback pour retourner des données de test en cas d'erreur
const getFallbackJobOffers = (): JobOffer[] => {
  console.log('⚠️ [useJobOffers] Using fallback data - this might explain why only 2 jobs are visible');
  return [
    {
      id: 'fallback-1',
      title: 'Directeur Juridique, Communication & RSE',
      description: 'Poste de direction Juridique, Communication et RSE pour la SEEG',
      location: 'Libreville',
      contract_type: 'CDI',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recruiter_id: 'fallback-recruiter',
      candidate_count: 0,
      new_candidates: 0,
    },
    {
      id: 'fallback-2',
      title: 'Directeur des Systèmes d\'Information',
      description: 'Poste de direction SI pour la SEEG',
      location: 'Libreville',
      contract_type: 'CDI',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recruiter_id: 'fallback-recruiter',
      candidate_count: 0,
      new_candidates: 0,
    },
    {
      id: 'fallback-3',
      title: 'Directeur Audit & Contrôle interne',
      description: 'Poste de direction Audit et Contrôle interne pour la SEEG',
      location: 'Libreville',
      contract_type: 'CDI',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recruiter_id: 'fallback-recruiter',
      candidate_count: 0,
      new_candidates: 0,
    }
  ];
};

export function useJobOffers(audience?: string | null) {
  return useQuery<JobOffer[], Error>({
    queryKey: ['jobOffers', audience ?? 'unknown'],
    queryFn: fetchJobOffers,
  });
}

const fetchJobOffer = async (id: string): Promise<JobOffer | null> => {
  if (!id) return null;

  // 1. Fetch the single job offer
  const { data: offer, error } = await supabase
    .from('job_offers')
    .select('*')
    .eq('id', id)
    .single();

  // console.log('[useJobOffers DEBUG] Raw offer data from DB:', offer);
  // console.log('[useJobOffers DEBUG] DB error:', error);

  if (error) throw error;
  if (!offer) return null;

  // 2. Fetch applications for this offer using RPC function
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  let applications: Array<{ created_at: string }> = [];
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_recruiter_applications');
    
    if (rpcError) {
      console.warn('RPC get_all_recruiter_applications failed for job offer:', rpcError.message);
      applications = [];
    } else {
      const CAMPAIGN_START = new Date('2025-09-25');
      applications = (rpcData || [])
        .filter((app: any) => app.application_details?.job_offer_id === id)
        .filter((app: any) => {
          const createdAt = app?.application_details?.created_at;
          if (!createdAt) return false;
          return new Date(createdAt) >= CAMPAIGN_START;
        })
        .map((app: any) => ({
          created_at: app.application_details?.created_at
        }))
        .filter(app => app.created_at);
    }
  } catch (e) {
    console.warn('Error calling RPC get_all_recruiter_applications for job offer:', e);
    applications = [];
  }

  // 3. Calculate counts
  const candidate_count = applications?.length || 0;
  const new_candidates = (applications || []).filter(app => new Date(app.created_at) > new Date(twentyFourHoursAgo)).length;

  // 4. Combine and return
  return {
    ...offer,
    candidate_count,
    new_candidates,
  };
};

export function useJobOffer(id: string | undefined) {
  return useQuery<JobOffer | null, Error>({
    queryKey: ['jobOffer', id],
    queryFn: () => {
      if (!id) return Promise.resolve(null);
      return fetchJobOffer(id);
    },
    enabled: !!id, // The query will not run until the job ID exists
  });
}

// Fetch job offers for a specific recruiter and calculate application count on the client-side
const fetchRecruiterJobOffers = async (recruiterId: string): Promise<JobOffer[]> => {
  // 1. Fetch all job offers for the recruiter
  const { data: offers, error: offersError } = await supabase
    .from('job_offers')
    .select('*')
    .eq('recruiter_id', recruiterId);

  if (offersError) throw new Error(offersError.message);
  if (!offers || offers.length === 0) return [];

  // 2. Récupérer les candidatures via RPC par offre (signature 1-argument)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let applications: Array<{ job_offer_id: string; created_at: string }> = [];
  try {
    // Vérifier d'abord si l'utilisateur est authentifié
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_recruiter_applications');
      
      if (rpcError) {
        console.warn('RPC get_all_recruiter_applications failed for recruiter:', rpcError.message);
        // Si l'erreur est liée aux permissions, on continue sans les données de candidatures
        if (rpcError.message.includes('permission') || rpcError.message.includes('access denied')) {
          // console.log('User does not have permission to access recruiter applications, continuing without application data');
        } else {
          console.error('Unexpected RPC error:', rpcError);
        }
        applications = [];
      } else {
        applications = (rpcData || []).map((app: any) => ({
          job_offer_id: app.application_details?.job_offer_id,
          created_at: app.application_details?.created_at,
        })).filter(app => app.job_offer_id && app.created_at);
      }
    } else {
      // console.log('User not authenticated, skipping application data');
      applications = [];
    }
  } catch (e) {
    console.warn('Error calling RPC get_all_recruiter_applications for recruiter:', e);
    applications = [];
  }

  // 3. Count total and new applications for each offer
  const applicationStats = (applications || []).reduce((acc, app) => {
    if (!acc[app.job_offer_id]) {
      acc[app.job_offer_id] = { total: 0, new: 0 };
    }
    acc[app.job_offer_id].total += 1;
    if (new Date(app.created_at) > new Date(twentyFourHoursAgo)) {
      acc[app.job_offer_id].new += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; new: number }>);

  // 4. Combine offers with their application counts
  return offers.map(offer => ({
    ...offer,
    candidate_count: applicationStats[offer.id]?.total || 0,
    new_candidates: applicationStats[offer.id]?.new || 0,
  }));
};

export function useRecruiterJobOffers(recruiterId: string | undefined) {
  return useQuery<JobOffer[], Error>({
    queryKey: ['recruiterJobOffers', recruiterId],
    queryFn: () => {
      // This check ensures recruiterId is defined before calling the fetch function.
      if (!recruiterId) {
        return Promise.resolve([]);
      }
      return fetchRecruiterJobOffers(recruiterId);
    },
    enabled: !!recruiterId,
  });
}