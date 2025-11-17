/**
 * Service de cache des évaluations IA en base de données Supabase
 * Permet d'éviter les appels répétés à l'API d'analyse IA coûteuse
 */

import { supabase } from '@/integrations/supabase/client';
import { EvaluationResponse } from '@/integrations/azure-container-apps-api';

export interface CandidateEvaluationCache {
  id?: string;
  candidate_id: string | number;
  job_id: string;
  evaluation_data: EvaluationResponse;
  threshold_pct?: number;
  hold_threshold_pct?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Récupère une évaluation en cache depuis la base de données
 * @param candidateId ID du candidat
 * @param jobId ID du poste/offre
 * @returns Les données d'évaluation si trouvées, null sinon
 */
export async function getCachedEvaluation(
  candidateId: string | number,
  jobId: string
): Promise<EvaluationResponse | null> {
  if (!supabase) {
    console.warn('⚠️ [Evaluation Cache] Supabase non configuré - impossible de récupérer le cache');
    return null;
  }
  
  console.log(`🔍 [Evaluation Cache] Recherche en base pour candidat ${candidateId}, poste ${jobId}`);

  try {
    const { data, error } = await supabase
      .from('candidate_ai_evaluations')
      .select('evaluation_data')
      .eq('candidate_id', String(candidateId))
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Si l'erreur est "no rows", c'est normal (pas de cache)
      if (error.code === 'PGRST116') {
        console.log(`ℹ️ [Evaluation Cache] Aucune évaluation en cache pour candidat ${candidateId}, poste ${jobId}`);
        return null;
      }
      console.error('❌ [Evaluation Cache] Erreur lors de la récupération:', error);
      return null;
    }

    if (data?.evaluation_data) {
      console.log(`✅ [Evaluation Cache] Évaluation trouvée en cache pour candidat ${candidateId}, poste ${jobId}`);
      return data.evaluation_data as EvaluationResponse;
    }

    return null;
  } catch (error) {
    console.error('❌ [Evaluation Cache] Exception lors de la récupération:', error);
    return null;
  }
}

/**
 * Sauvegarde une évaluation en cache dans la base de données
 * @param candidateId ID du candidat
 * @param jobId ID du poste/offre
 * @param evaluationData Données d'évaluation à sauvegarder
 * @param thresholdPct Seuil d'acceptation utilisé
 * @param holdThresholdPct Seuil de mise en attente utilisé
 * @returns true si sauvegardé avec succès, false sinon
 */
export async function saveCachedEvaluation(
  candidateId: string | number,
  jobId: string,
  evaluationData: EvaluationResponse,
  thresholdPct: number = 78,
  holdThresholdPct: number = 78
): Promise<boolean> {
  console.log(`💾 [Evaluation Cache] DEBUT saveCachedEvaluation - candidat ${candidateId}, poste ${jobId}`);
  
  if (!supabase) {
    console.error('❌ [Evaluation Cache] Supabase non configuré - impossible de sauvegarder le cache');
    return false;
  }

  try {
    // Vérifier si une évaluation existe déjà pour ce candidat et ce poste
    const { data: existing, error: checkError } = await supabase
      .from('candidate_ai_evaluations')
      .select('id')
      .eq('candidate_id', String(candidateId))
      .eq('job_id', jobId)
      .limit(1)
      .maybeSingle(); // Utiliser maybeSingle() au lieu de single() pour éviter l'erreur si pas de résultat

    const cacheData: Partial<CandidateEvaluationCache> = {
      candidate_id: String(candidateId),
      job_id: jobId,
      evaluation_data: evaluationData,
      threshold_pct: thresholdPct,
      hold_threshold_pct: holdThresholdPct,
      updated_at: new Date().toISOString(),
    };

    // Mise à jour ou insertion
    if (existing?.id) {
      // Mise à jour de l'évaluation existante
      const { error } = await supabase
        .from('candidate_ai_evaluations')
        .update(cacheData)
        .eq('id', existing.id);

      if (error) {
        console.error('❌ [Evaluation Cache] Erreur lors de la mise à jour:', error);
        throw error;
      }
    } else {
      // Insertion d'une nouvelle évaluation
      cacheData.created_at = new Date().toISOString();
      const { error } = await supabase
        .from('candidate_ai_evaluations')
        .insert([cacheData]);

      if (error) {
        console.error('❌ [Evaluation Cache] Erreur lors de l\'insertion:', error);
        throw error;
      }
    }

    console.log(`✅ [Evaluation Cache] Évaluation sauvegardée en cache pour candidat ${candidateId}, poste ${jobId}`);
    return true;
  } catch (error) {
    console.error('❌ [Evaluation Cache] Erreur lors de la sauvegarde:', error);
    return false;
  }
}

/**
 * Génère une clé unique pour identifier une évaluation
 * @param candidateId ID du candidat
 * @param jobId ID du poste/offre
 * @returns Clé unique
 */
export function getEvaluationKey(candidateId: string | number, jobId: string): string {
  return `${candidateId}_${jobId}`;
}

