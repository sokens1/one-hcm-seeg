import { SEEG_AI_CONFIG, SEECandidateSearchResponse, SEEAIAnalysisResponse } from '@/config/seeg-ai';

// Service pour communiquer avec l'API SEEG AI
export class SEEGAIService {
  private baseURL: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseURL = SEEG_AI_CONFIG.BASE_URL;
    this.apiKey = SEEG_AI_CONFIG.API_KEY;
    this.timeout = SEEG_AI_CONFIG.TIMEOUT;
  }

  // Méthode utilitaire pour faire des requêtes HTTP
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Ajouter la clé API si elle existe
    if (this.apiKey) {
      defaultHeaders['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Créer un AbortController manuel pour un meilleur contrôle
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: options.signal || controller.signal, // Utiliser le signal fourni ou celui créé
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId); // Annuler le timeout si la requête réussit
      
      if (!response.ok) {
        // Ne pas logger les erreurs 404 comme des erreurs critiques
        if (response.status === 404) {
          console.warn(`SEEG AI API: Endpoint not found (${response.status}) - ${endpoint}`);
          throw new Error(`Endpoint not implemented: ${endpoint}`);
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId); // S'assurer que le timeout est annulé
      
      // Gérer les erreurs d'abort plus gracieusement
      if (error.name === 'AbortError') {
        console.warn(`⏱️ SEEG AI API: Requête annulée ou timeout pour ${endpoint}`);
        throw new Error(`Timeout ou requête annulée: ${endpoint}`);
      }
      
      // Ne logger que les vraies erreurs, pas les 404
      if (!error.message?.includes('Endpoint not implemented')) {
        console.error('SEEG AI API Error:', error);
      }
      throw error;
    }
  }

  // Méthode utilitaire pour retry les requêtes
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 2,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.info(`🔄 SEEG AI API: Tentative ${attempt + 1}/${maxRetries + 1}`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        
        // Ne pas retry si c'est une erreur 404 ou une erreur de validation
        if (error.message?.includes('Endpoint not implemented') || 
            error.message?.includes('404') ||
            error.message?.includes('400')) {
          throw error;
        }
        
        // Ne pas retry si c'est la dernière tentative
        if (attempt === maxRetries) {
          console.error(`❌ SEEG AI API: Toutes les tentatives ont échoué`);
          throw error;
        }
        
        console.warn(`⚠️ SEEG AI API: Échec de la tentative ${attempt + 1}, nouvelle tentative...`);
      }
    }
    
    throw lastError;
  }

  // Récupérer tous les candidats avec retry
  async getAllCandidates(): Promise<SEECandidateSearchResponse> {
    return this.retryRequest(() => 
      this.makeRequest<SEECandidateSearchResponse>(
        SEEG_AI_CONFIG.ENDPOINTS.GET_ALL_CANDIDATES
      ),
      2, // 2 retries (3 tentatives au total)
      2000 // 2 secondes de délai entre les tentatives
    );
  }

  // Rechercher des candidats par nom
  async searchCandidates(searchTerm: string, page: number = 1, limit: number = 10): Promise<SEECandidateSearchResponse> {
    const params = new URLSearchParams();
    
    // Si pas de terme de recherche, essayer de récupérer tous les candidats
    if (!searchTerm.trim()) {
      // Pour récupérer tous les candidats, on peut essayer avec un terme générique
      // ou utiliser un paramètre spécial si l'API le supporte
      params.append('first_name', 'a'); // Commencer par 'a' pour récupérer un échantillon
    } else {
      // L'API attend first_name ou last_name, on va essayer de deviner si c'est un prénom ou nom
      const searchWords = searchTerm.trim().split(' ');
      
      if (searchWords.length === 1) {
        // Un seul mot, on l'utilise comme prénom
        params.append('first_name', searchWords[0]);
      } else if (searchWords.length >= 2) {
        // Plusieurs mots, premier = prénom, dernier = nom
        params.append('first_name', searchWords[0]);
        params.append('last_name', searchWords[searchWords.length - 1]);
      }
    }
    
    // Ajouter les paramètres de pagination si nécessaire
    if (page > 1) {
      params.append('page', page.toString());
    }
    if (limit !== 10) {
      params.append('limit', limit.toString());
    }

    return this.makeRequest<SEECandidateSearchResponse>(
      `${SEEG_AI_CONFIG.ENDPOINTS.SEARCH_CANDIDATES}?${params}`
    );
  }

  // Analyser un candidat avec l'IA
  async analyzeCandidate(candidateId: string): Promise<SEEAIAnalysisResponse> {
    return this.makeRequest<SEEAIAnalysisResponse>(
      `${SEEG_AI_CONFIG.ENDPOINTS.ANALYZE_CANDIDATE}/${candidateId}`,
      {
        method: 'POST',
      }
    );
  }

  // Récupérer toutes les données de traitement IA
  async getAIData(): Promise<Record<string, any[]>> {
    // En mode développement, éviter les appels répétés si on sait que l'endpoint n'existe pas
    if (import.meta.env.DEV) {
      console.info('🔧 [SEEG AI] Mode développement - Tentative de récupération des données IA');
    }
    
    return this.makeRequest<Record<string, any[]>>(
      SEEG_AI_CONFIG.ENDPOINTS.GET_AI_DATA
    );
  }

  // Traiter un candidat avec l'IA
  async processCandidate(candidateId: string, jobTitle?: string): Promise<SEEAIAnalysisResponse> {
    const body = jobTitle ? { jobTitle } : {};
    
    return this.makeRequest<SEEAIAnalysisResponse>(
      `${SEEG_AI_CONFIG.ENDPOINTS.PROCESS_CANDIDATE}/${candidateId}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  // Vérifier la connectivité de l'API
  async checkHealth(): Promise<boolean> {
    try {
      await this.makeRequest('/health');
      return true;
    } catch (error) {
      console.error('SEEG AI API Health Check Failed:', error);
      return false;
    }
  }
}

// Instance singleton du service
export const seegAIService = new SEEGAIService();
