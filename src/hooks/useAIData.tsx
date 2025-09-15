/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

export interface AICandidateData {
  nom: string;
  prenom: string;
  poste: string;
  conformite?: {
    score_conformité: number;
    commentaire: string;
  };
  mtp?: {
    scores: {
      Métier: number;
      Talent: number;
      Paradigme: number;
      Moyen: number;
    };
    score_moyen?: number;
    niveau: string;
    verdict: string;
    points_forts: string[];
    points_a_travailler: string[];
    rang: number;
  };
  similarite_offre?: {
    resume_experience: string | { nombre_d_annees: number; specialite: string };
    score: number;
    commentaire_score: string;
    forces: string[];
    faiblesses: string[];
    verdict: string;
    rang: number;
  };
  feedback?: {
    score: number;
    verdict: string;
    raisons: string;
    points_forts: string[];
    points_a_travailler: string[];
    rang: number;
  };
  resume_global: {
    score_global: number;
    commentaire_global: string;
    forces: string | string[];
    points_a_ameliorer: string | string[];
    verdict: string;
    rang_global: number;
  };
}

export interface AIDataResponse {
  [departmentName: string]: AICandidateData[];
}

// Fonction utilitaire pour valider la structure des données JSON
const validateJsonStructure = (jsonData: Record<string, unknown>, fileName: string): boolean => {
  const entries = Object.entries(jsonData);
  if (entries.length === 0) {
    console.warn(`Fichier ${fileName} est vide`);
    return false;
  }

  // Vérifier que chaque candidat a au moins une structure de base
  const invalidEntries = entries.filter(([key, value]) => {
    if (typeof value !== 'object' || value === null) {
      console.warn(`Candidat ${key} dans ${fileName} a des données invalides`);
      return true;
    }
    return false;
  });

  if (invalidEntries.length > 0) {
    console.warn(`${invalidEntries.length} candidat(s) invalide(s) dans ${fileName}`);
  }

  return true;
};

export function useAIData() {
  const [data, setData] = useState<AIDataResponse>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Éviter les re-chargements multiples
    if (isInitialized) return;
    
    const loadAIData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Configuration des départements - facilement extensible
        const departments = [
          { name: 'Chef de Département Eau', file: '/chef_departement_eau.json' },
           {name: 'Moyens généraux', file: '/moyens_generaux_complet.json'},
          {name: 'Directeur Technique Eau', file: '/directeur_technique_eau.json'},
          {name: 'Directeur Exploitation Eau', file: '/directeur_exploitation_eau.json'},
          {name: 'Chef de Département Electricite', file: '/chef_departement_electricite.json'},
          {name: 'Coordonnateur des Régions', file: '/coordonnateur_des_regions.json'},
          {name: 'Directeur Audit & Contrôle interne', file: '/directeur_audit_et_controle_interne.json'},
          {name: 'Directeur Qualité, Hygiène, Sécurité & Environnement', file: '/directeur_qualite_hygiene_securite_environnement.json'},
          {name: 'Directeur des Systèmes d\'Information', file: '/directeur_des_systemes_d_information.json'},
          {name: 'Directeur Commercial et Recouvrement', file: '/directeur_commercial_et_recouvrement.json'},
          {name: 'Directeur du Capital Humain', file: '/directeur_du_capital_humain.json'},
          {name: 'Directeur Finances et Comptabilités', file: '/directeur_finances_et_comptabilite.json'},
          {name: 'Directeur Juridique, Communication & RSE', file: '/directeur_juridique_communication_rse.json'},
           {name: 'Directeur Technique Electricite', file: '/directeur_technique_electricité.json'},        // {name: 'Directeur Technique Eau', file: '/directeur_technique_eau.json'},
           {name: 'Directeur Exploitation Electricite', file: '/directeur_exploitation_electricite.json'},
           {name: 'Chef de Departement Support', file: '/chef_de_departement_support.json'},
        ];

        // Charger dynamiquement tous les fichiers JSON
        const responses = await Promise.all(
          departments.map(dept => fetch(dept.file))
        );

        // Vérifier que tous les fichiers ont été chargés avec succès
        const failedResponses = responses.filter(response => !response.ok);
        if (failedResponses.length > 0) {
          const failedFiles = departments.filter((_, index) => !responses[index].ok);
          console.warn(`Fichiers non trouvés: ${failedFiles.map(f => f.file).join(', ')}`);
          
          // Continuer avec les fichiers disponibles au lieu de tout échouer
          const validResponses = responses.filter(response => response.ok);
          const validJsonData = await Promise.all(
            validResponses.map(response => response.json())
          );
          
          // Organiser les données valides
          const transformedData: AIDataResponse = {};
          let validIndex = 0;
          departments.forEach((dept, index) => {
            if (responses[index].ok) {
              // Gestion spéciale pour les départements qui ont une structure imbriquée
              if (dept.name === 'Moyens généraux') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const directorData = nestedData['Directeur Moyens Généraux'];
                
                if (directorData && typeof directorData === 'object') {
                  const rawData = transformData(directorData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Directeur Technique Eau') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const directorData = nestedData['Directeur Technique Eau'];
                
                if (directorData && typeof directorData === 'object') {
                  const rawData = transformData(directorData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Chef de Département Electricite') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const directorData = nestedData['Chef de Département Electricité'];
                
                if (directorData && typeof directorData === 'object') {
                  // Accéder aux candidats dans la structure imbriquée
                  const candidatsData = directorData.candidats as Record<string, unknown> | undefined;
                  if (candidatsData && typeof candidatsData === 'object') {
                    const rawData = transformData(candidatsData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                    console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                  } else {
                    transformedData[dept.name] = [];
                    console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                  }
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Directeur Exploitation Eau') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const directorData = nestedData['Directeur Exploitation Eau'];
                
                if (directorData && typeof directorData === 'object') {
                  const rawData = transformData(directorData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Coordonnateur des Régions') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const coordData = nestedData['Coordonnateur des Régions'];
                
                if (coordData && typeof coordData === 'object') {
                  // Accéder aux candidats dans la structure imbriquée
                  const candidatsData = coordData.candidats as Record<string, unknown> | undefined;
                  if (candidatsData && typeof candidatsData === 'object') {
                    const rawData = transformData(candidatsData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                  } else {
                    transformedData[dept.name] = [];
                    console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                  }
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Directeur Audit & Contrôle interne') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const auditData = nestedData['Directeur Audit & Contrôle interne'];
                
                if (auditData && typeof auditData === 'object') {
                  const rawData = transformData(auditData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
               } else if (dept.name === 'Directeur des Systèmes d\'Information') {
                 const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                 
                 // Utiliser la première clé disponible (plus robuste)
                 const availableKeys = Object.keys(nestedData);
                 const dsiData = availableKeys.length > 0 ? nestedData[availableKeys[0]] : null;
                 
                 if (dsiData && typeof dsiData === 'object') {
                   const rawData = transformData(dsiData, true);
                   transformedData[dept.name] = deduplicateCandidates(rawData);
                  //  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                 } else {
                   transformedData[dept.name] = [];
                   console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                 }
              } else if (dept.name === 'Directeur Qualité, Hygiène, Sécurité & Environnement') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const qhseData = nestedData['Directeur Qualité, Hygiène, Sécurité & Environnement'];
                
                if (qhseData && typeof qhseData === 'object') {
                  const rawData = transformData(qhseData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Directeur Commercial et Recouvrement') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const commercialData = nestedData['Directeur Commercial et Recouvrement'];
                
                if (commercialData && typeof commercialData === 'object') {
                  const rawData = transformData(commercialData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Directeur du Capital Humain') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const capitalHumainData = nestedData['Directeur du Capital Humain'];
                
                if (capitalHumainData && typeof capitalHumainData === 'object') {
                  const rawData = transformData(capitalHumainData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Directeur Finances et Comptabilités') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const financesData = nestedData['Directeur Finances et Comptabilité'];
                
                if (financesData && typeof financesData === 'object') {
                  const rawData = transformData(financesData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Directeur Juridique, Communication & RSE') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const juridiqueData = nestedData['Directeur Juridique, Communication & RSE'];
                
                if (juridiqueData && typeof juridiqueData === 'object') {
                  const rawData = transformData(juridiqueData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Directeur Technique Electricite') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const techniqueElecData = nestedData['Directeur Technique Electricité'];
                
                if (techniqueElecData && typeof techniqueElecData === 'object') {
                  const rawData = transformData(techniqueElecData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Directeur Exploitation Electricite') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const exploitationElecData = nestedData['Directeur Exploitation Electricité'];
                
                if (exploitationElecData && typeof exploitationElecData === 'object') {
                  const rawData = transformData(exploitationElecData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Chef de Departement Support') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const supportData = nestedData['Chef de Département Support'];
                
                if (supportData && typeof supportData === 'object') {
                  const rawData = transformData(supportData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Chef de Département Eau') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const chefEauData = nestedData['Chef de Département Eau'];
                
                if (chefEauData && typeof chefEauData === 'object') {
                  // Accéder aux candidats dans la structure imbriquée
                  const candidatsData = chefEauData.candidats as Record<string, unknown> | undefined;
                  if (candidatsData && typeof candidatsData === 'object') {
                    const rawData = transformData(candidatsData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                  } else {
                    transformedData[dept.name] = [];
                    console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                  }
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else {
                const rawData = transformData(validJsonData[validIndex], false);
                transformedData[dept.name] = deduplicateCandidates(rawData);
              }
              validIndex++;
            } else {
              // Ajouter un département vide pour les fichiers manquants
              transformedData[dept.name] = [];
              console.warn(`Département ${dept.name} ignoré (fichier ${dept.file} non trouvé)`);
            }
          });
          
          setData(transformedData);
          return;
        }

        // Parser tous les fichiers JSON
        const jsonData = await Promise.all(
          responses.map(response => response.json())
        );

        // Fonction pour dédupliquer les candidats basée sur le nom complet
        const deduplicateCandidates = (candidates: AICandidateData[]): AICandidateData[] => {
          const seen = new Map<string, AICandidateData>();
          
          // Liste complète des doublons connus (nom complet -> nom abrégé)
          const knownDuplicates: Record<string, string> = {
            // Directeur Moyens Généraux
            "Diane Mauricette Ollomo": "Diane Ollomo",
            "Raissa Aimee Nse Obiang": "Raissa Obiang",
            "Jean Vava Alain Moucke Nzoumba": "Jean Moucke Nzoumba",
            "Pascal Alain Noumba": "Pascal Noumba",
            "Emilienne Debra Frederique Ndong Essono": "Emilienne Ndong Essono",
            "Pulcherie Nicole Assame Née Nigouegouni": "Pulcherie Assame Née Nigouegouni",
            "Olivia Anna Igoho Otiga": "Olivia Igoho Otiga",
            "Marie Claude Bissi Rekangalt": "Marie Claude",
            "Emery Patrick Nkouele Mve": "Emery Nkouele Mve",
            "Paul Terence Okoumba": "Paul Okoumba",
            "André Derek Mbongo": "André Mbongo",
            "Emilienne Debra Frédérique Ndong Essono": "Emilienne Ndong Essono",
            "Raïssa Aimée Nse Obiang": "Raissa Obiang",
            "Pulcherie Assame Née Nigouegouni": "Pulcherie Assame Née Nigouegouni",
            // Chef de Département Eau
            "Wilfrid Pascal Andjayi": "Wilfrid Andjayi",
            "Jean Christian Ibouily": "Jean Ibouily",
            "Luc Thomas Tsioba": "Luc Tsioba",
            "Armel Gérard Davy Okouaghe": "Armel Okouaghe",
            // Directeur Technique Eau
            "Sylvain A Boussoungou": "Sylvain Boussoungou",
            "Jeanne Marie Agathe Ondo": "Jeanne Ondo",
            "Murielle Rose Missie": "Murielle Missie",
            "Aude Murielle Akoe Mba": "Aude Akoe Mba",
            "Hermann Tanda Nkombe": "Hermann Tanda",
            "Eric Serge Obounou": "Eric Obounou",
            // Chef de Département Electricité
            "Pépin Jonas Ozela Nguema": "Pépin Ozela Nguema",
            // Directeur Exploitation Eau
            "Victor Ghislain Ogoula": "Victor Ogoula",
            // Coordonnateur des Régions
            "Remus Arnold Mbouogho": "Remus Mbouogho",
            "Maria Evans Ze Ebe": "Maria Ze Ebe",
            "Jean Fabrice Ondo Mayi": "Jean Ondo Mayi",
            "Louis De Gonzague Mboulou Assoumou": "Louis Mboulou Assoumou",
            "Steve Olivier N'Nang": "Steve N'Nang",
            // Directeur Audit & Contrôle interne
            "Marie Ange Nambo Wezet Née Mbourou Lamasse": "Marie Ange Nambo Wezet",
            "Aude Tania Akoure Eyang": "Aude Akoure Eyang",
            "Marie Nambo Wezet Née Mbourou Lamasse": "Marie Ange Nambo Wezet",
            "Anouchka Claude Émilie Ekome Mbeng Née Ntsame Nzoghe": "Anouchka Ekome Mbeng Née Ntsame Nzoghe",
            "Hans Dimitri Owele": "Hans Owele",
            // Directeur des Systèmes d'Information
            "Steeve Ydrice Malouki Mouyapou": "Steeve Malouki Mouyapou",
            "Guy Armel Koumba": "Guy Koumba",
            "Alain Roger Koumba Vi": "Alain Koumba Vi",
            "Derille Ovono Ename": "Dérille Ovono Ename",
            // Directeur Qualité, Hygiène, Sécurité & Environnement
            "Amandine Rolande Obone Mba": "Amandine Obone Mba",
            "Ian Yelnick Ndjongue Tanda": "Ian Ndjongue Tanda",
            "Yves Davy Ndimina Mokaghat": "Yves Ndimina Mokaghat",
            "Augusta Britt Honorine Hervo-Akendengue Ziza Ép. Elisee Ndam": "Augusta Ziza Ép. Elisee Ndam",
            // Directeur Commercial et Recouvrement
            "Marie Florence Eyamame": "Marie Eyamame",
            "Georges Jacques S Tigoue": "Georges Tigoue",
            "Karl Alex Jean Youyatte": "Karl Youyatte",
            "Marlyne Armelle Ziza": "Marlyne Ziza",
            "Franck Armel Mendome": "Franck Mendome",
            // Directeur du Capital Humain
            "Nadine Léa Ghediba Mavanga": "Nadine Mavanga",
            "Katia Sandrine Ondo": "Katia Ondo",
            // Directeur Finances et Comptabilité
            // Directeur Juridique, Communication & RSE
            "Sonia Matty Boussoughou": "Sonia Boussoughou",
            "Boris Armel Zue Meye": "Boris Zue Meye",
            // Directeur Technique Electricité
            "Guy Lucien Mayombo": "Guy Mayombo",
            // Directeur Exploitation Electricité
            "Stell Emeraude Zeng": "Stell Zeng",
            // Chef de Département Support
            "Wilfried Jimmy Moukoumi": "Wilfried Moukoumi",
            "Esther - Rodrigue Olanga": "Esther Olanga",
            "Georges Jacques S Tigaoue": "Georges Jacques S Tigoue"
          };
          
          candidates.forEach(candidate => {
            const fullName = `${candidate.prenom} ${candidate.nom}`;
            
            // Vérifier si c'est un doublon connu
            if (knownDuplicates[fullName]) {
              const shortName = knownDuplicates[fullName];
              const shortKey = shortName.toLowerCase()
                .replace(/[éèêë]/g, 'e')
                .replace(/[àâä]/g, 'a')
                .replace(/[ùûü]/g, 'u')
                .replace(/[îï]/g, 'i')
                .replace(/[ôö]/g, 'o')
                .replace(/[ç]/g, 'c');
              
              if (seen.has(shortKey)) {
                // C'est un doublon, garder celui avec le nom le plus long
                const existing = seen.get(shortKey)!;
                const existingFullName = `${existing.prenom} ${existing.nom}`;
                
                if (fullName.length > existingFullName.length) {
                  seen.set(shortKey, candidate);
                }
              } else {
                // Premier candidat de ce groupe, l'ajouter
                seen.set(shortKey, candidate);
              }
            } else {
              // Candidat normal, utiliser la déduplication standard
              const keys = generateDeduplicationKeys(candidate.prenom, candidate.nom);
              
              let isDuplicate = false;
              let bestKey = keys[0];
              
              // Vérifier si ce candidat est un doublon avec une clé existante
              for (const key of keys) {
                if (seen.has(key)) {
                  isDuplicate = true;
                  bestKey = key;
                  break;
                }
              }
              
              if (isDuplicate) {
                const existing = seen.get(bestKey)!;
                const existingFullName = `${existing.prenom} ${existing.nom}`;
                const currentFullName = `${candidate.prenom} ${candidate.nom}`;
                
                // Garder celui avec le nom le plus long (plus complet)
                if (currentFullName.length > existingFullName.length) {
                  seen.set(bestKey, candidate);
                }
              } else {
                // Nouveau candidat, utiliser la première clé
                seen.set(bestKey, candidate);
              }
            }
          });
          
          return Array.from(seen.values());
        };

        // Générer plusieurs clés de déduplication pour capturer différents types de doublons
        const generateDeduplicationKeys = (prenom: string, nom: string): string[] => {
          const normalized = normalizeCandidateName(prenom, nom);
          const words = normalized.split(' ');
          
          const keys = [normalized]; // Clé complète
          
          // Clé avec prénom + premier mot du nom
          if (words.length >= 2) {
            keys.push(`${words[0]} ${words[1]}`);
          }
          
          // Clé avec prénom + dernier mot du nom (pour les cas comme "Jean Moucke Nzoumba" vs "Jean Vava Alain Moucke Nzoumba")
          if (words.length >= 2) {
            keys.push(`${words[0]} ${words[words.length - 1]}`);
          }
          
          // Clé avec prénom + mots du milieu (pour capturer les variations)
          if (words.length >= 3) {
            keys.push(`${words[0]} ${words[1]} ${words[2]}`);
          }
          
          return [...new Set(keys)]; // Supprimer les doublons
        };

        // Fonction pour normaliser les noms de candidats (gère les doublons)
        const normalizeCandidateName = (prenom: string, nom: string): string => {
          const fullName = `${prenom.toLowerCase().trim()} ${nom.toLowerCase().trim()}`
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ç]/g, 'c')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Extraire les mots clés du nom (prénom + premiers mots significatifs)
          const words = fullName.split(' ').filter(w => w.length > 2);
          
          // Pour une déduplication plus agressive, utiliser prénom + 2 premiers mots du nom
          if (words.length >= 3) {
            return `${words[0]} ${words[1]} ${words[2]}`;
          } else if (words.length >= 2) {
            return `${words[0]} ${words[1]}`;
          }
          return fullName;
        };

        // Transformer les données pour uniformiser le format
        const transformData = (jsonData: Record<string, unknown>, isMoyensGeneraux: boolean = false): AICandidateData[] => {
          return Object.entries(jsonData).map(([key, value]: [string, unknown]) => {
            // Gestion robuste des noms (supporte différents formats)
            const nameParts = key.split(' ').filter(part => part.trim() !== '');
            const prenom = nameParts[0] || 'Inconnu';
            const nom = nameParts.slice(1).join(' ') || 'Inconnu';

            // Vérifier que value est un objet
            if (typeof value !== 'object' || value === null) {
              console.warn(`Données invalides pour le candidat: ${key}`);
              return {
                nom,
                prenom,
                poste: isMoyensGeneraux ? 'Directeur Moyens Généraux' : 'Chef de Département',
                resume_global: {
                  score_global: 0,
                  commentaire_global: 'Données invalides',
                  forces: [],
                  points_a_ameliorer: [],
                  verdict: 'Non évalué',
                  rang_global: 0
                }
              };
            }

            const candidateData = value as Record<string, unknown>;

            // Fonction utilitaire pour extraire des données de manière sécurisée
            const safeExtract = (obj: Record<string, unknown>, path: string[], defaultValue: any = null) => {
              let current = obj;
              for (const key of path) {
                if (current && typeof current === 'object' && key in current) {
                  current = current[key] as Record<string, unknown>;
                } else {
                  return defaultValue;
                }
              }
              return current;
            };

            // Fonction pour normaliser les scores (gère les pourcentages et décimales)
            const normalizeScore = (score: unknown): number => {
              if (typeof score === 'number') {
                return score > 1 ? score / 100 : score; // Convertit les pourcentages en décimales
              }
              if (typeof score === 'string') {
                const parsed = parseFloat(score);
                return isNaN(parsed) ? 0 : (parsed > 1 ? parsed / 100 : parsed);
              }
              return 0;
            };

            // Gestion robuste des scores MTP avec différentes clés possibles
            const mtpData = candidateData.mtp as Record<string, unknown> | undefined;
            const mtpScoreData = isMoyensGeneraux
              ? mtpData // Pour moyens généraux, les données sont directement dans mtp
              : mtpData?.['score MTP'] as Record<string, unknown> | undefined;
            
            // Vérifier si mtpScoreData est un objet valide avec des données
            const hasValidMtpData = mtpScoreData && 
              typeof mtpScoreData === 'object' && 
              Object.keys(mtpScoreData).length > 0 &&
              (mtpScoreData.scores || mtpScoreData.Score_moyen || mtpScoreData.verdict);
            
            const mtpScores = mtpScoreData ? (mtpScoreData.scores as Record<string, number> | undefined || {}) : {};
            
            // Normalisation des scores MTP (gère différentes variantes de clés)
            const normalizedMtpScores = {
              Métier: normalizeScore(mtpScores.Métier || mtpScores.Metier || mtpScores.metier || 0),
              Talent: normalizeScore(mtpScores.Talent || mtpScores.talent || 0),
              Paradigme: normalizeScore(mtpScores.Paradigme || mtpScores.paradigme || 0),
              Moyen: normalizeScore(mtpScores.Moyen || mtpScores.moyen || 0)
            };

            // Gestion robuste de la conformité (structure différente selon le fichier)
            const conformiteData = candidateData.conformite as Record<string, unknown> | undefined;
            const conformiteScoreData = isMoyensGeneraux
              ? conformiteData // Pour moyens généraux, les données sont directement dans conformite
              : conformiteData?.['score de conformité'] as Record<string, unknown> | undefined;

            // Gestion robuste de la similarité (clés différentes selon le fichier)
            const similariteData = isMoyensGeneraux 
              ? candidateData.completude as Record<string, unknown> | undefined
              : candidateData.similarite_offre as Record<string, unknown> | undefined;
            const similariteScoreData = isMoyensGeneraux
              ? similariteData // Pour moyens généraux, les données sont directement dans completude
              : similariteData?.['score de complétude'] as Record<string, unknown> | undefined;

            // Gestion robuste du résumé global (clés différentes selon le fichier)
            const resumeGlobalData = isMoyensGeneraux
              ? candidateData.global as Record<string, unknown> | undefined
              : candidateData.resume_global as Record<string, unknown> | undefined;

            // Gestion robuste des feedbacks (structure différente selon le fichier)
            const feedbackData = isMoyensGeneraux
              ? candidateData.feedback as Record<string, unknown> | undefined
              : candidateData.feedback as Record<string, unknown> | undefined; // Les feedbacks sont dans tous les fichiers maintenant
            
            // Vérifier si feedbackData est un objet valide avec des données
            const hasValidFeedbackData = feedbackData && 
              typeof feedbackData === 'object' && 
              Object.keys(feedbackData).length > 0 &&
              (feedbackData.score || feedbackData.verdict || feedbackData.raisons);

            // Extraction du poste (gère différentes sources)
            const poste = (mtpScoreData?.poste as string) || 
                         (similariteScoreData?.poste as string) || 
                         (resumeGlobalData?.poste as string) ||
                         (isMoyensGeneraux ? 'Directeur Moyens Généraux' : 'Chef de Département');

            // Gestion robuste des scores de similarité
            const similarityScore = normalizeScore(similariteScoreData?.score);

            // Fonction pour valider et nettoyer les données candidat
            const validateCandidateData = (): AICandidateData => {
              try {
            return {
              nom,
              prenom,
              poste,
              conformite: conformiteScoreData ? {
                    score_conformité: Math.max(0, Math.min(100, (conformiteScoreData.score_conformité as number) || 0)),
                commentaire: (conformiteScoreData.commentaire as string) || 'Aucun commentaire'
              } : undefined,
                  mtp: hasValidMtpData ? {
                scores: normalizedMtpScores,
                    score_moyen: normalizeScore(mtpScoreData?.Score_moyen),
                    niveau: (mtpScoreData?.niveau as string) || 'Non évalué',
                    verdict: (mtpScoreData?.verdict as string) || 'Non évalué',
                    points_forts: Array.isArray(mtpScoreData?.points_forts) ? 
                      (mtpScoreData.points_forts as string[]).filter(p => p && p.trim()) : [],
                    points_a_travailler: Array.isArray(mtpScoreData?.points_a_travailler) ? 
                      (mtpScoreData.points_a_travailler as string[]).filter(p => p && p.trim()) : [],
                    rang: Math.max(0, (mtpScoreData?.rang as number) || 0)
              } : undefined,
              similarite_offre: similariteScoreData ? {
                resume_experience: similariteScoreData.resume_experience as string | { nombre_d_annees: number; specialite: string },
                score: similarityScore,
                    commentaire_score: (similariteScoreData.commentaire_score as string) || 
                                     (similariteScoreData.raison_verdict as string) || 
                                 (similariteScoreData.verdict_raison as string) ||
                                 (similariteScoreData.raison_du_verdict as string) ||
                                 (similariteScoreData.raisin_du_verdict as string) ||
                                 (similariteScoreData.reason_verdict as string) ||
                                     (similariteScoreData.raison as string) || 
                                 (similariteScoreData.reason as string) ||
                                 (similariteScoreData.phrase_verdict as string) ||
                                 (similariteScoreData.verdict_explanation as string) ||
                                     'Aucun commentaire',
                    forces: Array.isArray(similariteScoreData.points_forts) ? 
                           (similariteScoreData.points_forts as string[]).filter(f => f && f.trim()) : 
                           Array.isArray(similariteScoreData.forces) ? 
                           (similariteScoreData.forces as string[]).filter(f => f && f.trim()) : [],
                    faiblesses: Array.isArray(similariteScoreData.points_a_travailler) ? 
                               (similariteScoreData.points_a_travailler as string[]).filter(f => f && f.trim()) : 
                               Array.isArray(similariteScoreData.faiblesses) ? 
                               (similariteScoreData.faiblesses as string[]).filter(f => f && f.trim()) : [],
                verdict: (similariteScoreData.verdict as string) || 'Non évalué',
                    rang: Math.max(0, (similariteScoreData.rang as number) || 0)
                  } : undefined,
                  feedback: hasValidFeedbackData ? {
                    score: normalizeScore(feedbackData?.score),
                    verdict: (feedbackData?.verdict as string) || 'Non évalué',
                    raisons: (feedbackData?.raisons as string) || 'Aucun commentaire',
                    points_forts: Array.isArray(feedbackData?.['Points forces']) ? 
                                 (feedbackData['Points forces'] as string[]).filter(p => p && p.trim()) : [],
                    points_a_travailler: Array.isArray(feedbackData?.['Points à travailler']) ? 
                                        (feedbackData['Points à travailler'] as string[]).filter(p => p && p.trim()) : [],
                    rang: Math.max(0, (feedbackData?.rang as number) || 0)
              } : undefined,
              resume_global: {
                    score_global: normalizeScore(resumeGlobalData?.score_global),
                    commentaire_global: (resumeGlobalData?.commentaire_global as string) || 
                                       (resumeGlobalData?.resume as string) || 
                                       'Aucun commentaire',
                    forces: Array.isArray(resumeGlobalData?.points_forts) ? 
                           (resumeGlobalData.points_forts as string[]).filter(f => f && f.trim()) : 
                           Array.isArray(resumeGlobalData?.forces) ? 
                           (resumeGlobalData.forces as string[]).filter(f => f && f.trim()) :
                           typeof resumeGlobalData?.forces === 'string' ? 
                           [resumeGlobalData.forces].filter(f => f && f.trim()) : [],
                    points_a_ameliorer: Array.isArray(resumeGlobalData?.points_a_ameliorer) ? 
                                       (resumeGlobalData.points_a_ameliorer as string[]).filter(p => p && p.trim()) : 
                                       Array.isArray(resumeGlobalData?.points_a_travailler) ? 
                                       (resumeGlobalData.points_a_travailler as string[]).filter(p => p && p.trim()) :
                                       typeof resumeGlobalData?.points_a_ameliorer === 'string' ? 
                                       [resumeGlobalData.points_a_ameliorer].filter(p => p && p.trim()) : [],
                verdict: (resumeGlobalData?.verdict as string) || 'Non évalué',
                    rang_global: Math.max(0, (resumeGlobalData?.rang_global as number) || (resumeGlobalData?.rang as number) || 0)
                  }
                };
              } catch (error) {
                console.error(`Erreur lors de la validation des données pour ${key}:`, error);
                // Retourner des données par défaut en cas d'erreur
                return {
                  nom,
                  prenom,
                  poste: isMoyensGeneraux ? 'Directeur Moyens Généraux' : 'Chef de Département',
                  resume_global: {
                    score_global: 0,
                    commentaire_global: 'Erreur lors du chargement des données',
                    forces: [],
                    points_a_ameliorer: [],
                    verdict: 'Non évalué',
                    rang_global: 0
                  }
                };
              }
            };

            return validateCandidateData();
          });
        };

        // Transformer et organiser les données par département
        const transformedData: AIDataResponse = {};
        departments.forEach((dept, index) => {
          // Valider la structure avant transformation
          if (validateJsonStructure(jsonData[index], dept.file)) {
            // Gestion spéciale pour les départements qui ont une structure imbriquée
            if (dept.name === 'Moyens généraux') {
              // Le fichier moyens_generaux_complet.json a une structure imbriquée
              // avec "Directeur Moyens Généraux" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const directorData = nestedData['Directeur Moyens Généraux'];
              
              if (directorData && typeof directorData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = directorData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur Technique Eau') {
              // Le fichier directeur_technique_eau.json a une structure imbriquée
              // avec "Directeur Technique Eau" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const directorData = nestedData['Directeur Technique Eau'];
              
              if (directorData && typeof directorData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = directorData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Chef de Département Electricite') {
              // Le fichier chef_departement_electricite.json a une structure imbriquée
              // avec "Chef de Département Electricité" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const directorData = nestedData['Chef de Département Electricité'];
              
              if (directorData && typeof directorData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = directorData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur Exploitation Eau') {
              // Le fichier directeur_exploitation_eau.json a une structure imbriquée
              // avec "Directeur Exploitation Eau" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const directorData = nestedData['Directeur Exploitation Eau'];
              
              if (directorData && typeof directorData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = directorData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Coordonnateur des Régions') {
              // Le fichier coordonnateur_des_regions.json a une structure imbriquée
              // avec "Coordonnateur des Régions" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const coordData = nestedData['Coordonnateur des Régions'];
              
              if (coordData && typeof coordData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = coordData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur Audit & Contrôle interne') {
              // Le fichier directeur_audit_et_controle_interne.json a une structure imbriquée
              // avec "Directeur Audit & Contrôle interne" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const auditData = nestedData['Directeur Audit & Contrôle interne'];
              
              if (auditData && typeof auditData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = auditData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur des Systèmes d\'Information') {
              // Le fichier directeur_des_systemes_d_information.json a une structure imbriquée
              // avec "Directeur des Systèmes d'Information" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              
              // Utiliser la première clé disponible (plus robuste)
              const availableKeys = Object.keys(nestedData);
              const dsiData = availableKeys.length > 0 ? nestedData[availableKeys[0]] : null;
              
              if (dsiData && typeof dsiData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = dsiData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur Qualité, Hygiène, Sécurité & Environnement') {
              // Le fichier directeur_qualite_hygiene_securite_environnement.json a une structure imbriquée
              // avec "Directeur Qualité, Hygiène, Sécurité & Environnement" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const qhseData = nestedData['Directeur Qualité, Hygiène, Sécurité & Environnement'];
              
              if (qhseData && typeof qhseData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = qhseData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur Commercial et Recouvrement') {
              // Le fichier directeur_commercial_et_recouvrement.json a une structure imbriquée
              // avec "Directeur Commercial et Recouvrement" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const commercialData = nestedData['Directeur Commercial et Recouvrement'];
              
              if (commercialData && typeof commercialData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = commercialData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur du Capital Humain') {
              // Le fichier directeur_du_capital_humain.json a une structure imbriquée
              // avec "Directeur du Capital Humain" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const capitalHumainData = nestedData['Directeur du Capital Humain'];
              
              if (capitalHumainData && typeof capitalHumainData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = capitalHumainData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur Finances et Comptabilités') {
              // Le fichier directeur_finances_et_comptabilite.json a une structure imbriquée
              // avec "Directeur Finances et Comptabilité" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const financesData = nestedData['Directeur Finances et Comptabilité'];
              
              if (financesData && typeof financesData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = financesData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur Juridique, Communication & RSE') {
              // Le fichier directeur_juridique_communication_rse.json a une structure imbriquée
              // avec "Directeur Juridique, Communication & RSE" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const juridiqueData = nestedData['Directeur Juridique, Communication & RSE'];
              
              if (juridiqueData && typeof juridiqueData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = juridiqueData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur Technique Electricite') {
              // Le fichier directeur_technique_electricité.json a une structure imbriquée
              // avec "Directeur Technique Electricité" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const techniqueElecData = nestedData['Directeur Technique Electricité'];
              
              if (techniqueElecData && typeof techniqueElecData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = techniqueElecData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur Exploitation Electricite') {
              // Le fichier directeur_exploitation_electricite.json a une structure imbriquée
              // avec "Directeur Exploitation Electricité" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const exploitationElecData = nestedData['Directeur Exploitation Electricité'];
              
              if (exploitationElecData && typeof exploitationElecData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = exploitationElecData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Chef de Departement Support') {
              // Le fichier chef_de_departement_support.json a une structure imbriquée
              // avec "Chef de Département Support" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const supportData = nestedData['Chef de Département Support'];
              
              if (supportData && typeof supportData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = supportData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Chef de Département Eau') {
              // Le fichier chef_departement_eau.json a une structure imbriquée
              // avec "Chef de Département Eau" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const chefEauData = nestedData['Chef de Département Eau'];
              
              if (chefEauData && typeof chefEauData === 'object') {
                // Accéder aux candidats dans la structure imbriquée
                const candidatsData = chefEauData.candidats as Record<string, unknown> | undefined;
                if (candidatsData && typeof candidatsData === 'object') {
                  const rawData = transformData(candidatsData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Aucun candidat trouvé dans la structure imbriquée`);
                }
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else {
              // Structure normale pour les autres départements
              const rawData = transformData(jsonData[index], false);
              transformedData[dept.name] = deduplicateCandidates(rawData);
              // console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
            }
          } else {
            transformedData[dept.name] = [];
            console.warn(`⚠️ Département ${dept.name}: Structure invalide, ignoré`);
          }
        });

        setData(transformedData);
        setIsInitialized(true);

      } catch (err) {
        console.error('Erreur lors du chargement des données IA:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    loadAIData();
  }, [isInitialized]);

  return { data, isLoading, error };
}
