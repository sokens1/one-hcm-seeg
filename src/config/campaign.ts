// Configuration de la campagne de candidature
// Postes disponibles pour la nouvelle campagne

export const CAMPAIGN_JOBS = [
  "Directeur Juridique, Communication & RSE",
  "Directeur des Systèmes d'Information", 
  "Directeur Audit & Contrôle interne"
];

// Alternative: utiliser des patterns plus flexibles pour les comparaisons
export const CAMPAIGN_JOB_PATTERNS = [
  /Directeur.*Juridique.*Communication.*RSE/i,
  /Directeur.*Systèmes.*Information/i,
  /Directeur.*Audit.*Contrôle.*interne/i
];

// Activer/désactiver le mode campagne (masquer les autres postes)
export const CAMPAIGN_MODE = true;

// Message d'information sur la campagne
export const CAMPAIGN_MESSAGE = "Nouvelle campagne de recrutement - 3 postes disponibles";