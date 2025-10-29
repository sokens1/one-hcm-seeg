/**
 * Hook optimisé pour la gestion des données AI locales (JSON)
 * Utilise SWR pour le cache et implémente un lazy loading intelligent
 * Les fichiers JSON ne sont chargés que lorsqu'ils sont nécessaires
 */

import { useCallback } from 'react';
import useSWR from 'swr';
import { AICandidateData, AIDataResponse } from './useAIData';
import { useCache } from '@/contexts/CacheContext';

// Configuration des départements avec leurs fichiers JSON
const DEPARTMENTS_CONFIG = [
  { name: 'Chef de Département Eau', file: '/chef_departement_eau.json' },
  { name: 'Moyens généraux', file: '/moyens_generaux_complet.json' },
  { name: 'Directeur Technique Eau', file: '/directeur_technique_eau.json' },
  { name: 'Directeur Exploitation Eau', file: '/directeur_exploitation_eau.json' },
  { name: 'Chef de Département Electricite', file: '/chef_departement_electricite.json' },
  { name: 'Coordonnateur des Régions', file: '/coordonnateur_des_regions.json' },
  { name: 'Directeur Audit & Contrôle interne', file: '/directeur_audit_et_controle_interne.json' },
  { name: 'Directeur Qualité, Hygiène, Sécurité & Environnement', file: '/directeur_qualite_hygiene_securite_environnement.json' },
  { name: 'Directeur des Systèmes d\'Information', file: '/directeur_des_systemes_d_information.json' },
  { name: 'Directeur Commercial et Recouvrement', file: '/directeur_commercial_et_recouvrement.json' },
  { name: 'Directeur du Capital Humain', file: '/directeur_du_capital_humain.json' },
  { name: 'Directeur Finances et Comptabilités', file: '/directeur_finances_et_comptabilite.json' },
  { name: 'Directeur Juridique, Communication & RSE', file: '/directeur_juridique_communication_rse.json' },
  { name: 'Directeur Technique Electricite', file: '/directeur_technique_electricité.json' },
  { name: 'Directeur Exploitation Electricite', file: '/directeur_exploitation_electricite.json' },
  { name: 'Chef de Departement Support', file: '/chef_de_departement_support.json' },
] as const;

const CACHE_KEY = 'ai_data_json_all_departments';

// Transformer les données brutes en format attendu
const transformData = (jsonData: Record<string, any>, isNested: boolean = false): AICandidateData[] => {
  if (isNested) {
    return Object.entries(jsonData).flatMap(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return Object.values(value as Record<string, any>).map(candidateData => ({
          ...(candidateData as AICandidateData),
        }));
      }
      return [];
    });
  }

  return Object.values(jsonData).map(candidateData => ({
    ...(candidateData as AICandidateData),
  }));
};

// Dédupliquer les candidats par nom et prénom
const deduplicateCandidates = (candidates: AICandidateData[]): AICandidateData[] => {
  const seen = new Map<string, AICandidateData>();
  
  candidates.forEach(candidate => {
    const key = `${candidate.nom}_${candidate.prenom}`.toLowerCase();
    const existing = seen.get(key);
    
    // Garder le candidat avec le meilleur score
    if (!existing || (candidate.resume_global?.score_global || 0) > (existing.resume_global?.score_global || 0)) {
      seen.set(key, candidate);
    }
  });
  
  return Array.from(seen.values());
};

// Charger un seul département (avec cache)
const fetchDepartment = async (deptName: string, deptFile: string): Promise<AICandidateData[]> => {
  try {
    const response = await fetch(deptFile);
    
    if (!response.ok) {
      console.warn(`⚠️ Fichier non trouvé: ${deptFile}`);
      return [];
    }
    
    const jsonData = await response.json();
    
    // Gestion des structures imbriquées
    if (deptName === 'Moyens généraux') {
      const nestedData = jsonData['Directeur Moyens Généraux'];
      if (nestedData && typeof nestedData === 'object') {
        return deduplicateCandidates(transformData(nestedData, true));
      }
      return [];
    } else if (deptName === 'Directeur Technique Eau') {
      const nestedData = jsonData['Directeur Technique Eau'];
      if (nestedData && typeof nestedData === 'object') {
        return deduplicateCandidates(transformData(nestedData, true));
      }
      return [];
    }
    
    return deduplicateCandidates(transformData(jsonData, false));
  } catch (error) {
    console.error(`❌ Erreur lors du chargement de ${deptFile}:`, error);
    return [];
  }
};

// Fetcher pour SWR - Charge tous les départements de manière optimisée
const fetchAllDepartments = async (): Promise<AIDataResponse> => {
  console.info('🔧 [AI Data Optimized] Chargement des données JSON locales');
  const startTime = Date.now();
  
  // Charger tous les départements en parallèle (mais avec SWR, ils seront mis en cache)
  const results = await Promise.all(
    DEPARTMENTS_CONFIG.map(dept => fetchDepartment(dept.name, dept.file))
  );
  
  // Organiser les résultats par département
  const organizedData: AIDataResponse = {};
  DEPARTMENTS_CONFIG.forEach((dept, index) => {
    if (results[index].length > 0) {
      organizedData[dept.name] = results[index];
    }
  });
  
  const endTime = Date.now();
  const totalCandidates = Object.values(organizedData).reduce((sum, candidates) => sum + candidates.length, 0);
  
  console.info(`✅ [AI Data Optimized] ${totalCandidates} candidats chargés depuis ${Object.keys(organizedData).length} départements en ${(endTime - startTime) / 1000}s`);
  
  return organizedData;
};

// Configuration SWR pour les données JSON locales
const SWR_CONFIG = {
  // Données statiques, pas besoin de révalider souvent
  dedupingInterval: 3600000, // 1 heure
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  shouldRetryOnError: false,
  // Les données JSON sont statiques, on peut les garder très longtemps
  focusThrottleInterval: 3600000, // 1 heure
};

export function useAIDataOptimized() {
  const cache = useCache();
  
  // Récupérer les données depuis le cache localStorage
  const cachedData = cache.get<AIDataResponse>(CACHE_KEY);
  
  // Utiliser SWR pour charger les données avec fallback sur le cache
  const {
    data: aiData,
    error: aiError,
    isLoading: aiLoading,
    mutate: mutateAIData,
    isValidating: aiValidating,
  } = useSWR<AIDataResponse>(
    CACHE_KEY,
    fetchAllDepartments,
    {
      ...SWR_CONFIG,
      // Utiliser les données du cache localStorage comme fallback
      fallbackData: cachedData || undefined,
      // Callback quand les données sont mises à jour
      onSuccess: (data) => {
        // Sauvegarder dans le cache localStorage (1 heure)
        cache.set(CACHE_KEY, data, 1000 * 60 * 60);
      },
      onError: (error) => {
        console.error('❌ [AI Data Optimized] Erreur lors du chargement:', error);
      },
    }
  );
  
  // Recharger les données (invalider le cache)
  const forceReload = useCallback(() => {
    cache.remove(CACHE_KEY);
    mutateAIData();
  }, [cache, mutateAIData]);
  
  return {
    data: aiData || {},
    isLoading: aiLoading && !cachedData, // Ne pas afficher le loader si on a des données en cache
    isValidating: aiValidating,
    error: aiError?.message || null,
    forceReload,
    mutate: mutateAIData,
  };
}

// Hook pour charger un seul département de manière lazy
export function useDepartmentData(departmentName: string) {
  const cache = useCache();
  const cacheKey = `ai_data_department_${departmentName}`;
  
  // Trouver la configuration du département
  const deptConfig = DEPARTMENTS_CONFIG.find(d => d.name === departmentName);
  
  // Récupérer depuis le cache
  const cachedDeptData = cache.get<AICandidateData[]>(cacheKey);
  
  // Utiliser SWR pour charger ce département spécifique
  const {
    data: deptData,
    error: deptError,
    isLoading: deptLoading,
    mutate: mutateDept,
  } = useSWR<AICandidateData[]>(
    deptConfig ? cacheKey : null, // Ne charger que si le département existe
    async () => {
      if (!deptConfig) return [];
      return await fetchDepartment(deptConfig.name, deptConfig.file);
    },
    {
      ...SWR_CONFIG,
      fallbackData: cachedDeptData || undefined,
      onSuccess: (data) => {
        cache.set(cacheKey, data, 1000 * 60 * 60);
      },
    }
  );
  
  return {
    data: deptData || [],
    isLoading: deptLoading && !cachedDeptData,
    error: deptError?.message || null,
    mutate: mutateDept,
  };
}

