import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Application {
  id: string;
  candidate_id: string;
  job_offer_id: string;
  cover_letter: string | null;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  motivation: string | null;
  availability_start: string | null;
  candidate_references?: string | null; // Database field name
  ref_contacts?: string | null; // API compatibility
  created_at: string;
  updated_at: string;
  job_offers?: {
    title: string;
    location: string;
    contract_type: string;
  };
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function useApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job_offers (title, location, contract_type),
          users (first_name, last_name, email)
        `)
        .eq('candidate_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data as Application[] || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const submitApplication = async (applicationData: {
    job_offer_id: string;
    cover_letter: string;
    motivation?: string;
    availability_start?: string;
    ref_contacts?: string;
  }) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('applications')
      .insert([{
        candidate_id: user.id,
        ...applicationData
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Refresh applications list
    await fetchApplications();
    
    return data;
  };

  return {
    applications,
    isLoading,
    error,
    submitApplication,
    refetch: fetchApplications
  };
}

export function useRecruiterApplications(jobOfferId?: string) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from('applications')
        .select(`
          *,
          job_offers!inner (title, location, contract_type, recruiter_id),
          users (first_name, last_name, email, phone)
        `)
        .eq('job_offers.recruiter_id', user.id);

      if (jobOfferId) {
        query = query.eq('job_offer_id', jobOfferId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data as Application[] || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user, jobOfferId]);

  const updateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) throw error;
    
    // Refresh applications list
    await fetchApplications();
  };

  return {
    applications,
    isLoading,
    error,
    updateApplicationStatus,
    refetch: fetchApplications
  };
}