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
          // {name: 'Directeur Technique Eau', file: '/directeur_technique_eau.json'},
          // {name: 'Directeur Exploitation Eau', file: '/directeur_exploitation_eau.json'},
          // {name: 'Moyens généraux', file: '/moyens_generaux_complet.json'},
          // {name: 'Directeur Technique Eau', file: '/directeur_technique_eau.json'},
          // {name: 'Directeur Exploitation Eau', file: '/directeur_exploitation_eau.json'},
          // {name: 'Chef de Département Electricite', file: '/chef_departement_electricite.json'},
          // {name: 'Coordonnateur des Régions', file: '/coordonnateur_des_regions.json'},
          // {name: 'Directeur Audit & Contrôle interne', file: '/directeur_audit_et_controle_interne.json'},
          // {name: 'Directeur Qualité, Hygiène, Sécurité & Environnement', file: '/directeur_qualite_hygiene_securite_environnement.json'},
          // {name: 'Directeur des Systèmes d\'Information', file: '/directeur_des_systemes_d_information.json'},
          // {name: 'Directeur Commercial et Recouvrement', file: '/directeur_commercial_et_recouvrement.json'},
          // {name: 'Directeur du Capital Humain', file: '/directeur_du_capital_humain.json'},
          // {name: 'Directeur Finances et Comptabilités', file: '/directeur_finances_et_comptabilite.json'},
          //s{name: 'Directeur Juridique, Communication & RSE', file: '/directeur_juridique_communication_rse.json'},
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
              // Gestion spéciale pour les moyens généraux qui ont une structure imbriquée
              if (dept.name === 'Moyens généraux') {
                const nestedData = validJsonData[validIndex] as Record<string, Record<string, unknown>>;
                const directorData = nestedData['Directeur Moyens Généraux'];
                
                if (directorData && typeof directorData === 'object') {
                  transformedData[dept.name] = transformData(directorData, true);
                } else {
                  transformedData[dept.name] = [];
                  console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
                }
              } else {
                transformedData[dept.name] = transformData(validJsonData[validIndex], false);
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
            const mtpScores = mtpScoreData?.scores as Record<string, number> | undefined || {};
            
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
              : undefined; // Les feedbacks ne sont pas dans le fichier chef_departement_eau

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
                commentaire_score: (similariteScoreData.commentaire_score as string) || (similariteScoreData.raison_verdict as string) || 'Aucun commentaire',
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
            // Gestion spéciale pour les moyens généraux qui ont une structure imbriquée
            if (dept.name === 'Moyens généraux') {
              // Le fichier moyens_generaux_complet.json a une structure imbriquée
              // avec "Directeur Moyens Généraux" comme clé parent
              const nestedData = jsonData[index] as Record<string, Record<string, unknown>>;
              const directorData = nestedData['Directeur Moyens Généraux'];
              
              if (directorData && typeof directorData === 'object') {
                transformedData[dept.name] = transformData(directorData, true);
                console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s)`);
              } else {
                transformedData[dept.name] = [];
                console.warn(`⚠️ Département ${dept.name}: Structure imbriquée invalide, ignoré`);
              }
            } else {
              // Structure normale pour les autres départements
              transformedData[dept.name] = transformData(jsonData[index], false);
              console.log(`✅ Département ${dept.name}: ${transformedData[dept.name].length} candidat(s) chargé(s)`);
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
