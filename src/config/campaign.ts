// Configuration des campagnes de recrutement

export interface Campaign {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

// Définition des 3 campagnes de recrutement
export const CAMPAIGNS: Campaign[] = [
  {
    id: "campaign-1",
    name: "Campagne 1",
    startDate: new Date("2025-08-23T00:00:00"),
    endDate: new Date("2025-09-11T23:59:59"),
    description: "Première campagne de recrutement - 23/08/2025 au 11/09/2025"
  },
  {
    id: "campaign-2",
    name: "Campagne 2",
    startDate: new Date("2025-10-13T00:00:00"),
    endDate: new Date("2025-10-21T23:59:59"),
    description: "Deuxième campagne de recrutement - 13/10/2025 au 21/10/2025"
  },
  {
    id: "campaign-3",
    name: "Campagne 3",
    startDate: new Date("2025-10-21T00:00:00"),
    endDate: new Date("2025-11-03T23:59:59"),
    description: "Troisième campagne de recrutement - 21/10/2025 au 03/11/2025"
  }
];

// Vue globale représente toutes les campagnes
export const GLOBAL_VIEW = {
  id: "global",
  name: "Vue Globale",
  description: "Toutes les campagnes de recrutement"
};

// Fonction pour obtenir une campagne par son ID
export function getCampaignById(campaignId: string): Campaign | null {
  return CAMPAIGNS.find(c => c.id === campaignId) || null;
}

// Fonction pour obtenir la campagne actuelle basée sur la date
export function getCurrentCampaign(): Campaign | null {
  const now = new Date();
  return CAMPAIGNS.find(c => now >= c.startDate && now <= c.endDate) || null;
}

// Fonction pour filtrer les données par campagne
export function isInCampaignPeriod(date: Date | string, campaignId: string): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  
  // Vue globale inclut toutes les dates
  if (campaignId === GLOBAL_VIEW.id) {
    return true;
  }
  
  const campaign = getCampaignById(campaignId);
  if (!campaign) return false;
  
  return checkDate >= campaign.startDate && checkDate <= campaign.endDate;
}

// Ancienne configuration (conservée pour compatibilité)
export const CAMPAIGN_JOBS = [
  "Directeur Juridique, Communication & RSE",
  "Directeur des Systèmes d'Information", 
  "Directeur Audit & Contrôle interne"
];

export const CAMPAIGN_JOB_PATTERNS = [
  /Directeur.*Juridique.*Communication.*RSE/i,
  /Directeur.*Systèmes.*Information/i,
  /Directeur.*Audit.*Contrôle.*interne/i
];

export const CAMPAIGN_MODE = false;
export const CAMPAIGN_MESSAGE = "Nouvelle campagne de recrutement - 3 postes disponibles";