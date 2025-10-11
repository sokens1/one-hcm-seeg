/**
 * Configuration des campagnes de recrutement
 * 
 * Le système détermine automatiquement la campagne active en fonction de la date actuelle
 * - Campagne 1 : Avant le 11/09/2025 (Historique)
 * - Campagne 2 : Du 11/09/2025 au 21/10/2025 (Active jusqu'au 21/10)
 * - Campagne 3 : Après le 21/10/2025 (Future/Active après le 21/10)
 * 
 * Les recruteurs voient toutes les campagnes
 * Les candidats et visiteurs publics voient uniquement la campagne active
 * Les offres expirées sont grisées dans la vue publique
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
    endDate: new Date('2025-10-21T23:59:59'),
    get isActive() {
      return getActiveCampaignIdDynamic() === 2;
    },
  },
  3: {
    id: 3,
    name: 'Campagne 3',
    startDate: new Date('2025-10-21T00:00:00'),
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
  
  // Campagne 2 : Du 11/09/2025 au 21/10/2025
  if (now >= CAMPAIGN_PERIODS[2].startDate && now <= CAMPAIGN_PERIODS[2].endDate) {
    return 2;
  }
  
  // Campagne 3 : Après le 21/10/2025
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
  const activeCampaign = getActiveCampaignIdDynamic();
  const allCampaigns = [1, 2, 3];
  
  // Masquer toutes les campagnes sauf l'active
  return allCampaigns.filter(id => id !== activeCampaign);
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
 */
export function getVisibleCampaignsForCandidates(): number[] {
  return CAMPAIGN_CONFIG.ALL_CAMPAIGNS.filter(
    (id) => !CAMPAIGN_CONFIG.HIDDEN_CAMPAIGNS.includes(id)
  );
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

