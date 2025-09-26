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
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse' | 'entretien_programme' | 'simulation_programmee';
  motivation: string | null;
  availability_start: string | null;
  reference_contacts?: string | null; // Deprecated
  ref_contacts?: string | null; // Deprecated
  reference_full_name?: string | null;
  reference_email?: string | null;
  reference_contact?: string | null;
  reference_company?: string | null;
  interview_date?: string | null; // Date et heure de l'entretien programmé
  simulation_date?: string | null; // Date et heure de la simulation programmée
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
      ref_contacts?: string; // deprecated
      reference_full_name?: string;
      reference_email?: string;
      reference_contact?: string;
      reference_company?: string;
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
        address?: string;
      };
      // Données utilisateur de base
      user_data?: {
        matricule?: string;
        phone?: string;
      };
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Vérifier si l'utilisateur est éligible pour la nouvelle campagne
      const campaignStartDate = new Date('2025-09-27T00:00:00.000Z');
      const userCreatedAt = new Date(user.created_at);
      const now = new Date();
      
      if (userCreatedAt < campaignStartDate) {
        throw new Error("Votre compte a été créé avant le 27/09/2025. Les candidatures ne sont ouvertes qu'aux utilisateurs créés à partir de cette date.");
      }
      
      if (now < campaignStartDate) {
        throw new Error("Les candidatures ne sont pas encore ouvertes. Elles seront disponibles à partir du 27/09/2025.");
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
      if (applicationData.reference_full_name) payload.reference_full_name = applicationData.reference_full_name;
      if (applicationData.reference_email) payload.reference_email = applicationData.reference_email;
      if (applicationData.reference_contact) payload.reference_contact = applicationData.reference_contact;
      if (applicationData.reference_company) payload.reference_company = applicationData.reference_company;

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

      // Sauvegarder les données utilisateur de base si fournies
      if (applicationData.user_data && user?.id) {
        const userUpdates: { [key: string]: unknown } = {};
        
        if (applicationData.user_data.matricule) {
          userUpdates.matricule = applicationData.user_data.matricule;
        }
        if (applicationData.user_data.phone) {
          userUpdates.phone = applicationData.user_data.phone;
        }

        if (Object.keys(userUpdates).length > 0) {
          const { error: userError } = await supabase
            .from('users')
            .update(userUpdates)
            .eq('id', user.id);

          if (userError) {
            console.warn('Erreur lors de la mise à jour des données utilisateur:', userError);
          }
        }
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
        if (applicationData.profile_data.address) {
          profilePayload.address = applicationData.profile_data.address;
        }

        // Ne tenter l'upsert que si on a plus que user_id
        if (Object.keys(profilePayload).length > 1) {
          const { error: profileError } = await supabase
            .from('candidate_profiles')
            .upsert(profilePayload, { onConflict: 'user_id' });

          if (profileError) {
            console.error('Erreur lors de la mise à jour du profil candidat:', profileError);
            // Ne pas faire échouer la candidature si le profil ne peut pas être sauvegardé
            // mais log l'erreur pour le debugging
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
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_recruiter_applications');

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
        const { data: rpcData } = await supabase.rpc('get_all_recruiter_applications');
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

    // Récupérer toutes les candidatures
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_recruiter_applications');
    if (rpcError) {
      console.error('[useRecruiterApplications] Erreur RPC:', rpcError);
      throw new Error(`Erreur lors de la récupération des candidatures: ${rpcError.message}`);
    }
    
    // Filtrer pour n'afficher que les candidatures de la nouvelle campagne
    const CAMPAIGN_START = new Date('2025-09-25');
    let entries: any[] = (rpcData || []).filter((app: any) => {
      const createdAt = app?.application_details?.created_at;
      if (!createdAt) return false;
      return new Date(createdAt) >= CAMPAIGN_START;
    });
    
    // Si un jobOfferId est spécifié, filtrer côté client
    if (jobOfferId) {
      entries = entries.filter((app: any) => 
        app.application_details?.job_offer_id === jobOfferId
      );
    }

    // Les données sont déjà enrichies par la fonction RPC
    const applications = (entries || []).map((app: any) => ({
      ...app.application_details,
      job_offers: app.job_offer_details,
      users: {
        ...app.candidate_details,
        candidate_profiles: app.candidate_details?.candidate_profiles
      },
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
      // console.log('🔧 [updateStatusMutation] Mise à jour du statut:', { applicationId, status });
      
      // Vérifier d'abord le rôle de l'utilisateur connecté
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role, email')
        .eq('id', user?.id)
        .single();

      // console.log('👤 [updateStatusMutation] Données utilisateur:', { userData, userError });

      if (userError || !userData) {
        throw new Error('Impossible de vérifier les permissions utilisateur');
      }

      // console.log('🔍 [updateStatusMutation] Rôle utilisateur:', userData.role);

      // Vérifier que l'utilisateur est bien un recruteur ou admin
      if (!['recruteur', 'admin', 'observateur'].includes(userData.role)) {
        throw new Error(`Accès refusé. Rôle requis: recruteur, admin ou observateur. Rôle actuel: ${userData.role}`);
      }

      // Méthode 1: Essayer avec une requête directe incluant le contexte
      // console.log('🔄 [updateStatusMutation] Tentative avec requête directe...');
      const { data, error } = await supabase
        .from('applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', applicationId)
        .select(`
          *,
          job_offers!inner(*),
          users!inner(*)
        `);

      // console.log('🔧 [updateStatusMutation] Résultat direct:', { data, error });

      if (error) {
        console.error('❌ [updateStatusMutation] Erreur directe:', error);
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ [updateStatusMutation] Aucune ligne mise à jour');
        
        // Vérifier si l'application existe
        const { data: checkData, error: checkError } = await supabase
          .from('applications')
          .select('id, status, candidate_id')
          .eq('id', applicationId)
          .single();

        // console.log('🔍 [updateStatusMutation] Vérification existence:', { checkData, checkError });

        if (checkError || !checkData) {
          throw new Error('Application non trouvée avec cet ID');
        } else {
          // Problème de politique RLS - essayer une solution de contournement
          // console.log('🚨 [updateStatusMutation] Problème de politique RLS détecté, tentative de contournement...');
          
          // Solution de contournement: essayer avec une requête qui inclut plus de contexte
          try {
            const { data: contextData, error: contextError } = await supabase
              .from('applications')
              .update({ 
                status, 
                updated_at: new Date().toISOString() 
              })
              .eq('id', applicationId)
              .select(`
                *,
                job_offers!inner(*),
                users!inner(*)
              `);

            if (!contextError && contextData && contextData.length > 0) {
              // console.log('✅ [updateStatusMutation] Contournement réussi avec contexte étendu');
              return contextData[0];
            } else {
              console.error('❌ [updateStatusMutation] Contournement échoué:', contextError);
              throw new Error('Problème de permissions de base de données. Veuillez contacter l\'administrateur pour corriger les politiques RLS.');
            }
          } catch (contournementError) {
            console.error('❌ [updateStatusMutation] Erreur de contournement:', contournementError);
            throw new Error('Problème de permissions de base de données. Veuillez contacter l\'administrateur pour corriger les politiques RLS.');
          }
        }
      }

      // console.log('✅ [updateStatusMutation] Statut mis à jour avec succès');
      return data[0];
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey });
      // Invalider aussi la query de l'application individuelle pour tous les utilisateurs
      queryClient.invalidateQueries({ 
        queryKey: ['application', applicationId],
        exact: false 
      });
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