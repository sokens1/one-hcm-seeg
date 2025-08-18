import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  location: string;
  contract_type: string;
  department: string | null;
  salary_min: number | null;
  salary_max: number | null;
  requirements: string[] | null;
  benefits: string[] | null;
  status: string;
  application_deadline: string | null;
  created_at: string;
  updated_at: string;
  recruiter_id: string;
}

export function useJobOffers() {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobOffers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('job_offers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobOffers(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobOffers();
  }, []);

  return {
    jobOffers,
    isLoading,
    error,
    refetch: fetchJobOffers
  };
}

export function useJobOffer(id: string) {
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobOffer = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('job_offers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setJobOffer(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobOffer();
    }
  }, [id]);

  return {
    jobOffer,
    isLoading,
    error,
    refetch: fetchJobOffer
  };
}