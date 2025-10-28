/**
 * Service pour récupérer les offres d'emploi depuis l'API RH-EVAL
 * Implémente les patterns Repository et Adapter
 */

export interface JobOfferAPIResponse {
  job_id: string;
  titre: string;
  offre: string;
  M: string;
  T: string;
  P: string;
}

export interface JobOfferRepository {
  getAllJobOffers(): Promise<JobOfferAPIResponse[]>;
  getJobOfferById(jobId: string): Promise<JobOfferAPIResponse | null>;
}

/**
 * Implémentation concrète du repository pour l'API RH-EVAL
 */
export class RHEvalJobOfferRepository implements JobOfferRepository {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Récupère toutes les offres d'emploi depuis l'API
   */
  public async getAllJobOffers(): Promise<JobOfferAPIResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rh-eval/job-offers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Valider la structure des données
      if (!Array.isArray(data)) {
        throw new Error('Les données reçues ne sont pas un tableau');
      }

      // Valider chaque offre
      const validatedOffers = data.map((offer, index) => {
        if (!this.isValidJobOffer(offer)) {
          throw new Error(`Offre invalide à l'index ${index}: ${JSON.stringify(offer)}`);
        }
        return offer as JobOfferAPIResponse;
      });

      console.log(`🔧 [JobOfferRepository] ${validatedOffers.length} offres récupérées`);
      return validatedOffers;

    } catch (error) {
      console.error('❌ [JobOfferRepository] Erreur lors de la récupération des offres:', error);
      throw new Error(`Impossible de récupérer les offres: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupère une offre spécifique par son ID
   */
  public async getJobOfferById(jobId: string): Promise<JobOfferAPIResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rh-eval/job-offers/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!this.isValidJobOffer(data)) {
        throw new Error('Données d\'offre invalides');
      }

      return data as JobOfferAPIResponse;

    } catch (error) {
      console.error(`❌ [JobOfferRepository] Erreur lors de la récupération de l'offre ${jobId}:`, error);
      throw new Error(`Impossible de récupérer l'offre ${jobId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Valide la structure d'une offre d'emploi
   */
  private isValidJobOffer(offer: any): boolean {
    return (
      typeof offer === 'object' &&
      offer !== null &&
      typeof offer.job_id === 'string' &&
      typeof offer.titre === 'string' &&
      typeof offer.offre === 'string' &&
      typeof offer.M === 'string' &&
      typeof offer.T === 'string' &&
      typeof offer.P === 'string' &&
      offer.job_id.length > 0 &&
      offer.titre.length > 0
    );
  }
}

/**
 * Repository mock pour les tests et le développement
 */
export class MockJobOfferRepository implements JobOfferRepository {
  private mockOffers: JobOfferAPIResponse[] = [
    {
      job_id: "b67a021b-67db-4380-a69e-2468922addba",
      titre: "Directeur des Systèmes d'Information",
      offre: "Volet stratégie IT : - Définir la stratégie informatique pour soutenir la restructuration de la SEEG...",
      M: "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ?...",
      T: "Quelle innovation digitale prioriseriez-vous pour renforcer la performance et la transparence de la SEEG ?...",
      P: "Quelle valeur donnez-vous à la donnée : un actif stratégique ou un simple outil de gestion ?..."
    },
    {
      job_id: "40cf4a6b-ba59-4ba8-bc5c-b3a31960a525",
      titre: "Directeur Juridique, Communication & RSE",
      offre: "Le Directeur Juridique, Communication et RSE occupe un rôle stratégique et transversal...",
      M: "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ?...",
      T: "Comment transformeriez-vous la communication juridique et institutionnelle en levier de confiance publique ?...",
      P: "Pour vous, qu'est-ce qu'une gouvernance responsable dans une entreprise publique ?..."
    }
  ];

  public async getAllJobOffers(): Promise<JobOfferAPIResponse[]> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.mockOffers];
  }

  public async getJobOfferById(jobId: string): Promise<JobOfferAPIResponse | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.mockOffers.find(offer => offer.job_id === jobId) || null;
  }
}

/**
 * Factory pour créer des instances de repository
 */
export class JobOfferRepositoryFactory {
  public static createRHEvalRepository(baseUrl: string, apiKey: string): JobOfferRepository {
    return new RHEvalJobOfferRepository(baseUrl, apiKey);
  }

  public static createMockRepository(): JobOfferRepository {
    return new MockJobOfferRepository();
  }
}
