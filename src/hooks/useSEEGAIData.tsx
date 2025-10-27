import { useState, useEffect, useCallback } from 'react';
import { seegAIService } from '@/integrations/seeg-ai-api';
import { AICandidateData, AIDataResponse } from './useAIData';

export interface SEECandidateSearchParams {
  searchTerm: string;
  page?: number;
  limit?: number;
}

export function useSEEGAIData() {
  const [data, setData] = useState<AIDataResponse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [hasTriedApi, setHasTriedApi] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Vérifier la connectivité de l'API
  const checkConnection = useCallback(async () => {
    try {
      const connected = await seegAIService.checkHealth();
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      return false;
    }
  }, []);

  // Charger toutes les données IA depuis l'API
  const loadAIData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasTriedApi(true);

      const connected = await checkConnection();
      if (!connected) {
        throw new Error('Impossible de se connecter à l\'API SEEG AI');
      }

      // Utiliser directement l'endpoint /candidatures qui fonctionne
      console.info('🔧 [SEEG AI] Récupération des données via GET /candidatures');
      
      const searchResults = await seegAIService.getAllCandidates();
      
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        // Organiser les données par département comme attendu par l'interface
        const organizedData: Record<string, any[]> = {};
        
        searchResults.forEach((candidate: any) => {
          // Essayer différentes sources pour le département
          let department = 'Autres';
          
          if (candidate.offre?.ligne_hierarchique) {
            department = candidate.offre.ligne_hierarchique;
          } else if (candidate.offre?.intitule) {
            // Extraire le département du titre du poste
            const title = candidate.offre.intitule.toLowerCase();
            if (title.includes('juridique')) department = 'Juridique';
            else if (title.includes('rh') || title.includes('ressources humaines')) department = 'Ressources Humaines';
            else if (title.includes('financier') || title.includes('comptable')) department = 'Finance';
            else if (title.includes('commercial') || title.includes('vente')) department = 'Commercial';
            else if (title.includes('technique') || title.includes('ingénieur')) department = 'Technique';
            else if (title.includes('marketing') || title.includes('communication')) department = 'Marketing';
            else if (title.includes('système') || title.includes('informatique')) department = 'Systèmes d\'Information';
            else if (title.includes('direction') || title.includes('directeur')) department = 'Direction';
            else department = 'Autres';
          }
          
          // Mapper les données de l'API vers le format attendu par l'interface
          const mappedCandidate = {
            prenom: candidate.first_name || candidate.prenom || 'N/A',
            nom: candidate.last_name || candidate.nom || 'N/A',
            poste: candidate.offre?.intitule || candidate.poste || 'N/A',
            resume_global: candidate.analysis?.resume_global || candidate.resume_global || {
              score_global: 0,
              rang_global: 999,
              verdict: 'Non évalué',
              commentaire_global: 'Aucune évaluation disponible'
            },
            mtp: {
              ...candidate.analysis?.mtp,
              ...candidate.mtp,
              // Ajouter les réponses MTP si elles existent
              reponses_mtp: candidate.reponses_mtp || candidate.analysis?.reponses_mtp
            },
            similarite_offre: candidate.analysis?.similarite_offre || candidate.similarite_offre,
            conformite: candidate.analysis?.conformite || candidate.conformite,
            feedback: candidate.analysis?.feedback || candidate.feedback,
            // Conserver TOUTES les données originales pour le mapping vers l'API Azure Container Apps
            documents: candidate.documents,
            offre: candidate.offre,
            // Ajouter aussi les données brutes pour debug
            rawData: candidate,
            // Ajouter directement les réponses MTP au niveau racine pour faciliter l'accès
            reponses_mtp: candidate.reponses_mtp,
            // Ajouter directement les documents au niveau racine pour faciliter l'accès
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
        
        setData(organizedData);
        console.info(`🔧 [SEEG AI] ${searchResults.length} candidats récupérés via GET /candidatures`);
      } else {
        setData({});
      }
    } catch (err) {
      // Ne pas logger les erreurs d'endpoints non implémentés
      if (!(err instanceof Error && err.message.includes('Endpoint not implemented'))) {
        console.error('Erreur lors du chargement des données IA:', err);
      }
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  // Rechercher des candidats par nom
  const searchCandidates = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const connected = await checkConnection();
      if (!connected) {
        throw new Error('Impossible de se connecter à l\'API SEEG AI');
      }

      const response = await seegAIService.searchCandidates(searchTerm);
      // L'API retourne directement un tableau, pas un objet avec une propriété candidates
      return Array.isArray(response) ? response : [];
    } catch (err) {
      // Ne pas logger les erreurs d'endpoints non implémentés
      if (!(err instanceof Error && err.message.includes('Endpoint not implemented'))) {
        console.error('Erreur lors de la recherche de candidats:', err);
      }
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  // Analyser un candidat avec l'IA
  const analyzeCandidate = useCallback(async (candidateId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const connected = await checkConnection();
      if (!connected) {
        throw new Error('Impossible de se connecter à l\'API SEEG AI');
      }

      const analysis = await seegAIService.analyzeCandidate(candidateId);
      return analysis;
    } catch (err) {
      // Ne pas logger les erreurs d'endpoints non implémentés
      if (!(err instanceof Error && err.message.includes('Endpoint not implemented'))) {
        console.error('Erreur lors de l\'analyse du candidat:', err);
      }
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  // Traiter un candidat avec l'IA
  const processCandidate = useCallback(async (candidateId: string, jobTitle?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const connected = await checkConnection();
      if (!connected) {
        throw new Error('Impossible de se connecter à l\'API SEEG AI');
      }

      const result = await seegAIService.processCandidate(candidateId, jobTitle);
      return result;
    } catch (err) {
      // Ne pas logger les erreurs d'endpoints non implémentés
      if (!(err instanceof Error && err.message.includes('Endpoint not implemented'))) {
        console.error('Erreur lors du traitement du candidat:', err);
      }
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  // Charger les données au montage du composant (une seule fois)
  useEffect(() => {
    if (isInitialized) {
      return; // Ne pas recharger si déjà initialisé
    }
    
    setIsInitialized(true);
    console.info('🔧 [SEEG AI] Initialisation - Tentative de connexion à l\'API');
    
    // Forcer le chargement des données de l'API
    loadAIData();
  }, []); // Dépendances vides pour s'exécuter une seule fois

  // Message informatif pour le développement
  useEffect(() => {
    if (isConnected === false) {
      console.info('🔧 [SEEG AI] API en développement - Utilisation des données statiques');
      console.info('📋 [SEEG AI] Endpoints à implémenter: /api/ai-data, /api/candidates/search, etc.');
    }
  }, [isConnected]);

  // Méthode pour forcer le rechargement
  const forceReload = useCallback(() => {
    setIsInitialized(false);
    setHasTriedApi(false);
    setData({});
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    isConnected,
    searchCandidates,
    analyzeCandidate,
    processCandidate,
    loadAIData,
    checkConnection,
    forceReload,
  };
}
