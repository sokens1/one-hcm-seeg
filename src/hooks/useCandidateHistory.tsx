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

      const { data, error } = await supabase.rpc('get_candidate_application_history', {
        p_candidate_id: candidateId,
        p_current_application_id: currentApplicationId || null
      });

      if (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        throw error;
      }

      return (data || []) as CandidateHistoryItem[];
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
