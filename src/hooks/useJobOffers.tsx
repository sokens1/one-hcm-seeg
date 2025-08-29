/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  responsibilities?: string | string[] | null;
  candidate_count: number;
  new_candidates: number;
}

const fetchJobOffers = async () => {
  try {
    // 1. Fetch all active job offers
    const { data: offers, error } = await supabase
      .from('job_offers')
      .select('id,title,description,location,contract_type,requirements,status,created_at,updated_at,recruiter_id,categorie_metier,date_limite,reporting_line,job_grade,salary_note,start_date,responsibilities')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[useJobOffers] Error fetching job offers:', error);
      
      // If it's a 500 error (RLS issue), return fallback data
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        console.warn('[useJobOffers] Server error detected, returning fallback data');
        return getFallbackJobOffers();
      }
      
      throw error;
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
  } catch (error) {
    console.error('[useJobOffers] Unexpected error:', error);
    // Return fallback data in case of any error
    return getFallbackJobOffers();
  }
};

// Fonction de fallback pour retourner des données de test en cas d'erreur
const getFallbackJobOffers = (): JobOffer[] => {
  console.log('[useJobOffers] Using fallback data');
  return [
    {
      id: 'fallback-1',
      title: 'Directeur des Ressources Humaines',
      description: 'Poste de direction RH pour la SEEG',
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

  console.log('[useJobOffers DEBUG] Raw offer data from DB:', offer);
  console.log('[useJobOffers DEBUG] DB error:', error);

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
      applications = (rpcData || [])
        .filter((app: any) => app.application_details?.job_offer_id === id)
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
          console.log('User does not have permission to access recruiter applications, continuing without application data');
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
      console.log('User not authenticated, skipping application data');
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