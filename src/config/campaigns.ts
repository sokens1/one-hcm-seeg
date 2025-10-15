/**
 * Configuration des campagnes de recrutement
 * 
 * Le système détermine automatiquement la campagne active en fonction de la date actuelle
 * - Campagne 1 : Avant le 11/09/2025 (Historique - MASQUÉE)
 * - Campagne 2 : Du 11/09/2025 au 17/10/2025 (VISIBLE pour le public)
 * - Campagne 3 : À partir du 17/10/2025 (VISIBLE pour le public)
 * 
 * Les recruteurs voient toutes les campagnes
 * Les candidats et visiteurs publics voient les campagnes 2 ET 3
 * Les offres expirées sont automatiquement masquées selon leur date_limite
 */

// Définition des périodes des campagnes
const CAMPAIGN_PERIODS = {
  1: {
    id: 1,
    name: 'Campagne 1',
    startDate: null,
    endDate: new Date('2025-09-11T00:00:00'),
    get isActive() {
      return getActiveCampaignIdDynamic() === 1;
    },
  },
  2: {
    id: 2,
    name: 'Campagne 2',
    startDate: new Date('2025-09-11T00:00:00'),
    endDate: new Date('2025-10-17T23:59:59'),
    get isActive() {
      return getActiveCampaignIdDynamic() === 2;
    },
  },
  3: {
    id: 3,
    name: 'Campagne 3',
    startDate: new Date('2025-10-17T00:00:00'),
    endDate: null, // Pas de date de fin (campagne ouverte)
    get isActive() {
      return getActiveCampaignIdDynamic() === 3;
    },
  },
};

/**
 * Détermine la campagne active en fonction de la date actuelle
 */
function getActiveCampaignIdDynamic(): number {
  const now = new Date();
  
  // Campagne 2 : Du 11/09/2025 au 17/10/2025
  if (now >= CAMPAIGN_PERIODS[2].startDate && now <= CAMPAIGN_PERIODS[2].endDate) {
    return 2;
  }
  
  // Campagne 3 : À partir du 17/10/2025
  if (now > CAMPAIGN_PERIODS[2].endDate) {
    return 3;
  }
  
  // Campagne 1 : Avant le 11/09/2025 (ne devrait jamais arriver si nous sommes après cette date)
  return 1;
}

/**
 * Détermine les campagnes masquées en fonction de la campagne active
 */
function getHiddenCampaignsDynamic(): number[] {
  // NOUVELLE LOGIQUE : Masquer uniquement la campagne 1 (historique)
  // Les campagnes 2 et 3 sont toujours visibles pour le public
  return [1]; // Seule la campagne 1 est masquée
}

export const CAMPAIGN_CONFIG = {
  // Campagne actuellement active (calculée dynamiquement)
  get ACTIVE_CAMPAIGN_ID() {
    return getActiveCampaignIdDynamic();
  },
  
  // Campagnes masquées pour les candidats (calculées dynamiquement)
  get HIDDEN_CAMPAIGNS() {
    return getHiddenCampaignsDynamic();
  },
  
  // Toutes les campagnes existantes
  ALL_CAMPAIGNS: [1, 2, 3],
  
  // Mapping des campagnes avec leurs informations
  CAMPAIGNS: CAMPAIGN_PERIODS,
};

/**
 * Vérifie si une campagne est visible pour les candidats
 */
export function isCampaignVisibleForCandidates(campaignId: number | null | undefined): boolean {
  if (!campaignId) return false;
  return !CAMPAIGN_CONFIG.HIDDEN_CAMPAIGNS.includes(campaignId);
}

/**
 * Vérifie si une campagne est visible pour les recruteurs
 * Les recruteurs voient toutes les campagnes
 */
export function isCampaignVisibleForRecruiters(campaignId: number | null | undefined): boolean {
  return true; // Les recruteurs voient toutes les campagnes
}

/**
 * Retourne l'ID de la campagne active
 */
export function getActiveCampaignId(): number {
  return CAMPAIGN_CONFIG.ACTIVE_CAMPAIGN_ID;
}

/**
 * Retourne les IDs des campagnes visibles pour les candidats
 * NOUVELLE LOGIQUE : Les campagnes 2 et 3 sont toujours visibles
 */
export function getVisibleCampaignsForCandidates(): number[] {
  // Retourner les campagnes 2 et 3 (masquer uniquement la campagne 1)
  return [2, 3];
}

/**
 * Vérifie si une campagne est expirée (sa date de fin est dépassée)
 */
export function isCampaignExpired(campaignId: number | null | undefined): boolean {
  if (!campaignId) return false;
  
  const campaign = CAMPAIGN_PERIODS[campaignId as keyof typeof CAMPAIGN_PERIODS];
  if (!campaign) return false;
  
  // Si la campagne n'a pas de date de fin, elle n'est jamais expirée
  if (!campaign.endDate) return false;
  
  const now = new Date();
  return now > campaign.endDate;
}

/**
 * Retourne les informations d'une campagne
 */
export function getCampaignInfo(campaignId: number | null | undefined) {
  if (!campaignId) return null;
  return CAMPAIGN_PERIODS[campaignId as keyof typeof CAMPAIGN_PERIODS] || null;
}

