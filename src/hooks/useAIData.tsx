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

  useEffect(() => {
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
                  const rawData = transformData(directorData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
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
                  const rawData = transformData(coordData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
               } else if (dept.name === 'Directeur des Systèmes d\'Information') {
                 const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                 console.log('🔍 Debug DSI (failed) - Clés disponibles:', Object.keys(nestedData));
                 
                 // Utiliser la première clé disponible (plus robuste)
                 const availableKeys = Object.keys(nestedData);
                 const dsiData = availableKeys.length > 0 ? nestedData[availableKeys[0]] : null;
                 console.log(`🔍 Debug DSI (failed) - Clé utilisée: "${availableKeys[0]}"`);
                 
                 console.log('🔍 Debug DSI (failed) - Données trouvées:', dsiData ? 'OUI' : 'NON');
                 
                 if (dsiData && typeof dsiData === 'object') {
                   const rawData = transformData(dsiData, true);
                   transformedData[dept.name] = deduplicateCandidates(rawData);
                   console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else if (dept.name === 'Chef de Département Eau') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const chefEauData = nestedData['Chef de Département Eau'];
                
                if (chefEauData && typeof chefEauData === 'object') {
                  const rawData = transformData(chefEauData, true);
                  transformedData[dept.name] = deduplicateCandidates(rawData);
                  console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
          
          candidates.forEach(candidate => {
            // Créer une clé basée sur le prénom et les premiers mots du nom
            const prenom = candidate.prenom.toLowerCase().trim();
            const nomWords = candidate.nom.toLowerCase().trim().split(' ').filter(w => w.length > 0);
            
            // Utiliser le prénom + le premier mot du nom comme clé de déduplication
            const key = `${prenom} ${nomWords[0] || ''}`.trim();
            
            // Si on a déjà vu cette clé, garder celui avec le nom le plus complet
            if (seen.has(key)) {
              const existing = seen.get(key)!;
              const existingFullName = `${existing.prenom} ${existing.nom}`;
              const currentFullName = `${candidate.prenom} ${candidate.nom}`;
              
              // Garder celui avec le nom le plus long (plus complet)
              if (currentFullName.length > existingFullName.length) {
                seen.set(key, candidate);
              }
            } else {
              seen.set(key, candidate);
            }
          });
          
          return Array.from(seen.values());
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
              Métier: mtpScores.Métier || mtpScores.Metier || mtpScores.metier || 0,
              Talent: mtpScores.Talent || mtpScores.talent || 0,
              Paradigme: mtpScores.Paradigme || mtpScores.paradigme || 0,
              Moyen: mtpScores.Moyen || mtpScores.moyen || 0
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
            let similarityScore = 0;
            if (similariteScoreData?.score !== undefined) {
              if (typeof similariteScoreData.score === 'number') {
                // Pour les moyens généraux, le score est déjà en pourcentage
                // Pour les autres fichiers, il peut être en décimal
                similarityScore = isMoyensGeneraux ? similariteScoreData.score : similariteScoreData.score;
              } else {
                const parsedScore = parseFloat(similariteScoreData.score as string);
                similarityScore = isNaN(parsedScore) ? 0 : parsedScore;
              }
            }

            return {
              nom,
              prenom,
              poste,
              conformite: conformiteScoreData ? {
                score_conformité: (conformiteScoreData.score_conformité as number) || 0,
                commentaire: (conformiteScoreData.commentaire as string) || 'Aucun commentaire'
              } : undefined,
              mtp: mtpScoreData ? {
                scores: normalizedMtpScores,
                score_moyen: (mtpScoreData.Score_moyen as number) || undefined,
                niveau: (mtpScoreData.niveau as string) || 'Non évalué',
                verdict: (mtpScoreData.verdict as string) || 'Non évalué',
                points_forts: Array.isArray(mtpScoreData.points_forts) ? mtpScoreData.points_forts as string[] : [],
                points_a_travailler: Array.isArray(mtpScoreData.points_a_travailler) ? mtpScoreData.points_a_travailler as string[] : [],
                rang: (mtpScoreData.rang as number) || 0
              } : undefined,
              similarite_offre: similariteScoreData ? {
                resume_experience: similariteScoreData.resume_experience as string | { nombre_d_annees: number; specialite: string },
                score: similarityScore,
                commentaire_score: (similariteScoreData.commentaire_score as string) || (similariteScoreData.raison_verdict as string) || (similariteScoreData.raison as string) || 'Aucun commentaire',
                forces: Array.isArray(similariteScoreData.points_forts) ? similariteScoreData.points_forts as string[] : 
                       Array.isArray(similariteScoreData.forces) ? similariteScoreData.forces as string[] : [],
                faiblesses: Array.isArray(similariteScoreData.points_a_travailler) ? similariteScoreData.points_a_travailler as string[] : 
                           Array.isArray(similariteScoreData.faiblesses) ? similariteScoreData.faiblesses as string[] : [],
                verdict: (similariteScoreData.verdict as string) || 'Non évalué',
                rang: (similariteScoreData.rang as number) || 0
              } : undefined,
              feedback: feedbackData ? {
                score: (feedbackData.score as number) || 0,
                verdict: (feedbackData.verdict as string) || 'Non évalué',
                raisons: (feedbackData.raisons as string) || 'Aucun commentaire',
                points_forts: Array.isArray(feedbackData['Points forces']) ? feedbackData['Points forces'] as string[] : [],
                points_a_travailler: Array.isArray(feedbackData['Points à travailler']) ? feedbackData['Points à travailler'] as string[] : [],
                rang: (feedbackData.rang as number) || 0
              } : undefined,
              resume_global: {
                score_global: (resumeGlobalData?.score_global as number) || 0,
                commentaire_global: (resumeGlobalData?.commentaire_global as string) || (resumeGlobalData?.resume as string) || 'Aucun commentaire',
                forces: Array.isArray(resumeGlobalData?.points_forts) ? resumeGlobalData.points_forts as string[] : 
                       Array.isArray(resumeGlobalData?.forces) ? resumeGlobalData.forces as string[] :
                       typeof resumeGlobalData?.forces === 'string' ? [resumeGlobalData.forces] : [],
                points_a_ameliorer: Array.isArray(resumeGlobalData?.points_a_ameliorer) ? resumeGlobalData.points_a_ameliorer as string[] : 
                                   Array.isArray(resumeGlobalData?.points_a_travailler) ? resumeGlobalData.points_a_travailler as string[] :
                                   typeof resumeGlobalData?.points_a_ameliorer === 'string' ? [resumeGlobalData.points_a_ameliorer] : [],
                verdict: (resumeGlobalData?.verdict as string) || 'Non évalué',
                rang_global: (resumeGlobalData?.rang_global as number) || (resumeGlobalData?.rang as number) || 0
              }
            };
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
                const rawData = transformData(directorData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(directorData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(directorData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(directorData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(coordData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(auditData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else if (dept.name === 'Directeur des Systèmes d\'Information') {
              // Le fichier directeur_des_systemes_d_information.json a une structure imbriquée
              // avec "Directeur des Systèmes d'Information" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              console.log('🔍 Debug DSI - Clés disponibles:', Object.keys(nestedData));
              
              // Utiliser la première clé disponible (plus robuste)
              const availableKeys = Object.keys(nestedData);
              const dsiData = availableKeys.length > 0 ? nestedData[availableKeys[0]] : null;
              console.log(`🔍 Debug DSI - Clé utilisée: "${availableKeys[0]}"`);
              
              console.log('🔍 Debug DSI - Données trouvées:', dsiData ? 'OUI' : 'NON');
              
              if (dsiData && typeof dsiData === 'object') {
                const rawData = transformData(dsiData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(qhseData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(commercialData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(capitalHumainData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(financesData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(juridiqueData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(techniqueElecData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(exploitationElecData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(supportData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
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
                const rawData = transformData(chefEauData, true);
                transformedData[dept.name] = deduplicateCandidates(rawData);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else {
              // Structure normale pour les autres départements
              const rawData = transformData(jsonData[index], false);
              transformedData[dept.name] = deduplicateCandidates(rawData);
              console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s) (après déduplication)`);
            }
          } else {
            transformedData[dept.name] = [];
            console.warn(`⚠️ Département ${dept.name}: Structure invalide, ignoré`);
          }
        });

        setData(transformedData);

      } catch (err) {
        console.error('Erreur lors du chargement des données IA:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    loadAIData();
  }, []);

  return { data, isLoading, error };
}
