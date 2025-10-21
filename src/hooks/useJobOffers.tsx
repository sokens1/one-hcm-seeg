/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CAMPAIGN_MODE, CAMPAIGN_JOBS, CAMPAIGN_JOB_PATTERNS } from "@/config/campaign";
import { getVisibleCampaignsForCandidates, CAMPAIGN_CONFIG } from "@/config/campaigns";
import { useAuth } from "./useAuth";

// Import des périodes de campagne pour vérifier si terminées
const CAMPAIGN_PERIODS = CAMPAIGN_CONFIG.CAMPAIGNS;

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
  // Campaign
  campaign_id?: number | null;
  candidate_count: number;
  new_candidates: number;
}

const fetchJobOffers = async () => {
  try {
    // Récupérer les informations de l'utilisateur connecté
    let candidateStatus: string | null = null;
    let isCandidate = false;
    let isRecruiter = false;
    let isAuthenticated = false;
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      if (uid) {
        isAuthenticated = true;
        const { data: userData } = await supabase
          .from('users')
          .select('role, candidate_status, matricule')
          .eq('id', uid)
          .maybeSingle();
        
        if (userData) {
          const role = userData.role;
          isCandidate = role === 'candidat' || role === 'candidate';
          isRecruiter = role === 'recruteur' || role === 'recruiter' || role === 'admin' || role === 'observateur' || role === 'observer';
          // Déterminer le statut même si le rôle n'est pas explicitement "candidat"
          // Priorité: candidate_status > matricule (présence => interne)
          candidateStatus = (userData as any)?.candidate_status
            || ((userData as any)?.matricule ? 'interne' : null);
          
          // console.log('🔍 [fetchJobOffers] User info:', {
          //   isCandidate,
          //   isRecruiter,
          //   isAuthenticated,
          //   candidateStatus,
          //   userId: uid
          // });
        }
      }
    } catch (e) {
      // Fail soft if we cannot determine user info
      console.warn('[fetchJobOffers] Could not determine user info:', e);
      candidateStatus = null;
      isCandidate = false;
      isRecruiter = false;
      isAuthenticated = false;
    }

    // 1. Fetch job offers based on user role
    // Candidats : seulement les offres actives
    // Recruteurs/Admins : toutes les offres (actives et inactives)
    let offers: any[] | null = null;
    let queryError: any = null;
    try {
      let query = supabase
        .from('job_offers')
        .select('id,title,description,location,contract_type,requirements,status,status_offerts,created_at,updated_at,recruiter_id,categorie_metier,date_limite,reporting_line,job_grade,salary_note,start_date,responsibilities,mtp_questions_metier,mtp_questions_talent,mtp_questions_paradigme,campaign_id')
        .order('created_at', { ascending: false });

      // Filtrer par status selon le type d'utilisateur
      if (isCandidate || !isAuthenticated) {
        // Candidats et visiteurs publics : seulement les offres actives (pas de brouillons)
        query = query.eq('status', 'active');
        // console.log('🔒 [fetchJobOffers] Mode candidat/public : filtrage status=active (pas de brouillons)');
      } else if (isRecruiter) {
        // Recruteurs : toutes les offres (actives, brouillons, inactives)
        // console.log('👔 [fetchJobOffers] Mode recruteur : toutes les offres (y compris brouillons)');
      } else {
        // Par défaut : seulement actives
        query = query.eq('status', 'active');
        // console.log('🔒 [fetchJobOffers] Mode par défaut : filtrage status=active');
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
          
          // Filtrer par status selon le type d'utilisateur
          if (isCandidate || !isAuthenticated) {
            fallbackQuery = fallbackQuery.eq('status', 'active');
          } else if (!isRecruiter) {
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
    // MODE CAMPAGNE COMPLÈTEMENT DÉSACTIVÉ - Compter toutes les candidatures
    // console.log(`✅ [NO CAMPAIGN] Toutes les candidatures comptées: ${(applications || []).length} candidatures`);

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
    const offersWithStats = offers.map(offer => ({
      ...offer,
      candidate_count: applicationStats[offer.id]?.total || 0,
      new_candidates: applicationStats[offer.id]?.new || 0,
    }));

    // 4.5. Filter offers based on candidate status (internal/external)
    // IMPORTANT : Ce filtrage s'applique à tout UTILISATEUR AUTHENTIFIÉ NON-RECRUTEUR
    // Les recruteurs/admins/observateurs voient TOUTES les offres
    const offersFilteredByStatus = offersWithStats.filter(offer => {
      // Appliquer le filtre d'audience aux utilisateurs connectés non-recruteurs
      const shouldApplyAudienceFilter = isAuthenticated && !isRecruiter;
      if (!shouldApplyAudienceFilter) {
        return true;
      }
      
      // À partir d'ici, on sait que c'est un utilisateur connecté non-recruteur
      
      // Définir le statut de l'offre (externe par défaut si NULL)
      const offerStatus = offer.status_offerts || 'externe';
      
      // Définir le statut du candidat (externe par défaut si NULL)
      const userStatus = candidateStatus || 'externe';
      
      // RÈGLE D'AUDIENCE :
      // - Candidat EXTERNE : voit SEULEMENT les offres externes
      // - Candidat INTERNE : voit TOUTES les offres (internes + externes)
      if (userStatus === 'interne') {
        // console.log(`✅ [FILTER] "${offer.title}" (${offerStatus}) - Visible (candidat interne voit tout)`);
        return true; // Les internes voient tout
      } else if (userStatus === 'externe' && offerStatus === 'externe') {
        // console.log(`✅ [FILTER] "${offer.title}" (${offerStatus}) - Visible (candidat externe voit externe)`);
        return true; // Les externes voient seulement les offres externes
      } else {
        // console.log(`🚫 [FILTER] "${offer.title}" (${offerStatus}) - Masquée (candidat ${userStatus} ne peut pas voir ${offerStatus})`);
        return false;
      }
    });

    if (isCandidate) {
      // console.log(`📊 [FILTER CANDIDAT] Offres visibles: ${offersFilteredByStatus.length}/${offersWithStats.length} (Statut: ${candidateStatus || 'non défini'})`);
    } else {
      // console.log(`📊 [FILTER NON-CANDIDAT] Toutes les offres visibles: ${offersFilteredByStatus.length} offres`);
    }

    // 5. FILTRAGE PAR CAMPAGNE
    // - Visiteurs NON CONNECTÉS (vue publique) : Ne voient PAS les campagnes terminées (endDate passée)
    // - Candidats connectés : Voient les campagnes 2 et 3 (même si terminées, filtrage par date_limite)
    // - Recruteurs/Admins : Voient TOUTES les campagnes (1, 2, 3)
    const offersFilteredByCampaign = offersFilteredByStatus.filter(offer => {
      // Si l'utilisateur est un RECRUTEUR, montrer TOUTES les campagnes
      if (isRecruiter) {
        return true;
      }
      
      const offerCampaignId = offer.campaign_id;
      
      // Si l'offre n'a pas de campaign_id, on la montre par défaut
      if (!offerCampaignId) {
        // console.log(`⚠️ [CAMPAIGN FILTER] "${offer.title}" - Pas de campaign_id, visible par défaut`);
        return true;
      }
      
      // Masquer toujours la campagne 1 (historique)
      if (offerCampaignId === 1) {
        // console.log(`🚫 [CAMPAIGN FILTER] "${offer.title}" (Campagne 1) - Masquée (historique)`);
        return false;
      }
      
      // NOUVELLE LOGIQUE POUR VUE PUBLIQUE vs VUE CANDIDAT
      if (!isAuthenticated) {
        // VUE PUBLIQUE : Masquer campagne 2 après le 22/10/2025 00:00
        if (offerCampaignId === 2) {
          const now = new Date();
          const campaign2EndDate = new Date('2025-10-22T00:00:00');
          if (now >= campaign2EndDate) {
            // console.log(`🚫 [PUBLIC FILTER] "${offer.title}" (Campagne 2) - Après le 22/10 00:00 - Masquée pour le public`);
            return false;
          }
        }
        
        // Campagnes 2 et 3 visibles pour le public (sauf campagne 2 après le 22/10 00:00)
        const visibleCampaigns = [2, 3];
        if (visibleCampaigns.includes(offerCampaignId)) {
          // console.log(`✅ [PUBLIC FILTER] "${offer.title}" (Campagne ${offerCampaignId}) - Visible`);
          return true;
        } else {
          // console.log(`🚫 [PUBLIC FILTER] "${offer.title}" (Campagne ${offerCampaignId}) - Masquée`);
          return false;
        }
      } else {
        // VUE CANDIDAT : Montrer campagnes 2 et 3 (même après le 21/10)
        // Le filtrage par date_limite se fera après pour masquer les offres expirées
        const visibleCampaigns = [2, 3];
        if (visibleCampaigns.includes(offerCampaignId)) {
          // console.log(`✅ [CANDIDAT FILTER] "${offer.title}" (Campagne ${offerCampaignId}) - Visible`);
          return true;
        } else {
          // console.log(`🚫 [CANDIDAT FILTER] "${offer.title}" (Campagne ${offerCampaignId}) - Masquée`);
          return false;
        }
      }
    });

    if (isCandidate) {
      // console.log(`📊 [FILTER CAMPAGNE] Offres visibles après filtrage campagne: ${offersFilteredByCampaign.length}/${offersFilteredByStatus.length}`);
    }

    // 6. FILTRAGE PAR DATE LIMITE EXPIRÉE
    // - Recruteurs : Voient TOUTES les offres (même expirées)
    // - Candidats/Public : Ne voient PAS les offres dont la date_limite est passée
    const now = new Date();
    const offersFilteredByDate = offersFilteredByCampaign.filter(offer => {
      // Si l'utilisateur est un RECRUTEUR, montrer TOUTES les offres (même expirées)
      if (isRecruiter) {
        return true;
      }
      
      // À partir d'ici : Candidat OU Visiteur non connecté
      const dateLimite = offer.date_limite;
      
      // Si pas de date limite, l'offre est toujours visible
      if (!dateLimite) {
        return true;
      }
      
      // Vérifier si la date limite est dépassée
      const deadline = new Date(dateLimite);
      if (now > deadline) {
        // console.log(`⏰ [DATE FILTER] "${offer.title}" - Date limite dépassée (${dateLimite}) - Masquée`);
        return false; // Masquer l'offre expirée
      }
      
      return true; // Offre encore valide
    });

    if (isCandidate || !isAuthenticated) {
      // console.log(`📊 [FILTER DATE] Offres visibles après filtrage date: ${offersFilteredByDate.length}/${offersFilteredByCampaign.length}`);
    }

    // console.log(`✅ [FINAL] Offres affichées: ${offersFilteredByDate.length} offres`);
    
    return offersFilteredByDate;
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
  // console.log('⚠️ [useJobOffers] Using fallback data - this might explain why only 2 jobs are visible');
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
    staleTime: 5 * 60 * 1000,        // 5 minutes - Données considérées fraîches pendant 5 min
    gcTime: 10 * 60 * 1000,          // 10 minutes - Cache maintenu 10 min
    refetchOnWindowFocus: false,     // Ne pas recharger au focus de la fenêtre
    refetchOnMount: false,           // Ne pas recharger au montage si cache valide
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
      // MODE CAMPAGNE COMPLÈTEMENT DÉSACTIVÉ - Récupérer toutes les candidatures
      applications = (rpcData || [])
        .filter((app: any) => app.application_details?.job_offer_id === id)
        .map((app: any) => ({
          created_at: app.application_details?.created_at
        }))
        .filter(app => app.created_at);
      
      // console.log(`✅ [NO CAMPAIGN] Toutes les candidatures pour l'offre ${id}: ${applications.length} candidatures`);
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