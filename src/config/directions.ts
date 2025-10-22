// Configuration des directions basée sur le fichier Groupes.xlsx
export const DIRECTION_OPTIONS = [
  { value: 'coordination-regions', label: 'Coordination Régions' },
  { value: 'departement-support', label: 'Département Support' },
  { value: 'direction-commerciale-recouvrement', label: 'Direction Commerciale & Recouvrement' },
  { value: 'direction-audit-controle-interne', label: 'Direction de l\'Audit & Contrôle Interne' },
  { value: 'direction-moyens-generaux', label: 'Direction des Moyens Généraux' },
  { value: 'direction-systemes-information', label: 'Direction des Systèmes d\'Information' },
  { value: 'direction-capital-humain', label: 'Direction du Capital Humain' },
  { value: 'direction-exploitation-eau', label: 'Direction Exploitation Eau' },
  { value: 'direction-exploitation-electricite', label: 'Direction Exploitation Electricité' },
  { value: 'direction-finances-comptabilite', label: 'Direction Finances & Comptabilité' },
  { value: 'direction-juridique-communication-rse', label: 'Direction Juridique, Communication & RSE' },
  { value: 'direction-qualite-hygiene-securite-environnement', label: 'Direction Qualité Hygiène Sécurité et Environnement' },
  { value: 'direction-technique-eau', label: 'Direction Technique Eau' },
  { value: 'direction-technique-electricite', label: 'Direction Technique Electricité' }
];

// Mapping exact des postes par direction (basé sur le fichier Excel)
const EXACT_JOB_MAPPING: Record<string, string> = {
  // Coordination Régions
  'chef de délégation ntoum': 'coordination-regions',
  'chef de délégation nord': 'coordination-regions',
  'chef de délégation littoral': 'coordination-regions',
  'chef de délégation centre sud': 'coordination-regions',
  'chef de délégation est': 'coordination-regions',
  
  // Département Support
  'chef de division trésorerie': 'departement-support',
  
  // Direction Commerciale & Recouvrement
  'chef de division facturation recouvrement': 'direction-commerciale-recouvrement',
  'chef de division prépaiement': 'direction-commerciale-recouvrement',
  'chef de division relations clients': 'direction-commerciale-recouvrement',
  'chef de division support clientèle': 'direction-commerciale-recouvrement',
  
  // Direction de l'Audit & Contrôle Interne
  'chef de division audit interne': 'direction-audit-controle-interne',
  'chef de division contrôle': 'direction-audit-controle-interne',
  
  // Direction des Moyens Généraux
  'chef de division gestion du parc automobile': 'direction-moyens-generaux',
  'chef de division logistique & transport': 'direction-moyens-generaux',
  'chef de division achats et stocks': 'direction-moyens-generaux',
  'chef de division gestion du patrimoine et sûreté': 'direction-moyens-generaux',
  
  // Direction des Systèmes d'Information
  'chef de division sig et cartographie': 'direction-systemes-information',
  'chef de division cybersécurité et données': 'direction-systemes-information',
  'chef de division infrastructures réseaux': 'direction-systemes-information',
  'chef de division applications, bases de données et digitalisation': 'direction-systemes-information',
  
  // Direction du Capital Humain
  'chef de division gestion des carrières, paie et recrutement': 'direction-capital-humain',
  'chef de division centre des métiers': 'direction-capital-humain',
  'chef de division réglementation et dialogue social': 'direction-capital-humain',
  'chef de division santé': 'direction-capital-humain',
  
  // Direction Exploitation Eau
  'chef de division conduite (eau)': 'direction-exploitation-eau',
  'chef de division maintenance spécialisée nationale (eau)': 'direction-exploitation-eau',
  'chef de division distribution (eau)': 'direction-exploitation-eau',
  'chef de division production & transport (eau)': 'direction-exploitation-eau',
  
  // Direction Exploitation Electricité
  'chef de division production hydraulique': 'direction-exploitation-electricite',
  'chef de division transport et mouvement d\'energie': 'direction-exploitation-electricite',
  'chef de division production thermique': 'direction-exploitation-electricite',
  'chef de division distribution electricité': 'direction-exploitation-electricite',
  'chef de division maintenance spécialisée nationale (electricité)': 'direction-exploitation-electricite',
  
  // Direction Finances & Comptabilité
  'chef de division comptabilité': 'direction-finances-comptabilite',
  'chef de division budget et contrôle de gestion': 'direction-finances-comptabilite',
  
  // Direction Juridique, Communication & RSE
  'chef de division juridique': 'direction-juridique-communication-rse',
  'chef de division communication': 'direction-juridique-communication-rse',
  'chef de division responsabilité sociétale d\'entreprise': 'direction-juridique-communication-rse',
  
  // Direction Qualité Hygiène Sécurité et Environnement
  'chef de division hygiène sécurité environnement et gestion des risques': 'direction-qualite-hygiene-securite-environnement',
  'chef de division qualité et performance opérationnelle': 'direction-qualite-hygiene-securite-environnement',
  
  // Direction Technique Eau
  'chef de division support technique eau': 'direction-technique-eau',
  'chef de division etudes et travaux neufs eau': 'direction-technique-eau',
  'chef de division qualité et performance opérationnelle (eau)': 'direction-technique-eau',
  
  // Direction Technique Electricité
  'chef de division etudes et travaux production electricité': 'direction-technique-electricite',
  'chef de division etudes et travaux transport electricité': 'direction-technique-electricite',
  'chef de division etudes et travaux distribution electricité': 'direction-technique-electricite',
};

// Mots-clés pour la classification par mots-clés (fallback)
export const DIRECTION_KEYWORDS: Record<string, string[]> = {
  'coordination-regions': ['délégation', 'coordination régions', 'ntoum', 'littoral', 'centre sud'],
  'departement-support': ['trésorerie', 'département support'],
  'direction-commerciale-recouvrement': ['facturation', 'recouvrement', 'prépaiement', 'relations clients', 'clientèle'],
  'direction-audit-controle-interne': ['audit interne', 'contrôle interne'],
  'direction-moyens-generaux': ['parc automobile', 'logistique', 'achats', 'stocks', 'patrimoine', 'sûreté'],
  'direction-systemes-information': ['sig', 'cartographie', 'cybersécurité', 'infrastructures réseaux', 'applications', 'bases de données', 'digitalisation'],
  'direction-capital-humain': ['carrières', 'paie', 'recrutement', 'centre des métiers', 'réglementation', 'dialogue social', 'santé'],
  'direction-exploitation-eau': ['conduite (eau)', 'maintenance spécialisée nationale (eau)', 'distribution (eau)', 'production & transport (eau)'],
  'direction-exploitation-electricite': ['production hydraulique', 'transport et mouvement d\'energie', 'production thermique', 'distribution electricité', 'maintenance spécialisée nationale (electricité)'],
  'direction-finances-comptabilite': ['comptabilité', 'budget', 'contrôle de gestion'],
  'direction-juridique-communication-rse': ['juridique', 'communication', 'responsabilité sociétale d\'entreprise'],
  'direction-qualite-hygiene-securite-environnement': ['hygiène', 'sécurité', 'environnement', 'gestion des risques', 'qualité', 'performance opérationnelle'],
  'direction-technique-eau': ['support technique eau', 'etudes et travaux neufs eau', 'qualité et performance opérationnelle (eau)'],
  'direction-technique-electricite': ['etudes et travaux production electricité', 'etudes et travaux transport electricité', 'etudes et travaux distribution electricité']
};

// Fonction pour normaliser le titre d'un poste
function normalizeJobTitle(jobTitle: string): string {
  return jobTitle
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
    .replace(/['']/g, '\'') // Normaliser les apostrophes
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/à/g, 'a')
    .replace(/ô/g, 'o')
    .replace(/ù/g, 'u')
    .replace(/ç/g, 'c');
}

// Fonction pour classifier un poste selon sa direction
export function classifyJobByDirection(jobTitle: string): string {
  const normalizedTitle = normalizeJobTitle(jobTitle);
  
  // 1. Essayer d'abord le mapping exact
  if (EXACT_JOB_MAPPING[normalizedTitle]) {
    return EXACT_JOB_MAPPING[normalizedTitle];
  }
  
  // 2. Si pas de match exact, essayer la classification par mots-clés
  for (const [directionKey, keywords] of Object.entries(DIRECTION_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeJobTitle(keyword);
      if (normalizedTitle.includes(normalizedKeyword)) {
        return directionKey;
      }
    }
  }
  
  // 3. Si aucun match, retourner 'unknown'
  return 'unknown';
}

// Fonction pour obtenir le label d'une direction
export function getDirectionLabel(directionKey: string): string {
  const direction = DIRECTION_OPTIONS.find(d => d.value === directionKey);
  return direction ? direction.label : 'Direction inconnue';
}