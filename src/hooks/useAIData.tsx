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
  eau: AICandidateData[];
  sable: AICandidateData[];
}

export function useAIData() {
  const [data, setData] = useState<AIDataResponse>({ eau: [], sable: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAIData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Charger les données des deux fichiers JSON
        const [eauResponse, sableResponse] = await Promise.all([
          fetch('/eau_complet.json'),
          fetch('/sable_complet.json')
        ]);

        if (!eauResponse.ok || !sableResponse.ok) {
          throw new Error('Erreur lors du chargement des données IA');
        }

        const eauData = await eauResponse.json();
        const sableData = await sableResponse.json();

        // Transformer les données pour uniformiser le format
        const transformData = (jsonData: any): AICandidateData[] => {
          return Object.entries(jsonData).map(([key, value]: [string, any]) => {
            const nameParts = key.split(' ');
            const prenom = nameParts[0] || '';
            const nom = nameParts.slice(1).join(' ') || '';

            // Gérer les scores MTP avec différentes clés possibles
            const mtpScores = value.mtp?.['score MTP']?.scores || {};
            const normalizedMtpScores = {
              Métier: mtpScores.Métier || mtpScores.Metier || 0,
              Talent: mtpScores.Talent || 0,
              Paradigme: mtpScores.Paradigme || 0,
              Moyen: mtpScores.Moyen || 0
            };

            return {
              nom,
              prenom,
              poste: value.mtp?.['score MTP']?.poste || 
                     value.similarite_offre?.['score de complétude']?.poste || 
                     'Chef de Département',
              conformite: value.conformite?.['score de conformité'] ? {
                score_conformité: value.conformite['score de conformité'].score_conformité,
                commentaire: value.conformite['score de conformité'].commentaire
              } : undefined,
              mtp: value.mtp?.['score MTP'] ? {
                scores: normalizedMtpScores,
                niveau: value.mtp['score MTP'].niveau,
                verdict: value.mtp['score MTP'].verdict,
                points_forts: value.mtp['score MTP'].points_forts || [],
                points_a_travailler: value.mtp['score MTP'].points_a_travailler || [],
                rang: value.mtp['score MTP'].rang
              } : undefined,
              similarite_offre: value.similarite_offre?.['score de complétude'] ? {
                resume_experience: value.similarite_offre['score de complétude'].resume_experience,
                score: typeof value.similarite_offre['score de complétude'].score === 'number' 
                  ? value.similarite_offre['score de complétude'].score 
                  : parseFloat(value.similarite_offre['score de complétude'].score) || 0,
                commentaire_score: value.similarite_offre['score de complétude'].commentaire_score,
                forces: value.similarite_offre['score de complétude'].forces || [],
                faiblesses: value.similarite_offre['score de complétude'].faiblesses || [],
                verdict: value.similarite_offre['score de complétude'].verdict,
                rang: value.similarite_offre['score de complétude'].rang
              } : undefined,
              resume_global: {
                score_global: value.resume_global?.score_global || 0,
                commentaire_global: value.resume_global?.commentaire_global || '',
                forces: value.resume_global?.forces || [],
                points_a_ameliorer: value.resume_global?.points_a_ameliorer || [],
                verdict: value.resume_global?.verdict || 'Non évalué',
                rang_global: value.resume_global?.rang_global || 0
              }
            };
          });
        };

        const transformedEauData = transformData(eauData);
        const transformedSableData = transformData(sableData);

        setData({
          eau: transformedEauData,
          sable: transformedSableData
        });

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
