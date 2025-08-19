import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  location: string;
  contract_type: string;
  profile?: string | null;
  department?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  requirements?: string[] | null;
  benefits?: string[] | null;
  status: string;
  application_deadline: string | null;
  created_at: string;
  updated_at: string;
  recruiter_id: string;
  application_count?: number;
}

const fetchJobOffers = async () => {
  const { data, error } = await supabase
    .from('job_offers')
    .select('id,title,description,location,contract_type,profile,department,salary_min,salary_max,requirements,benefits,status,application_deadline,created_at,updated_at,recruiter_id')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export function useJobOffers() {
  return useQuery<JobOffer[], Error>({
    queryKey: ['jobOffers'],
    queryFn: fetchJobOffers,
  });
}

const fetchJobOffer = async (id: string) => {
  if (!id) return null;

  const { data, error } = await supabase
    .from('job_offers')
    .select('id,title,description,location,contract_type,profile,department,salary_min,salary_max,requirements,benefits,status,application_deadline,created_at,updated_at,recruiter_id')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export function useJobOffer(id: string) {
  return useQuery<JobOffer | null, Error>({
    queryKey: ['jobOffer', id],
    queryFn: () => fetchJobOffer(id),
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

  const offerIds = offers.map(o => o.id);

  // 2. Fetch all applications for those job offers
  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select('job_offer_id')
    .in('job_offer_id', offerIds);

  if (applicationsError) throw new Error(applicationsError.message);

  // 3. Count applications for each offer
  const applicationCounts = applications.reduce((acc, app) => {
    acc[app.job_offer_id] = (acc[app.job_offer_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 4. Combine offers with their application counts
  return offers.map(offer => ({
    ...offer,
    application_count: applicationCounts[offer.id] || 0,
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