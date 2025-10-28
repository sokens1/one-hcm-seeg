/**
 * Tests unitaires pour le service de matching des offres et candidats
 * Implémente les meilleures pratiques de testing
 */

import { JobOfferMatchingService, JobOffer, CandidateData, MatchingResult } from '../services/JobOfferMatchingService';
import { MockJobOfferRepository } from '../services/JobOfferRepository';
import { CandidateEvaluationService } from '../services/CandidateEvaluationService';

// Mock des données de test
const mockJobOffers: JobOffer[] = [
  {
    job_id: "b67a021b-67db-4380-a69e-2468922addba",
    titre: "Directeur des Systèmes d'Information",
    offre: "Volet stratégie IT...",
    M: "Questions métier...",
    T: "Questions talent...",
    P: "Questions paradigme..."
  },
  {
    job_id: "40cf4a6b-ba59-4ba8-bc5c-b3a31960a525",
    titre: "Directeur Juridique, Communication & RSE",
    offre: "Le Directeur Juridique...",
    M: "Questions métier juridique...",
    T: "Questions talent juridique...",
    P: "Questions paradigme juridique..."
  }
];

const mockCandidate: CandidateData = {
  first_name: "Eric Hervé",
  last_name: "EYOGO TOUNG",
  offre: {
    intitule: "Directeur Juridique, Communication & RSE",
    reference: "40cf4a6b-ba59-4ba8-bc5c-b3a31960a525"
  },
  reponses_mtp: {
    metier: ["Réponse métier 1", "Réponse métier 2"],
    talent: ["Réponse talent 1", "Réponse talent 2"],
    paradigme: ["Réponse paradigme 1", "Réponse paradigme 2"]
  },
  documents: {
    cv: "Contenu du CV...",
    cover_letter: "Contenu de la lettre de motivation..."
  }
};

/**
 * Tests pour JobOfferMatchingService
 */
class JobOfferMatchingServiceTests {
  private service: JobOfferMatchingService;

  constructor() {
    this.service = JobOfferMatchingService.getInstance();
  }

  public async runAllTests(): Promise<void> {
    console.log('🧪 [Tests] Début des tests JobOfferMatchingService');
    
    await this.testInitialization();
    await this.testExactMatch();
    await this.testTitleBasedMatch();
    await this.testFallbackMatch();
    await this.testCacheManagement();
    
    console.log('✅ [Tests] Tous les tests JobOfferMatchingService ont réussi');
  }

  private async testInitialization(): Promise<void> {
    console.log('  🔍 Test d\'initialisation...');
    
    await this.service.initialize(mockJobOffers);
    const stats = this.service.getStats();
    
    if (stats.cacheSize !== mockJobOffers.length) {
      throw new Error(`Cache size incorrect: ${stats.cacheSize} au lieu de ${mockJobOffers.length}`);
    }
    
    if (!stats.isValid) {
      throw new Error('Cache marqué comme invalide après initialisation');
    }
    
    console.log('  ✅ Initialisation réussie');
  }

  private async testExactMatch(): Promise<void> {
    console.log('  🔍 Test de matching exact...');
    
    const result = this.service.findMatchingJobOffer(mockCandidate);
    
    if (result.matchType !== 'exact') {
      throw new Error(`Type de match incorrect: ${result.matchType} au lieu de 'exact'`);
    }
    
    if (result.jobOfferId !== mockCandidate.offre.reference) {
      throw new Error(`Job ID incorrect: ${result.jobOfferId} au lieu de ${mockCandidate.offre.reference}`);
    }
    
    if (result.confidence !== 1.0) {
      throw new Error(`Confiance incorrecte: ${result.confidence} au lieu de 1.0`);
    }
    
    console.log('  ✅ Matching exact réussi');
  }

  private async testTitleBasedMatch(): Promise<void> {
    console.log('  🔍 Test de matching par titre...');
    
    const candidateWithoutReference: CandidateData = {
      ...mockCandidate,
      offre: {
        intitule: "Directeur des Systèmes d'Information",
        reference: "non-existent-reference"
      }
    };
    
    const result = this.service.findMatchingJobOffer(candidateWithoutReference);
    
    if (result.matchType !== 'title_based') {
      throw new Error(`Type de match incorrect: ${result.matchType} au lieu de 'title_based'`);
    }
    
    if (result.jobOfferId !== "b67a021b-67db-4380-a69e-2468922addba") {
      throw new Error(`Job ID incorrect: ${result.jobOfferId}`);
    }
    
    console.log('  ✅ Matching par titre réussi');
  }

  private async testFallbackMatch(): Promise<void> {
    console.log('  🔍 Test de matching de fallback...');
    
    const candidateWithoutMatch: CandidateData = {
      ...mockCandidate,
      offre: {
        intitule: "Poste Inconnu",
        reference: "non-existent-reference"
      }
    };
    
    const result = this.service.findMatchingJobOffer(candidateWithoutMatch);
    
    if (result.matchType !== 'fallback') {
      throw new Error(`Type de match incorrect: ${result.matchType} au lieu de 'fallback'`);
    }
    
    if (result.confidence < 0.3) {
      throw new Error(`Confiance trop faible: ${result.confidence}`);
    }
    
    console.log('  ✅ Matching de fallback réussi');
  }

  private async testCacheManagement(): Promise<void> {
    console.log('  🔍 Test de gestion du cache...');
    
    const initialStats = this.service.getStats();
    await this.service.refreshCache(mockJobOffers);
    const refreshedStats = this.service.getStats();
    
    if (refreshedStats.cacheSize !== initialStats.cacheSize) {
      throw new Error('Taille du cache incorrecte après refresh');
    }
    
    console.log('  ✅ Gestion du cache réussie');
  }
}

/**
 * Tests pour CandidateEvaluationService
 */
class CandidateEvaluationServiceTests {
  private service: CandidateEvaluationService;

  constructor() {
    const mockRepository = new MockJobOfferRepository();
    this.service = new CandidateEvaluationService(mockRepository);
  }

  public async runAllTests(): Promise<void> {
    console.log('🧪 [Tests] Début des tests CandidateEvaluationService');
    
    await this.testServiceInitialization();
    await this.testCandidateEvaluation();
    await this.testBatchEvaluation();
    
    console.log('✅ [Tests] Tous les tests CandidateEvaluationService ont réussi');
  }

  private async testServiceInitialization(): Promise<void> {
    console.log('  🔍 Test d\'initialisation du service...');
    
    await this.service.initialize();
    const stats = this.service.getServiceStats();
    
    if (!stats.isInitialized) {
      throw new Error('Service non initialisé');
    }
    
    console.log('  ✅ Initialisation du service réussie');
  }

  private async testCandidateEvaluation(): Promise<void> {
    console.log('  🔍 Test d\'évaluation de candidat...');
    
    const result = await this.service.evaluateCandidate({ candidate: mockCandidate });
    
    if (!result.candidateId) {
      throw new Error('ID candidat manquant');
    }
    
    if (!result.jobOfferId) {
      throw new Error('ID offre manquant');
    }
    
    if (!result.evaluationData) {
      throw new Error('Données d\'évaluation manquantes');
    }
    
    if (result.evaluationData.post !== result.jobOfferId) {
      throw new Error(`Champ post incorrect: ${result.evaluationData.post} au lieu de ${result.jobOfferId}`);
    }
    
    console.log('  ✅ Évaluation de candidat réussie');
  }

  private async testBatchEvaluation(): Promise<void> {
    console.log('  🔍 Test d\'évaluation en lot...');
    
    const candidates = [mockCandidate, { ...mockCandidate, first_name: "Test", last_name: "User" }];
    const results = await this.service.evaluateCandidatesBatch(candidates);
    
    if (results.length !== candidates.length) {
      throw new Error(`Nombre de résultats incorrect: ${results.length} au lieu de ${candidates.length}`);
    }
    
    console.log('  ✅ Évaluation en lot réussie');
  }
}

/**
 * Fonction principale pour exécuter tous les tests
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 [Tests] Début de la suite de tests complète');
  console.log('===============================================');
  
  try {
    // Tests du service de matching
    const matchingTests = new JobOfferMatchingServiceTests();
    await matchingTests.runAllTests();
    
    // Tests du service d'évaluation
    const evaluationTests = new CandidateEvaluationServiceTests();
    await evaluationTests.runAllTests();
    
    console.log('===============================================');
    console.log('🎉 [Tests] Tous les tests ont réussi !');
    
  } catch (error) {
    console.error('❌ [Tests] Échec des tests:', error);
    throw error;
  }
}

// Exécuter les tests si ce fichier est appelé directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests, JobOfferMatchingServiceTests, CandidateEvaluationServiceTests };
