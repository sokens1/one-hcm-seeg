/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CAMPAIGN_MODE, CAMPAIGN_JOBS, CAMPAIGN_JOB_PATTERNS } from "@/config/campaign";
import { useAuth } from "./useAuth";

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
  status_offerts?: string | null;
  responsibilities?: string | string[] | null;
  // MTP Questions
  mtp_questions_metier?: string[] | null;
  mtp_questions_talent?: string[] | null;
  mtp_questions_paradigme?: string[] | null;
  candidate_count: number;
  new_candidates: number;
}

const fetchJobOffers = async () => {
  try {
    // Récupérer les informations de l'utilisateur connecté
    let candidateStatus: string | null = null;
    let isCandidate = false;
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      if (uid) {
        const { data: userData } = await supabase
          .from('users')
          .select('role, candidate_status')
          .eq('id', uid)
          .maybeSingle();
        
        if (userData) {
          const role = userData.role;
          isCandidate = role === 'candidat' || role === 'candidate';
          candidateStatus = isCandidate ? (userData.candidate_status || null) : null;
          
          console.log('🔍 [fetchJobOffers] User info:', {
            isCandidate,
            candidateStatus,
            userId: uid
          });
        }
      }
    } catch (e) {
      // Fail soft if we cannot determine user info
      console.warn('[fetchJobOffers] Could not determine user info:', e);
      candidateStatus = null;
      isCandidate = false;
    }

    // 1. Fetch job offers based on user role
    // Candidats : seulement les offres actives
    // Recruteurs/Admins : toutes les offres (actives et inactives)
    let offers: any[] | null = null;
    let queryError: any = null;
    try {
      let query = supabase
        .from('job_offers')
        .select('id,title,description,location,contract_type,requirements,status,status_offerts,created_at,updated_at,recruiter_id,categorie_metier,date_limite,reporting_line,job_grade,salary_note,start_date,responsibilities,mtp_questions_metier,mtp_questions_talent,mtp_questions_paradigme')
        .order('created_at', { ascending: false });

      // Filtrer par status='active' uniquement pour les candidats
      if (isCandidate) {
        query = query.eq('status', 'active');
        console.log('🔒 [fetchJobOffers] Mode candidat : filtrage status=active');
      } else {
        console.log('👔 [fetchJobOffers] Mode recruteur : toutes les offres (actives et inactives)');
      }

      const { data, error } = await query;
      if (error) throw error;
      offers = data;
    } catch (err: any) {
      queryError = err;
      // If the error is due to unknown column (e.g., migration not applied yet), retry
      const isUnknownColumn = typeof err?.message === 'string' && (
        err.message.includes('column') && err.message.includes('status_offerts') ||
        err.message.includes('42703')
      );
      if (isUnknownColumn) {
        try {
          let fallbackQuery = supabase
            .from('job_offers')
            .select('id,title,description,location,contract_type,requirements,status,status_offerts,created_at,updated_at,recruiter_id,categorie_metier,date_limite,reporting_line,job_grade,salary_note,start_date,responsibilities,mtp_questions_metier,mtp_questions_talent,mtp_questions_paradigme')
            .order('created_at', { ascending: false });
          
          // Filtrer par status='active' uniquement pour les candidats
          if (isCandidate) {
            fallbackQuery = fallbackQuery.eq('status', 'active');
          }
          
          const { data, error } = await fallbackQuery;
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
    const offersWithStats = offers.map(offer => ({
      ...offer,
      candidate_count: applicationStats[offer.id]?.total || 0,
      new_candidates: applicationStats[offer.id]?.new || 0,
    }));

    // 4.5. Filter offers based on candidate status (internal/external)
    // IMPORTANT : Ce filtrage ne s'applique QUE aux candidats
    // Les recruteurs/admins/observateurs voient TOUTES les offres
    const offersFilteredByStatus = offersWithStats.filter(offer => {
      // Si l'utilisateur n'est PAS un candidat (recruteur, admin, observateur)
      // Montrer TOUTES les offres sans filtrage
      if (isCandidate === false) {
        return true;
      }
      
      // À partir d'ici, on sait que c'est un CANDIDAT
      
      // Définir le statut de l'offre (externe par défaut si NULL)
      const offerStatus = offer.status_offerts || 'externe';
      
      // Définir le statut du candidat (externe par défaut si NULL)
      const userStatus = candidateStatus || 'externe';
      
      // RÈGLE SIMPLE : Le candidat ne voit QUE les offres de son statut
      if (offerStatus === userStatus) {
        console.log(`✅ [FILTER] "${offer.title}" (${offerStatus}) - Visible (candidat ${userStatus})`);
        return true;
      } else {
        console.log(`🚫 [FILTER] "${offer.title}" (${offerStatus}) - Masquée (candidat ${userStatus} ne voit que ${userStatus})`);
        return false;
      }
    });

    if (isCandidate) {
      console.log(`📊 [FILTER CANDIDAT] Offres visibles: ${offersFilteredByStatus.length}/${offersWithStats.length} (Statut: ${candidateStatus || 'non défini'})`);
    } else {
      console.log(`📊 [FILTER NON-CANDIDAT] Toutes les offres visibles: ${offersFilteredByStatus.length} offres`);
    }

    // 5. MODE CAMPAGNE DÉSACTIVÉ - Retourner toutes les offres filtrées
    // CAMPAIGN_MODE = false, donc ce bloc ne s'exécute jamais
    console.log(`✅ [NO CAMPAIGN] Toutes les offres affichées: ${offersFilteredByStatus.length} offres`);
    
    return offersFilteredByStatus;
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

export function useJobOffers() {
  return useQuery<JobOffer[], Error>({
    queryKey: ['jobOffers'],
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