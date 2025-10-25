/**
 * Hook pour récupérer l'historique des candidatures d'un candidat
 * Affiche toutes les candidatures précédentes, même des campagnes passées
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CandidateHistoryItem {
  application_id: string;
  job_title: string;
  job_location: string;
  job_contract_type: string;
  application_status: string;
  applied_date: string;
  campaign_id: number | null;
  is_current_application: boolean;
}

/**
 * Hook pour récupérer l'historique complet des candidatures d'un candidat
 */
export function useCandidateHistory(candidateId: string | null | undefined, currentApplicationId?: string) {
  return useQuery({
    queryKey: ['candidate-history', candidateId, currentApplicationId],
    queryFn: async () => {
      if (!candidateId) return [];

      try {
        // Essayer d'abord avec la fonction RPC
        const { data, error } = await supabase.rpc('get_candidate_application_history', {
          p_candidate_id: candidateId as string,
          p_current_application_id: currentApplicationId || null
        });

        if (error) {
          console.warn('Fonction RPC non disponible, utilisation du fallback:', error);
          throw error; // Pour déclencher le fallback
        }

        // Si la fonction RPC retourne du JSON, le parser
        if (typeof data === 'string') {
          return JSON.parse(data) as CandidateHistoryItem[];
        }

        return (data || []) as CandidateHistoryItem[];
      } catch (rpcError) {
        console.log('🔄 Fallback: utilisation de la requête directe');
        
        // Fallback: requête directe
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            created_at,
            job_offers (
              title,
              location,
              contract_type,
              campaign_id
            )
          `)
          .eq('candidate_id', candidateId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erreur lors de la récupération de l\'historique (fallback):', error);
          throw error;
        }

        // Transformer les données au format attendu
        return (data || []).map((app: any) => ({
          application_id: app.id,
          job_title: app.job_offers?.title || 'Titre non disponible',
          job_location: app.job_offers?.location || 'Localisation non disponible',
          job_contract_type: app.job_offers?.contract_type || 'Type non disponible',
          application_status: app.status,
          applied_date: app.created_at,
          campaign_id: app.job_offers?.campaign_id || null,
          is_current_application: app.id === currentApplicationId
        })) as CandidateHistoryItem[];
      }
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour vérifier si un candidat a déjà postulé
 */
export function useHasPreviousApplications(candidateId: string | null | undefined, currentApplicationId?: string) {
  const { data: history = [], isLoading } = useCandidateHistory(candidateId, currentApplicationId);
  
  return {
    hasPreviousApplications: history.length > 0,
    previousApplicationsCount: history.length,
    isLoading
  };
}
