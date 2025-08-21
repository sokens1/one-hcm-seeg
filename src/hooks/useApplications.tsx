/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useState, useEffect, useCallback } from "react"; // Keep for useRecruiterApplications

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
}

export interface Skill {
  id: string;
  name: string;
}

export interface CandidateProfile {
  id: string;
  gender: string;
  date_of_birth: string;
  current_position: string;
  address: string;
  linkedin_profile: string;
  portfolio_url: string;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
}

export interface Application {
  id: string;
  candidate_id: string;
  job_offer_id: string;
  cover_letter: string | null;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  motivation: string | null;
  availability_start: string | null;
  reference_contacts?: string | null; // Database column name
  ref_contacts?: string | null; // API compatibility alias used by UI
  mtp_answers?: {
    metier?: string[];
    talent?: string[];
    paradigme?: string[];
  } | null;
  created_at: string;
  updated_at: string;
  job_offers?: {
    date_limite: string;
    title: string;
    location: string;
    contract_type: string;
    recruiter_id?: string;
  } | null;
  users: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    candidate_profiles?: CandidateProfile;
  } | null;
}

// Hook for candidates, refactored with React Query
// Hook pour vérifier si un candidat a déjà postulé pour un poste
export function useApplicationStatus(jobOfferId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['applicationStatus', user?.id, jobOfferId],
    queryFn: async () => {
      if (!user || !jobOfferId) return null;

      const { data, error } = await supabase
        .from('applications')
        .select('id, status, created_at')
        .eq('candidate_id', user.id)
        .eq('job_offer_id', jobOfferId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!user && !!jobOfferId,
  });
}

export function useApplications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchApplications = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job_offers (
          title,
          location,
          contract_type,
          date_limite
        )
      `)
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Application[];
  };

  const query = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: fetchApplications,
    enabled: !!user, // Only run the query if the user is authenticated
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: {
      job_offer_id: string;
      ref_contacts?: string;
      mtp_answers: {
        metier: string[];
        talent: string[];
        paradigme: string[];
      };
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Vérifier que l'utilisateur existe dans la table users
      const { data: userRow, error: userSelectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (userSelectError) {
        throw new Error(`Impossible de vérifier votre profil utilisateur: ${userSelectError.message}`);
      }

      if (!userRow) {
        // Tentative d'auto-réparation: créer le profil utilisateur minimal depuis les métadonnées auth
        const meta = (
          (user as unknown as { user_metadata?: Record<string, unknown> })?.user_metadata
        ) ?? {};

        const getStr = (key: string): string | undefined => {
          const val = (meta as Record<string, unknown>)[key];
          return typeof val === 'string' ? val : undefined;
        };

        let firstName: string | undefined = getStr('first_name') || getStr('prenom') || getStr('given_name');
        let lastName: string | undefined = getStr('last_name') || getStr('nom') || getStr('family_name');
        const fullName: string | undefined = getStr('name');
        if ((!firstName || !lastName) && typeof fullName === 'string') {
          const parts = fullName.trim().split(/\s+/);
          if (!firstName && parts.length > 0) firstName = parts[0];
          if (!lastName && parts.length > 1) lastName = parts.slice(1).join(' ');
        }

        const upsertPayload: Record<string, unknown> = {
          id: user.id,
          email: user.email,
        };
        if (firstName) upsertPayload.first_name = firstName;
        if (lastName) upsertPayload.last_name = lastName;

        const { error: upsertError } = await supabase
          .from('users')
          .upsert(upsertPayload, { onConflict: 'id' });

        if (upsertError) {
          // Si la politique RLS empêche l'upsert, demander à l'utilisateur de se reconnecter
          throw new Error(`Profil utilisateur non trouvé et impossible de le créer automatiquement. Veuillez vous reconnecter. Détail: ${upsertError.message}`);
        }
      }

      // Vérifier si une candidature existe déjà
      const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('candidate_id', user.id)
        .eq('job_offer_id', applicationData.job_offer_id)
        .maybeSingle();

      if (existingApplication) {
        throw new Error("Vous avez déjà postulé pour cette offre d'emploi");
      }

      // Build payload and map API field to DB column
      const payload: Record<string, unknown> = {
        candidate_id: user.id,
        job_offer_id: applicationData.job_offer_id,
        mtp_answers: applicationData.mtp_answers,
      };
      if (applicationData.ref_contacts !== undefined) payload.reference_contacts = applicationData.ref_contacts;

      const { data, error } = await supabase
        .from('applications')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        // Si l'erreur est une violation de contrainte unique, renvoyer un message clair
        if (error.code === '23505') { // code d'erreur PostgreSQL pour violation unique
          throw new Error("Vous avez déjà postulé à cette offre.");
        }
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch the applications query to show the new application
      queryClient.invalidateQueries({ queryKey: ['applications', user?.id] });
    },
  });

  return {
    ...query,
    submitApplication: submitApplicationMutation.mutateAsync,
  };
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          mtp_answers,
          job_offers (*),
          users!inner (
            first_name, 
            last_name, 
            email, 
            phone,
            date_of_birth
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur requête application:', error);
        throw new Error(error.message);
      }
      return data as Application;
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useCandidateExperiences(profileId: string | undefined) {
  return useQuery({
    queryKey: ['experiences', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', profileId);
      if (error) throw new Error(error.message);
      return data as Experience[];
    },
    enabled: !!profileId,
  });
}

export function useCandidateEducations(profileId: string | undefined) {
  return useQuery({
    queryKey: ['educations', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from('educations')
        .select('*')
        .eq('profile_id', profileId);
      if (error) throw new Error(error.message);
      return data as Education[];
    },
    enabled: !!profileId,
  });
}

export function useCandidateSkills(profileId: string | undefined) {
  return useQuery({
    queryKey: ['skills', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('profile_id', profileId);
      if (error) throw new Error(error.message);
      return data as Skill[];
    },
    enabled: !!profileId,
  });
}

export function useRecruiterApplications(jobOfferId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['recruiterApplications', user?.id, jobOfferId];

  const fetchRecruiterApplications = async () => {
    if (!user) return [];

    const { data: jobOffers, error: jobOffersError } = await supabase
      .from('job_offers')
      .select('id')
      .eq('recruiter_id', user.id);

    if (jobOffersError) throw new Error(jobOffersError.message);
    if (!jobOffers || jobOffers.length === 0) return [];

    const jobOfferIds = jobOffers.map(jo => jo.id);

    let query = supabase
      .from('applications')
      .select(`
        *,
        job_offers (title, location, contract_type, recruiter_id),
        users (first_name, last_name, email, phone, date_of_birth)
      `)
      .in('job_offer_id', jobOfferIds);

    if (jobOfferId) {
      query = query.eq('job_offer_id', jobOfferId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const apps = (data as Application[]) || [];
    // Enrichir avec candidate_profiles (gender, current_position, birth_date)
    const candidateIds = Array.from(new Set(apps.map(a => a.candidate_id).filter(Boolean)));
    if (candidateIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('candidate_profiles')
        .select('user_id, gender, current_position, birth_date')
        .in('user_id', candidateIds as string[]);

      if (!profilesError && profiles) {
        const byUser: Record<string, { user_id: string; gender?: string; current_position?: string; birth_date?: string | null }> = {};
        for (const p of profiles as any[]) byUser[p.user_id] = p;
        apps.forEach(app => {
          const p = byUser[app.candidate_id];
          if (p) {
            const mappedProfile: CandidateProfile = {
              id: p.user_id,
              gender: p.gender || '',
              date_of_birth: p.birth_date || '',
              current_position: p.current_position || '',
              address: '',
              linkedin_profile: '',
              portfolio_url: '',
              experiences: [],
              educations: [],
              skills: [],
            };
            if (app.users) {
              (app.users as any).candidate_profiles = mappedProfile;
            }
          }
        });
      }
    }

    return apps;
  };

  const query = useQuery({
    queryKey,
    queryFn: fetchRecruiterApplications,
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: Application['status'] }) => {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    applications: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateApplicationStatus: updateStatusMutation.mutateAsync,
    refetch: query.refetch,
  };
}