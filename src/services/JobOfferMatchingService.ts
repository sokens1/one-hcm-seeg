/**
 * Service de matching entre les offres d'emploi et les candidats
 * Implémente les meilleures pratiques du génie logiciel
 */

export interface JobOffer {
  job_id: string;
  titre: string;
  offre: string;
  M: string;
  T: string;
  P: string;
}

export interface CandidateData {
  first_name: string;
  last_name: string;
  offre: {
    intitule: string;
    reference: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface MatchingResult {
  candidateId: string;
  jobOfferId: string;
  matchType: 'exact' | 'title_based' | 'fallback';
  confidence: number;
}

/**
 * Service principal pour le matching des offres et candidats
 * Suit les principes SOLID et les patterns de design
 */
export class JobOfferMatchingService {
  private static instance: JobOfferMatchingService;
  private jobOffersCache: Map<string, JobOffer> = new Map();
  private titleToJobIdCache: Map<string, string> = new Map();
  private lastCacheUpdate: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Singleton pattern
  }

  /**
   * Singleton pattern pour garantir une seule instance
   */
  public static getInstance(): JobOfferMatchingService {
    if (!JobOfferMatchingService.instance) {
      JobOfferMatchingService.instance = new JobOfferMatchingService();
    }
    return JobOfferMatchingService.instance;
  }

  /**
   * Initialise le service avec les offres disponibles
   * @param jobOffers Liste des offres d'emploi
   */
  public async initialize(jobOffers: JobOffer[]): Promise<void> {
    try {
      this.jobOffersCache.clear();
      this.titleToJobIdCache.clear();

      for (const offer of jobOffers) {
        this.jobOffersCache.set(offer.job_id, offer);
        
        // Créer un mapping basé sur le titre pour les cas de fallback
        const normalizedTitle = this.normalizeTitle(offer.titre);
        this.titleToJobIdCache.set(normalizedTitle, offer.job_id);
      }

      this.lastCacheUpdate = Date.now();
      console.log(`🔧 [JobOfferMatching] Service initialisé avec ${jobOffers.length} offres`);
    } catch (error) {
      console.error('❌ [JobOfferMatching] Erreur lors de l\'initialisation:', error);
      throw new Error('Impossible d\'initialiser le service de matching');
    }
  }

  /**
   * Trouve l'ID de l'offre correspondant à un candidat
   * @param candidate Données du candidat
   * @returns Résultat du matching
   */
  public findMatchingJobOffer(candidate: CandidateData): MatchingResult {
    try {
      // 1. Tentative de matching exact par référence
      const exactMatch = this.findExactMatch(candidate);
      if (exactMatch) {
        return exactMatch;
      }

      // 2. Tentative de matching par titre
      const titleMatch = this.findTitleBasedMatch(candidate);
      if (titleMatch) {
        return titleMatch;
      }

      // 3. Fallback vers une offre par défaut
      return this.createFallbackMatch(candidate);
    } catch (error) {
      console.error('❌ [JobOfferMatching] Erreur lors du matching:', error);
      return this.createFallbackMatch(candidate);
    }
  }

  /**
   * Matching exact par référence UUID
   */
  private findExactMatch(candidate: CandidateData): MatchingResult | null {
    const candidateReference = candidate.offre?.reference;
    if (!candidateReference) {
      return null;
    }

    // Vérifier si la référence correspond à un job_id existant
    if (this.jobOffersCache.has(candidateReference)) {
      return {
        candidateId: this.generateCandidateId(candidate),
        jobOfferId: candidateReference,
        matchType: 'exact',
        confidence: 1.0
      };
    }

    return null;
  }

  /**
   * Matching basé sur le titre du poste
   */
  private findTitleBasedMatch(candidate: CandidateData): MatchingResult | null {
    const candidateTitle = candidate.offre?.intitule;
    if (!candidateTitle) {
      return null;
    }

    const normalizedTitle = this.normalizeTitle(candidateTitle);
    
    // Chercher une correspondance exacte dans le cache
    if (this.titleToJobIdCache.has(normalizedTitle)) {
      const jobId = this.titleToJobIdCache.get(normalizedTitle)!;
      return {
        candidateId: this.generateCandidateId(candidate),
        jobOfferId: jobId,
        matchType: 'title_based',
        confidence: 0.8
      };
    }

    // Chercher une correspondance partielle
    const partialMatch = this.findPartialTitleMatch(normalizedTitle);
    if (partialMatch) {
      return {
        candidateId: this.generateCandidateId(candidate),
        jobOfferId: partialMatch,
        matchType: 'title_based',
        confidence: 0.6
      };
    }

    return null;
  }

  /**
   * Recherche de correspondance partielle dans les titres
   */
  private findPartialTitleMatch(normalizedTitle: string): string | null {
    for (const [cachedTitle, jobId] of this.titleToJobIdCache) {
      if (this.calculateSimilarity(normalizedTitle, cachedTitle) > 0.7) {
        return jobId;
      }
    }
    return null;
  }

  /**
   * Calcule la similarité entre deux titres (algorithme simple)
   */
  private calculateSimilarity(title1: string, title2: string): number {
    const words1 = title1.split(' ').filter(word => word.length > 2);
    const words2 = title2.split(' ').filter(word => word.length > 2);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * Crée un match de fallback
   */
  private createFallbackMatch(candidate: CandidateData): MatchingResult {
    // Utiliser la première offre disponible comme fallback
    const fallbackJobId = this.jobOffersCache.keys().next().value || 'default-job-id';
    
    return {
      candidateId: this.generateCandidateId(candidate),
      jobOfferId: fallbackJobId,
      matchType: 'fallback',
      confidence: 0.3
    };
  }

  /**
   * Normalise un titre pour le matching
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Supprimer la ponctuation
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  }

  /**
   * Génère un ID unique pour le candidat
   */
  private generateCandidateId(candidate: CandidateData): string {
    const firstName = candidate.first_name || 'unknown';
    const lastName = candidate.last_name || 'unknown';
    return `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Date.now()}`;
  }

  /**
   * Vérifie si le cache est encore valide
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.CACHE_TTL;
  }

  /**
   * Force la mise à jour du cache
   */
  public async refreshCache(jobOffers: JobOffer[]): Promise<void> {
    await this.initialize(jobOffers);
  }

  /**
   * Obtient les statistiques du service
   */
  public getStats(): { cacheSize: number; lastUpdate: Date; isValid: boolean } {
    return {
      cacheSize: this.jobOffersCache.size,
      lastUpdate: new Date(this.lastCacheUpdate),
      isValid: this.isCacheValid()
    };
  }
}

/**
 * Factory pour créer des instances du service
 */
export class JobOfferMatchingServiceFactory {
  public static createService(): JobOfferMatchingService {
    return JobOfferMatchingService.getInstance();
  }
}

/**
 * Interface pour les erreurs du service
 */
export class JobOfferMatchingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly candidateData?: CandidateData
  ) {
    super(message);
    this.name = 'JobOfferMatchingError';
  }
}
