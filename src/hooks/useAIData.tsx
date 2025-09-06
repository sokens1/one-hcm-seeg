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
          // {name: 'Moyens généraux', file: '/moyens_generaux_complet.json'},
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
          throw new Error(`Erreur lors du chargement de ${failedResponses.length} fichier(s) de données IA`);
        }

        // Parser tous les fichiers JSON
        const jsonData = await Promise.all(
          responses.map(response => response.json())
        );

        // Transformer les données pour uniformiser le format
        const transformData = (jsonData: Record<string, unknown>): AICandidateData[] => {
          return Object.entries(jsonData).map(([key, value]: [string, unknown]) => {
            const nameParts = key.split(' ');
            const prenom = nameParts[0] || '';
            const nom = nameParts.slice(1).join(' ') || '';

            // Vérifier que value est un objet
            if (typeof value !== 'object' || value === null) {
              return {
                nom,
                prenom,
                poste: 'Chef de Département',
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

            // Gérer les scores MTP avec différentes clés possibles
            const mtpData = candidateData.mtp as Record<string, unknown> | undefined;
            const mtpScoreData = mtpData?.['score MTP'] as Record<string, unknown> | undefined;
            const mtpScores = mtpScoreData?.scores as Record<string, number> | undefined || {};
            
            const normalizedMtpScores = {
              Métier: mtpScores.Métier || mtpScores.Metier || 0,
              Talent: mtpScores.Talent || 0,
              Paradigme: mtpScores.Paradigme || 0,
              Moyen: mtpScores.Moyen || 0
            };

            // Gérer la conformité
            const conformiteData = candidateData.conformite as Record<string, unknown> | undefined;
            const conformiteScoreData = conformiteData?.['score de conformité'] as Record<string, unknown> | undefined;

            // Gérer la similarité
            const similariteData = candidateData.similarite_offre as Record<string, unknown> | undefined;
            const similariteScoreData = similariteData?.['score de complétude'] as Record<string, unknown> | undefined;

            // Gérer le résumé global
            const resumeGlobalData = candidateData.resume_global as Record<string, unknown> | undefined;

            return {
              nom,
              prenom,
              poste: (mtpScoreData?.poste as string) || 
                     (similariteScoreData?.poste as string) || 
                     'Chef de Département',
              conformite: conformiteScoreData ? {
                score_conformité: conformiteScoreData.score_conformité as number,
                commentaire: conformiteScoreData.commentaire as string
              } : undefined,
              mtp: mtpScoreData ? {
                scores: normalizedMtpScores,
                niveau: mtpScoreData.niveau as string,
                verdict: mtpScoreData.verdict as string,
                points_forts: (mtpScoreData.points_forts as string[]) || [],
                points_a_travailler: (mtpScoreData.points_a_travailler as string[]) || [],
                rang: mtpScoreData.rang as number
              } : undefined,
              similarite_offre: similariteScoreData ? {
                resume_experience: similariteScoreData.resume_experience as string | { nombre_d_annees: number; specialite: string },
                score: typeof similariteScoreData.score === 'number' 
                  ? similariteScoreData.score 
                  : parseFloat(similariteScoreData.score as string) || 0,
                commentaire_score: similariteScoreData.commentaire_score as string,
                forces: (similariteScoreData.forces as string[]) || [],
                faiblesses: (similariteScoreData.faiblesses as string[]) || [],
                verdict: similariteScoreData.verdict as string,
                rang: similariteScoreData.rang as number
              } : undefined,
              resume_global: {
                score_global: (resumeGlobalData?.score_global as number) || 0,
                commentaire_global: (resumeGlobalData?.commentaire_global as string) || '',
                forces: (resumeGlobalData?.forces as string | string[]) || [],
                points_a_ameliorer: (resumeGlobalData?.points_a_ameliorer as string | string[]) || [],
                verdict: (resumeGlobalData?.verdict as string) || 'Non évalué',
                rang_global: (resumeGlobalData?.rang_global as number) || 0
              }
            };
          });
        };

        // Transformer et organiser les données par département
        const transformedData: AIDataResponse = {};
        departments.forEach((dept, index) => {
          transformedData[dept.name] = transformData(jsonData[index]);
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
