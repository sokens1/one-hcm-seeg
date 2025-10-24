// Configuration des campagnes pour les filtres
export const CAMPAIGN_OPTIONS = [
  { value: 'campaign-1', label: 'Campagne 1' },
  { value: 'campaign-2', label: 'Campagne 2' },
  { value: 'campaign-3', label: 'Campagne 3' }
];

// Configuration des campagnes (pour compatibilité avec l'ancien code)
export const CAMPAIGN_CONFIG = {
  'campaign-1': {
    id: 'campaign-1',
    name: 'Campagne 1',
    startDate: new Date('2025-09-01T00:00:00'),
    endDate: new Date('2025-10-12T23:59:59'),
    description: 'Première campagne de recrutement - 01/09/2025 au 12/10/2025'
  },
  'campaign-2': {
    id: 'campaign-2',
    name: 'Campagne 2',
    startDate: new Date('2025-10-13T00:00:00'),
    endDate: new Date('2025-11-30T23:59:59'),
    description: 'Deuxième campagne de recrutement - 13/10/2025 au 30/11/2025'
  },
  'campaign-3': {
    id: 'campaign-3',
    name: 'Campagne 3',
    startDate: new Date('2025-10-20T00:00:00'),
    endDate: new Date('2025-11-30T23:59:59'),
    description: 'Troisième campagne de recrutement - 20/10/2025 au 30/11/2025'
  },
  // Propriétés pour la compatibilité avec RecruiterJobs
  ALL_CAMPAIGNS: [1, 2, 3],
  ACTIVE_CAMPAIGN_ID: 1
};

// Fonction pour obtenir les campagnes visibles pour les candidats
export function getVisibleCampaignsForCandidates() {
  return [
    CAMPAIGN_CONFIG['campaign-1'],
    CAMPAIGN_CONFIG['campaign-2'],
    CAMPAIGN_CONFIG['campaign-3']
  ];
}