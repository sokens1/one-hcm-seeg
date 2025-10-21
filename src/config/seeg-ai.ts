// Configuration pour l'API SEEG AI
export const SEEG_AI_CONFIG = {
  // URL de base de l'API
  BASE_URL: import.meta.env.VITE_SEEG_AI_API_URL || 'https://seeg-ai-api.azurewebsites.net',
  
  // Clé API (si nécessaire)
  API_KEY: import.meta.env.VITE_SEEG_AI_API_KEY || '',
  
  // Timeout pour les requêtes (en millisecondes)
  TIMEOUT: 30000,
  
  // Endpoints de l'API
  ENDPOINTS: {
    // Récupération de tous les candidats
    GET_ALL_CANDIDATES: '/candidatures',
    
    // Recherche de candidats par nom
    SEARCH_CANDIDATES: '/candidatures/search',
    
    // Analyse IA d'un candidat
    ANALYZE_CANDIDATE: '/candidatures/analyze',
    
    // Récupération des données de traitement IA
    GET_AI_DATA: '/candidatures/ai-data',
    
    // Traitement IA d'un candidat spécifique
    PROCESS_CANDIDATE: '/candidatures/process',
  }
};

// Types pour les réponses de l'API
export interface SEECandidateSearchResponse {
  // L'API retourne directement un tableau de candidats
  [key: number]: any; // Pour permettre l'accès par index
  length: number; // Pour la propriété length du tableau
}

export interface SEEAIAnalysisResponse {
  candidateId: string;
  analysis: {
    conformite?: {
      score_conformité: number;
      commentaire: string;
    };
    mtp?: {
      scores: {
        Métier: number;
        Talent: number;
        Paradigme: number;
        Moyen: number;
      };
      score_moyen?: number;
      niveau: string;
      verdict: string;
      points_forts: string[];
      points_a_travailler: string[];
      rang: number;
    };
    similarite_offre?: {
      resume_experience: string | { nombre_d_annees: number; specialite: string };
      score: number;
      commentaire_score: string;
      forces: string[];
      faiblesses: string[];
      verdict: string;
      rang: number;
    };
    feedback?: {
      score: number;
      verdict: string;
      raisons: string;
      points_forts: string[];
      points_a_travailler: string[];
      rang: number;
    };
    resume_global: {
      score_global: number;
      commentaire_global: string;
      forces: string | string[];
      points_a_ameliorer: string | string[];
      verdict: string;
      rang_global: number;
    };
  };
  processedAt: string;
}
