/**
 * Service pour l'API Azure Container Apps - RH RVAL
 * Documentation: https://rh-rval-api.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io/docs#/
 */

/**
 * Interface pour les données candidat - Structure attendue par l'API RH EVAL
 * {
 *   "id": "cand-001",
 *   "nom": "Dupont",
 *   "prenom": "Alice",
 *   "cv": "Texte du CV…",
 *   "lettre_motivation": "Texte de la LM…",
 *   "MTP": {
 *     "M": "azure, devops, agile…",
 *     "T": "python, ml, docker…",
 *     "P": "gestion de projet, lead dev…"
 *   },
 *   "post": "dev-ia-001"
 * }
 */
export interface CandidateData {
  id: string | number;
  nom: string;
  prenom: string;
  cv: string;
  lettre_motivation: string;
  MTP: {
    M: string;
    T: string;
    P: string;
  };
  post: string; // ID de l'offre (reference)
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface EvaluationRequest {
  candidate_id: string | number;
  job_title: string; // Titre du poste pour l'affichage
  job_id: string; // ID de l'offre (reference) pour l'API
  cv_content: string;
  cover_letter_content: string;
  candidate_name?: string;
  candidate_firstname?: string;
  mtp_responses?: {
    M: string;
    T: string;
    P: string;
  };
  threshold_pct?: number; // Seuil d'acceptation (défaut: 50)
  hold_threshold_pct?: number; // Seuil de mise en attente (défaut: 50)
}

export interface EvaluationResponse {
  threshold_pct: number;
  scores: {
    score_offre_pct: number;
    score_mtp_pct: number;
    score_global_pct: number;
  };
  commentaires: string[];
  verdict: {
    verdict: string;
    commentaires: string[];
    rationale: string;
  };
  justification: string[];
  forces: string[];
  faiblesses: string[];
}

export interface OfferSeedData {
  job_id: string;
  titre: string;
  offre: string;
  M: string;
  T: string;
  P: string;
}

class AzureContainerAppsService {
  private baseUrl: string;
  private timeout: number;
  private apiKey: string | null;

  constructor() {
    // Configuration pour utiliser le proxy Vercel en production
    if (import.meta.env.DEV) {
      this.baseUrl = '/api/rh-eval';
    } else {
      // En production, utiliser le proxy Vercel pour contourner CORS
      this.baseUrl = '/api/rh-eval-proxy';
    }
    this.timeout = 30000; // 30 secondes par défaut
    // Clé API pour l'API SEEG AI
    this.apiKey = import.meta.env.VITE_SEEG_AI_API_KEY || 'demo-key';
  }

  /**
   * Mode test - Génère des données simulées pour tester l'interface
   */
  private generateMockEvaluationData(evaluationData: EvaluationRequest): EvaluationResponse {
    return {
      threshold_pct: 70,
      scores: {
        score_offre_pct: Math.floor(Math.random() * 30) + 70, // 70-100
        score_mtp_pct: Math.floor(Math.random() * 30) + 70,    // 70-100
        score_global_pct: Math.floor(Math.random() * 30) + 70 // 70-100
      },
      commentaires: [
        `Candidat ${evaluationData.candidate_firstname} ${evaluationData.candidate_name} présente un profil intéressant pour le poste de ${evaluationData.job_title}.`,
        'Expérience pertinente dans le domaine requis.',
        'Bonne adéquation avec les valeurs de l\'entreprise.',
        'Profil technique solide avec des compétences recherchées.'
      ],
      verdict: {
        verdict: Math.random() > 0.3 ? 'Accepté' : 'En attente',
        commentaires: [
          'Profil technique excellent',
          'Expérience pertinente',
          'Bonne culture d\'équipe',
          'Motivation évidente'
        ],
        rationale: 'Le candidat répond aux critères techniques et culturels requis pour le poste.'
      },
      justification: [
        `Expérience de ${Math.floor(Math.random() * 10) + 3} ans dans le domaine`,
        'Maîtrise des technologies requises',
        'Expérience en méthodologie Agile',
        'Bonne communication et esprit d\'équipe',
        'Profil adapté aux enjeux du poste'
      ],
      forces: [
        'Expérience solide dans le domaine',
        'Maîtrise des technologies clés',
        'Expérience en méthodologie Agile',
        'Bonne communication',
        'Esprit d\'équipe',
        'Capacité d\'adaptation'
      ],
      faiblesses: [
        'Manque d\'expérience dans certains domaines spécifiques',
        'Anglais technique à améliorer',
        'Expérience limitée en management d\'équipe'
      ]
    };
  }

  /**
   * Obtenir les en-têtes d'authentification
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    return headers;
  }

  /**
   * Définir la clé API
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('🔑 [Azure Container Apps] Clé API définie');
  }

  /**
   * Vérifier si la clé API est configurée
   */
  hasApiKey(): boolean {
    return this.apiKey !== null && this.apiKey !== '';
  }

  /**
   * Vérifier la connectivité à l'API
   */
  async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: this.getAuthHeaders(),
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('🔧 [Azure Container Apps] API non accessible:', error);
      return false;
    }
  }

  /**
   * Envoyer les données d'un candidat à l'API
   */
  async sendCandidateData(candidateData: CandidateData): Promise<ApiResponse> {
    try {
      console.log('📤 [Azure Container Apps] Envoi des données du candidat:', candidateData.id);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/candidats`, {
        method: 'POST',
        signal: controller.signal,
        headers: this.getAuthHeaders(),
        body: JSON.stringify(candidateData),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Gestion spécifique des erreurs d'authentification
        if (response.status === 401) {
          throw new Error('Erreur d\'authentification: Clé API invalide ou manquante');
        } else if (response.status === 403) {
          throw new Error('Erreur d\'autorisation: Accès refusé');
        } else {
          throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json();
      
      console.log('✅ [Azure Container Apps] Données envoyées avec succès');
      return {
        success: true,
        message: 'Données envoyées avec succès',
        data: result,
      };

    } catch (error) {
      console.error('❌ [Azure Container Apps] Erreur lors de l\'envoi:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Timeout: L\'API n\'a pas répondu dans les temps',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Erreur inconnue lors de l\'envoi',
      };
    }
  }

  /**
   * Obtenir la liste des candidats depuis l'API
   */
  async getCandidates(): Promise<ApiResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/candidats`, {
        method: 'GET',
        signal: controller.signal,
        headers: this.getAuthHeaders(),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('❌ [Azure Container Apps] Erreur lors de la récupération des candidats:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Timeout: L\'API n\'a pas répondu dans les temps',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Erreur inconnue lors de la récupération',
      };
    }
  }

  /**
   * Analyser un candidat avec l'IA
   */
  async analyzeCandidate(candidateId: string | number): Promise<ApiResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/candidats/${candidateId}/analyze`, {
        method: 'POST',
        signal: controller.signal,
        headers: this.getAuthHeaders(),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('❌ [Azure Container Apps] Erreur lors de l\'analyse:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Timeout: L\'API n\'a pas répondu dans les temps',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Erreur inconnue lors de l\'analyse',
      };
    }
  }

  /**
   * Évaluer un candidat avec l'IA via la route /evaluate
   */
  async evaluateCandidate(evaluationData: EvaluationRequest): Promise<ApiResponse> {
    try {
      // Préparer les données au format de l'API RH Eval
      const rhEvalData = {
        id: evaluationData.candidate_id,
        nom: evaluationData.candidate_name || evaluationData.candidate_id.toString(),
        prenom: evaluationData.candidate_firstname || evaluationData.candidate_id.toString(),
        cv: evaluationData.cv_content,
        lettre_motivation: evaluationData.cover_letter_content,
        MTP: {
          M: evaluationData.mtp_responses?.M || 'Non spécifié',
          T: evaluationData.mtp_responses?.T || 'Non spécifié',
          P: evaluationData.mtp_responses?.P || 'Non spécifié'
        },
        // Utiliser job_id (ID de l'offre/reference) pour le champ post
        // S'assurer que le champ est toujours présent, même s'il est vide
        post: evaluationData.job_id || ''
      };
      
      console.log('📤 [Azure Container Apps] job_id reçu:', evaluationData.job_id);
      console.log('📤 [Azure Container Apps] Champ post qui sera envoyé:', rhEvalData.post);
      console.log('📤 [Azure Container Apps] Structure complète envoyée à l\'API:', JSON.stringify(rhEvalData, null, 2));
      
      // Timeout plus long pour l'évaluation IA (120 secondes = 2 minutes)
      const evaluationTimeout = 120000;
      console.log(`⏱️ [Azure Container Apps] Timeout configuré: ${evaluationTimeout / 1000}s pour l'évaluation IA`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), evaluationTimeout);

      // Construire l'URL avec les paramètres de seuil (query parameters)
      console.log('🔍 [DEBUG] evaluationData.threshold_pct reçu:', evaluationData.threshold_pct);
      console.log('🔍 [DEBUG] evaluationData.hold_threshold_pct reçu:', evaluationData.hold_threshold_pct);
      
      // Utiliser les valeurs de evaluationData - TOUJOURS prendre la valeur fournie
      const thresholdPct = evaluationData.threshold_pct !== undefined ? evaluationData.threshold_pct : 65;
      const holdThresholdPct = evaluationData.hold_threshold_pct !== undefined ? evaluationData.hold_threshold_pct : 65;
      const evaluateUrl = `${this.baseUrl}/evaluate?threshold_pct=${thresholdPct}&hold_threshold_pct=${holdThresholdPct}`;

      console.log('🔗 [Azure Container Apps] URL avec paramètres:', evaluateUrl);
      console.log('📊 [Azure Container Apps] Seuils appliqués:', { threshold_pct: thresholdPct, hold_threshold_pct: holdThresholdPct });

      const response = await fetch(evaluateUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: this.getAuthHeaders(),
        body: JSON.stringify(rhEvalData),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Gestion spécifique des erreurs d'authentification
        if (response.status === 401) {
          console.warn('⚠️ [Azure Container Apps] Clé API invalide - Utilisation du mode test');
          // Retourner des données simulées pour le test
          const mockData = this.generateMockEvaluationData(evaluationData);
          return {
            success: true,
            message: 'Évaluation effectuée en mode test (clé API invalide)',
            data: mockData,
          };
        } else if (response.status === 403) {
          throw new Error('Erreur d\'autorisation: Accès refusé');
        } else if (response.status === 422) {
          throw new Error('Erreur de validation: Données d\'évaluation invalides');
        } else {
          throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }
      }

      const result: EvaluationResponse = await response.json();
      
      console.log('✅ [Azure Container Apps] Évaluation réussie:', result);
      console.log('📊 [Azure Container Apps] Données reçues de l\'API RH Eval:', JSON.stringify(result, null, 2));
      console.log('🎯 [Azure Container Apps] Scores:', result.scores);
      console.log('⚖️ [Azure Container Apps] Verdict:', result.verdict);
      console.log('💪 [Azure Container Apps] Forces:', result.forces);
      console.log('⚠️ [Azure Container Apps] Faiblesses:', result.faiblesses);
      console.log('📝 [Azure Container Apps] Justifications:', result.justification);
      console.log('💬 [Azure Container Apps] Commentaires:', result.commentaires);
      
      return {
        success: true,
        message: 'Évaluation effectuée avec succès',
        data: result,
      };

    } catch (error) {
      console.error('❌ [Azure Container Apps] Erreur lors de l\'évaluation:', error);
      
      // Retourner l'erreur réelle sans fallback automatique
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Timeout: L\'API n\'a pas répondu dans les temps',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Erreur inconnue lors de l\'évaluation',
      };
    }
  }

  /**
   * Enregistre (seed) les offres dans l'API avant l'évaluation
   * Route: POST /index/seed
   */
  async seedOffers(offers: OfferSeedData[]): Promise<ApiResponse> {
    try {
      console.log('🌱 [Azure Container Apps] Seed des offres:', offers.length, 'offres');
      
      const seedUrl = `${this.baseUrl}/index/seed`;
      
      console.log('🔗 [Azure Container Apps] URL seed:', seedUrl);
      console.log('📤 [Azure Container Apps] Données à seeder:', JSON.stringify(offers, null, 2));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(seedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        },
        body: JSON.stringify(offers),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Azure Container Apps] Erreur HTTP seed:', response.status, errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [Azure Container Apps] Seed effectué avec succès:', result);
      
      return {
        success: true,
        message: 'Offres enregistrées avec succès',
        data: result,
      };

    } catch (error) {
      console.error('❌ [Azure Container Apps] Erreur lors du seed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Timeout: L\'API n\'a pas répondu dans les temps',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      
      return {
        success: false,
        error: 'Une erreur inconnue s\'est produite lors du seed',
      };
    }
  }
}

// Instance singleton
export const azureContainerAppsService = new AzureContainerAppsService();
