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
  years_experience: number | string;
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
  const { user, isRecruiter, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const fetchApplications = async () => {
    if (!user) return [];

    // Si l'utilisateur est un candidat, utiliser la fonction RPC spécifique
    if (!isRecruiter && !isAdmin) {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_candidate_applications');

      if (rpcError) {
        console.error('Erreur RPC candidat applications:', rpcError);
        throw new Error(rpcError.message);
      }

      // Transformer les données RPC au format attendu
      const applications = (rpcData || []).map((app: any) => ({
        ...app.application_details,
        job_offers: app.job_offer_details,
        users: {
          ...app.candidate_details,
          candidate_profiles: app.candidate_details?.candidate_profiles
        }
      }));

      return applications as Application[];
    }

    // Pour les recruteurs/admins, utiliser l'ancienne méthode directe
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
      // Ajout des données de profil candidat
      profile_data?: {
        gender?: string;
        current_position?: string;
        date_of_birth?: string;
        years_of_experience?: string;
      };
    }) => {
      if (!user) throw new Error("User not authenticated");


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

      // Sauvegarder les données de profil candidat si fournies
      if (applicationData.profile_data && user?.id) {
        const profilePayload: { [key: string]: unknown } = { user_id: user.id };

        if (applicationData.profile_data.gender) {
          profilePayload.gender = applicationData.profile_data.gender;
        }
        if (applicationData.profile_data.current_position) {
          profilePayload.current_position = applicationData.profile_data.current_position;
        }
        // Assurer que years_experience est un nombre pour correspondre au type de la DB
        if (applicationData.profile_data.years_of_experience !== undefined) {
          profilePayload.years_experience = parseInt(applicationData.profile_data.years_of_experience) || 0;
        }
        if (applicationData.profile_data.date_of_birth) {
          profilePayload.birth_date = applicationData.profile_data.date_of_birth;
        }

        // Ne tenter l'upsert que si on a plus que user_id
        if (Object.keys(profilePayload).length > 1) {
          const { error: profileError } = await supabase
            .from('candidate_profiles')
            .upsert(profilePayload, { onConflict: 'user_id' });

          if (profileError) {
            console.warn('Erreur lors de la mise à jour du profil candidat:', profileError);
            // Ne pas faire échouer la candidature si le profil ne peut pas être sauvegardé
          }
        }
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
  const { user, isRecruiter, isAdmin } = useAuth();
  const isObserver = (useAuth() as any)?.isObserver as boolean | undefined;

  return useQuery({
    queryKey: ['application', id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;

      // Si l'utilisateur est un candidat, utiliser la fonction spécifique aux candidats
      // NOTE: les observateurs doivent être traités comme recruteurs (lecture seule)
      if (!isRecruiter && !isAdmin && !isObserver) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_candidate_application', {
          p_application_id: id
        });

        if (rpcError) {
          console.error('Erreur RPC candidat:', rpcError);
          throw new Error(rpcError.message);
        }

        if (!rpcData || rpcData.length === 0) return null;

        const rpcResult = rpcData[0];
        const application = {
          ...rpcResult.application_details,
          job_offers: rpcResult.job_offer_details,
          users: {
            ...rpcResult.candidate_details,
            candidate_profiles: rpcResult.candidate_details?.candidate_profiles
          }
        };
        return application as Application;
      }

      // Pour les recruteurs/admins/observateurs, utiliser la logique recruteur via RPC enrichie
      // Étape 1: récupérer l'offre liée pour connaître le job_offer_id
      let jobOfferId: string | null = null;
      try {
        const { data: baseApp, error: baseErr } = await supabase
          .from('applications')
          .select('id, job_offer_id')
          .eq('id', id)
          .maybeSingle();
        if (baseErr) throw baseErr;
        jobOfferId = baseApp?.job_offer_id ?? null;
      } catch (e) {
        // Si la politique RLS empêche cette lecture, on fera un fallback ci-dessous
        jobOfferId = null;
      }

      // Étape 2: si on a un job_offer_id, on utilise la RPC 1-argument
      if (jobOfferId) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_recruiter_applications', {
          p_job_offer_id: jobOfferId
        });

        if (rpcError) {
          console.error('Erreur RPC (par offre):', rpcError);
          throw new Error(rpcError.message);
        }

        const rpcResult = (rpcData || []).find((app: any) => app?.application_details?.id === id);
        if (!rpcResult) return null;

        const application = {
          ...rpcResult.application_details,
          job_offers: rpcResult.job_offer_details,
          users: {
            ...rpcResult.candidate_details,
            candidate_profiles: rpcResult.candidate_details?.candidate_profiles
          }
        };
        return application as Application;
      }

      // Étape 3 (fallback): récupérer toutes les offres actives et chercher l'application via RPC par offre
      const { data: offers } = await supabase
        .from('job_offers')
        .select('id')
        .eq('status', 'active');

      const offerIds = (offers || []).map(o => o.id);
      for (const oid of offerIds) {
        const { data: rpcData } = await supabase.rpc('get_recruiter_applications', { p_job_offer_id: oid });
        const rpcResult = (rpcData || []).find((app: any) => app?.application_details?.id === id);
        if (rpcResult) {
          const application = {
            ...rpcResult.application_details,
            job_offers: rpcResult.job_offer_details,
            users: {
              ...rpcResult.candidate_details,
              candidate_profiles: rpcResult.candidate_details?.candidate_profiles
            }
          };
          return application as Application;
        }
      }

      return null;
    },
    enabled: !!id && !!user,
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
  const { user, isRecruiter, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['recruiterApplications', user?.id, jobOfferId];

  const fetchRecruiterApplications = async () => {
    if (!user) {
      return [];
    }

    let entries: any[] = [];
    if (jobOfferId) {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_recruiter_applications', { p_job_offer_id: jobOfferId });
      if (rpcError) {
        console.error('[useRecruiterApplications] Erreur RPC (par offre):', rpcError);
        throw new Error(`Erreur lors de la récupération des candidatures: ${rpcError.message}`);
      }
      entries = rpcData || [];
    } else {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_recruiter_applications');
      if (rpcError) {
        console.error('[useRecruiterApplications] Erreur RPC optimisée:', rpcError);
        throw new Error(`Erreur lors de la récupération des candidatures: ${rpcError.message}`);
      }
      entries = rpcData || [];
    }

    // Les données sont déjà enrichies par la fonction RPC
    const applications = (entries || []).map((app: any) => ({
      ...app.application_details,
      job_offers: app.job_offer_details,
      users: app.candidate_details,
    }));

    return applications as Application[];
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