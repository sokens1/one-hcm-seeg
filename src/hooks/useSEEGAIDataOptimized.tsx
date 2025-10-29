/**
 * Hook optimisé pour la gestion des données SEEG AI
 * Utilise SWR pour le cache et la révalidation automatique
 * Implémente un système de cache localStorage pour la persistance
 */

import { useCallback } from 'react';
import useSWR from 'swr';
import { seegAIService } from '@/integrations/seeg-ai-api';
import { AIDataResponse } from './useAIData';
import { useCache } from '@/contexts/CacheContext';

const CACHE_KEYS = {
  ALL_CANDIDATES: 'seeg_ai_all_candidates',
  HEALTH_CHECK: 'seeg_ai_health',
} as const;

// Configuration SWR pour optimiser les performances
const SWR_CONFIG = {
  // Révalidation automatique après 10 minutes (pas avant)
  dedupingInterval: 600000, // 10 minutes
  // Conserver les données en cache pendant 30 minutes
  focusThrottleInterval: 1800000, // 30 minutes
  // Ne JAMAIS revalider automatiquement au focus de la fenêtre
  revalidateOnFocus: false,
  // Ne pas revalider à la reconnexion non plus
  revalidateOnReconnect: false,
  // Réessayer en cas d'erreur avec backoff exponentiel
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  // Ne PAS revalider si on a des données en cache (même "stale")
  revalidateIfStale: false,
  // Charger au montage SEULEMENT si pas de données en cache
  // revalidateOnMount sera géré via fallbackData
};

// Fetcher pour SWR - Récupère tous les candidats
const fetchAllCandidates = async (): Promise<AIDataResponse> => {
  console.info('🔧 [SEEG AI Optimized] Récupération des données via GET /candidatures');
  
  const startTime = Date.now();
  const searchResults = await seegAIService.getAllCandidates();
  const endTime = Date.now();
  
  console.info(`✅ [SEEG AI Optimized] Données chargées en ${(endTime - startTime) / 1000}s`);
  
  if (!Array.isArray(searchResults) || searchResults.length === 0) {
    return {};
  }

  // Organiser les données par département
  const organizedData: AIDataResponse = {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchResults.forEach((candidate: any) => {
    // Déterminer le département
    let department = 'Autres';
    
    if (candidate.offre?.ligne_hierarchique) {
      department = candidate.offre.ligne_hierarchique;
    } else if (candidate.offre?.intitule) {
      const title = candidate.offre.intitule.toLowerCase();
      if (title.includes('juridique')) department = 'Juridique';
      else if (title.includes('rh') || title.includes('ressources humaines')) department = 'Ressources Humaines';
      else if (title.includes('financier') || title.includes('comptable')) department = 'Finance';
      else if (title.includes('commercial') || title.includes('vente')) department = 'Commercial';
      else if (title.includes('technique') || title.includes('ingénieur')) department = 'Technique';
      else if (title.includes('marketing') || title.includes('communication')) department = 'Marketing';
      else if (title.includes('système') || title.includes('informatique')) department = 'Systèmes d\'Information';
      else if (title.includes('direction') || title.includes('directeur')) department = 'Direction';
    }
    
    // Mapper les données
    const firstName = candidate.first_name || candidate.prenom || 'N/A';
    const lastName = candidate.last_name || candidate.nom || 'N/A';
    
    const mappedCandidate = {
      // ✅ ID unique pour lier avec candidateEvaluations
      id: candidate.id || `${firstName}_${lastName}`,
      prenom: firstName,
      nom: lastName,
      poste: candidate.offre?.intitule || candidate.poste || 'N/A',
      offre_id: candidate.offre?.job_id || candidate.offre?.reference || candidate.offre_id || candidate.application?.offer_id || null,
      resume_global: candidate.analysis?.resume_global || candidate.resume_global || {
        score_global: 0,
        rang_global: 999,
        verdict: 'Non évalué',
        commentaire_global: 'Aucune évaluation disponible',
        forces: [],
        points_a_ameliorer: []
      },
      mtp: {
        ...candidate.analysis?.mtp,
        ...candidate.mtp,
        reponses_mtp: candidate.reponses_mtp || candidate.analysis?.reponses_mtp
      },
      similarite_offre: candidate.analysis?.similarite_offre || candidate.similarite_offre,
      conformite: candidate.analysis?.conformite || candidate.conformite,
      feedback: candidate.analysis?.feedback || candidate.feedback,
      documents: candidate.documents,
      offre: candidate.offre,
      rawData: candidate,
      reponses_mtp: candidate.reponses_mtp,
      cv: candidate.documents?.cv,
      cover_letter: candidate.documents?.cover_letter,
      diplome: candidate.documents?.diplome,
      certificats: candidate.documents?.certificats
    };
    
    if (!organizedData[department]) {
      organizedData[department] = [];
    }
    organizedData[department].push(mappedCandidate);
  });
  
  console.info(`🔧 [SEEG AI Optimized] ${searchResults.length} candidats organisés en ${Object.keys(organizedData).length} départements`);
  
  return organizedData;
};

// Fetcher pour le health check
const fetchHealthCheck = async (): Promise<boolean> => {
  return await seegAIService.checkHealth();
};

export function useSEEGAIDataOptimized() {
  const cache = useCache();

  // Récupérer les données depuis le cache localStorage en premier
  const cachedData = cache.get<AIDataResponse>(CACHE_KEYS.ALL_CANDIDATES);

  // Utiliser SWR pour les données des candidats avec fallback sur le cache
  const {
    data: candidatesData,
    error: candidatesError,
    isLoading: candidatesLoading,
    mutate: mutateCandidates,
    isValidating: candidatesValidating,
  } = useSWR<AIDataResponse>(
    CACHE_KEYS.ALL_CANDIDATES,
    fetchAllCandidates,
    {
      ...SWR_CONFIG,
      // Utiliser les données du cache localStorage comme fallback
      fallbackData: cachedData || undefined,
      // Fetch au montage SEULEMENT si pas de cachedData
      revalidateOnMount: !cachedData,
      // Callback quand les données sont mises à jour
      onSuccess: (data) => {
        // Sauvegarder dans le cache localStorage (1 heure)
        if (data && Object.keys(data).length > 0) {
          cache.set(CACHE_KEYS.ALL_CANDIDATES, data, 1000 * 60 * 60); // 1 heure
          console.log('✅ [Cache] Données candidats sauvegardées');
        }
      },
      onError: (error) => {
        console.error('❌ [SEEG AI Optimized] Erreur lors du chargement:', error);
      },
    }
  );

  // Utiliser SWR pour le health check
  const {
    data: isConnected,
    error: healthError,
  } = useSWR<boolean>(
    CACHE_KEYS.HEALTH_CHECK,
    fetchHealthCheck,
    {
      dedupingInterval: 60000, // 1 minute
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Rechercher des candidats par nom (utilise les données déjà en cache)
  const searchCandidates = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        return [];
      }

      try {
        // Utiliser les données en cache si disponibles pour une recherche locale rapide
        if (candidatesData && Object.keys(candidatesData).length > 0) {
          const results: unknown[] = [];
          Object.values(candidatesData).forEach((candidates) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filtered = candidates.filter((candidate: any) => {
              const fullName = `${candidate.prenom || ''} ${candidate.nom || ''}`.toLowerCase();
              const poste = (candidate.poste || '').toLowerCase();
              const search = searchTerm.toLowerCase();
              return fullName.includes(search) || poste.includes(search);
            });
            results.push(...filtered);
          });
          return results;
        }

        // Sinon, interroger l'API
        const response = await seegAIService.searchCandidates(searchTerm);
        return Array.isArray(response) ? response : [];
      } catch (err) {
        console.error('Erreur lors de la recherche de candidats:', err);
        return [];
      }
    },
    [candidatesData]
  );

  // Analyser un candidat avec l'IA
  const analyzeCandidate = useCallback(async (candidateId: string) => {
    try {
      if (!isConnected) {
        throw new Error('Impossible de se connecter à l\'API SEEG AI');
      }

      const analysis = await seegAIService.analyzeCandidate(candidateId);
      return analysis;
    } catch (err) {
      console.error('Erreur lors de l\'analyse du candidat:', err);
      return null;
    }
  }, [isConnected]);

  // Traiter un candidat avec l'IA
  const processCandidate = useCallback(
    async (candidateId: string, jobTitle?: string) => {
      try {
        if (!isConnected) {
          throw new Error('Impossible de se connecter à l\'API SEEG AI');
        }

        const result = await seegAIService.processCandidate(candidateId, jobTitle);
        return result;
      } catch (err) {
        console.error('Erreur lors du traitement du candidat:', err);
        return null;
      }
    },
    [isConnected]
  );

  // Recharger les données (invalider le cache SWR et localStorage)
  const forceReload = useCallback(() => {
    cache.remove(CACHE_KEYS.ALL_CANDIDATES);
    mutateCandidates();
  }, [cache, mutateCandidates]);

  // Recharger les données manuellement sans vider le cache
  const loadAIData = useCallback(() => {
    mutateCandidates();
  }, [mutateCandidates]);

  return {
    data: candidatesData || {},
    isLoading: candidatesLoading && !cachedData, // Ne pas afficher le loader si on a des données en cache
    isValidating: candidatesValidating, // Indicateur de révalidation en arrière-plan
    error: candidatesError?.message || null,
    isConnected: isConnected ?? null,
    searchCandidates,
    analyzeCandidate,
    processCandidate,
    loadAIData,
    forceReload,
    // Fonctions SWR natives
    mutate: mutateCandidates,
  };
}

