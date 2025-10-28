/**
 * Service d'intégration pour le matching des offres et candidats
 * Orchestre les différents services selon les meilleures pratiques
 */

import { JobOfferMatchingService, JobOffer, CandidateData, MatchingResult } from './JobOfferMatchingService';
import { JobOfferRepository, JobOfferAPIResponse } from './JobOfferRepository';

export interface CandidateEvaluationRequest {
  candidate: CandidateData;
  jobOfferId?: string;
}

export interface CandidateEvaluationResponse {
  candidateId: string;
  jobOfferId: string;
  matchResult: MatchingResult;
  evaluationData: {
    id: string;
    nom: string;
    prenom: string;
    cv: string;
    lettre_motivation: string;
    MTP: {
      M: string;
      T: string;
      P: string;
    };
    post: string;
  };
}

/**
 * Service principal d'intégration
 * Implémente le pattern Facade pour simplifier l'utilisation
 */
export class CandidateEvaluationService {
  private matchingService: JobOfferMatchingService;
  private jobOfferRepository: JobOfferRepository;
  private isInitialized: boolean = false;

  constructor(jobOfferRepository: JobOfferRepository) {
    this.matchingService = JobOfferMatchingService.getInstance();
    this.jobOfferRepository = jobOfferRepository;
  }

  /**
   * Initialise le service avec les offres d'emploi
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🔧 [CandidateEvaluationService] Initialisation du service...');
      
      const jobOffers = await this.jobOfferRepository.getAllJobOffers();
      
      if (jobOffers.length === 0) {
        throw new Error('Aucune offre d\'emploi trouvée');
      }

      await this.matchingService.initialize(jobOffers);
      this.isInitialized = true;
      
      console.log(`✅ [CandidateEvaluationService] Service initialisé avec ${jobOffers.length} offres`);
    } catch (error) {
      console.error('❌ [CandidateEvaluationService] Erreur lors de l\'initialisation:', error);
      throw new Error(`Impossible d'initialiser le service d'évaluation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Évalue un candidat et trouve l'offre correspondante
   */
  public async evaluateCandidate(request: CandidateEvaluationRequest): Promise<CandidateEvaluationResponse> {
    if (!this.isInitialized) {
      throw new Error('Le service n\'est pas initialisé. Appelez initialize() d\'abord.');
    }

    try {
      const { candidate, jobOfferId } = request;

      // 1. Trouver l'offre correspondante
      let matchResult: MatchingResult;
      
      if (jobOfferId) {
        // Utiliser l'ID fourni explicitement
        matchResult = {
          candidateId: this.generateCandidateId(candidate),
          jobOfferId: jobOfferId,
          matchType: 'exact',
          confidence: 1.0
        };
      } else {
        // Utiliser le service de matching automatique
        matchResult = this.matchingService.findMatchingJobOffer(candidate);
      }

      // 2. Préparer les données d'évaluation
      const evaluationData = this.prepareEvaluationData(candidate, matchResult.jobOfferId);

      console.log(`🔍 [CandidateEvaluationService] Candidat ${candidate.first_name} ${candidate.last_name} évalué pour l'offre ${matchResult.jobOfferId}`);

      return {
        candidateId: matchResult.candidateId,
        jobOfferId: matchResult.jobOfferId,
        matchResult,
        evaluationData
      };

    } catch (error) {
      console.error('❌ [CandidateEvaluationService] Erreur lors de l\'évaluation:', error);
      throw new Error(`Impossible d'évaluer le candidat: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Évalue plusieurs candidats en lot
   */
  public async evaluateCandidatesBatch(candidates: CandidateData[]): Promise<CandidateEvaluationResponse[]> {
    if (!this.isInitialized) {
      throw new Error('Le service n\'est pas initialisé. Appelez initialize() d\'abord.');
    }

    const results: CandidateEvaluationResponse[] = [];

    for (const candidate of candidates) {
      try {
        const result = await this.evaluateCandidate({ candidate });
        results.push(result);
      } catch (error) {
        console.error(`❌ [CandidateEvaluationService] Erreur pour le candidat ${candidate.first_name} ${candidate.last_name}:`, error);
        // Continuer avec les autres candidats même en cas d'erreur
      }
    }

    console.log(`📊 [CandidateEvaluationService] ${results.length}/${candidates.length} candidats évalués avec succès`);
    return results;
  }

  /**
   * Prépare les données d'évaluation dans le format attendu par l'API RH-EVAL
   */
  private prepareEvaluationData(candidate: CandidateData, jobOfferId: string): CandidateEvaluationResponse['evaluationData'] {
    // Extraire le contenu des documents
    const cvContent = this.extractDocumentContent(candidate.documents?.cv);
    const coverLetterContent = this.extractDocumentContent(candidate.documents?.cover_letter);

    // Préparer les réponses MTP
    const mtpResponses = candidate.reponses_mtp || {};
    const mtpData = {
      M: this.formatMTPResponses(mtpResponses.metier),
      T: this.formatMTPResponses(mtpResponses.talent),
      P: this.formatMTPResponses(mtpResponses.paradigme)
    };

    return {
      id: this.generateCandidateId(candidate),
      nom: candidate.last_name || candidate.nom || 'N/A',
      prenom: candidate.first_name || candidate.prenom || 'N/A',
      cv: cvContent,
      lettre_motivation: coverLetterContent,
      MTP: mtpData,
      post: jobOfferId // Utiliser directement l'ID de l'offre
    };
  }

  /**
   * Extrait le contenu d'un document
   */
  private extractDocumentContent(document: any): string {
    if (typeof document === 'string') {
      return document;
    }
    if (document && typeof document === 'object') {
      return document.content || document.text || document.url || 'Contenu non disponible';
    }
    return 'Contenu non disponible';
  }

  /**
   * Formate les réponses MTP
   */
  private formatMTPResponses(responses: string[] | undefined): string {
    if (!responses || !Array.isArray(responses)) {
      return 'Réponses non disponibles';
    }
    return responses.join(', ');
  }

  /**
   * Génère un ID unique pour le candidat
   */
  private generateCandidateId(candidate: CandidateData): string {
    const firstName = candidate.first_name || 'unknown';
    const lastName = candidate.last_name || 'unknown';
    const timestamp = Date.now();
    return `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${timestamp}`;
  }

  /**
   * Obtient les statistiques du service
   */
  public getServiceStats(): { isInitialized: boolean; matchingStats: any } {
    return {
      isInitialized: this.isInitialized,
      matchingStats: this.matchingService.getStats()
    };
  }

  /**
   * Force la mise à jour des offres
   */
  public async refreshJobOffers(): Promise<void> {
    const jobOffers = await this.jobOfferRepository.getAllJobOffers();
    await this.matchingService.refreshCache(jobOffers);
    console.log('🔄 [CandidateEvaluationService] Offres d\'emploi mises à jour');
  }
}

/**
 * Factory pour créer des instances du service
 */
export class CandidateEvaluationServiceFactory {
  public static createService(jobOfferRepository: JobOfferRepository): CandidateEvaluationService {
    return new CandidateEvaluationService(jobOfferRepository);
  }
}
