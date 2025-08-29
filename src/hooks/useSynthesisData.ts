import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface Protocol1Data {
  status: 'pending' | 'in_progress' | 'completed';
  validation_prerequis: {
    score: number;
    comments: string;
  };
  evaluation_mtp: {
    score: number;
    comments: string;
  };
  entretien: {
    score: number;
    comments: string;
  };
}

interface Protocol2Data {
  status: 'pending' | 'in_progress' | 'completed';
  mise_en_situation: {
    jeu_de_role: {
      score: number;
      comments: string;
    };
    jeu_codir: {
      score: number;
      comments: string;
    };
  };
  validation_operationnelle: {
    fiche_kpis: {
      score: number;
      comments: string;
    };
  };
  analyse_competences: {
    gap_competences: {
      score: number;
      comments: string;
      gapLevel: string;
    };
    plan_formation: {
      score: number;
      comments: string;
    };
  };
}

interface SynthesisData {
  protocol1: {
    score: number;
    status: string;
    validationPrerequis: number;
    evaluationMTP: number;
    entretien: number;
    data: Protocol1Data | null;
  };
  protocol2: {
    score: number;
    status: string;
    miseEnSituation: number;
    validationOperationnelle: number;
    analyseCompetences: number;
    data: Protocol2Data | null;
  };
  globalScore: number;
  finalStatus: string;
  pointsForts: string;
  pointsAmelioration: string;
}

export function useSynthesisData(applicationId: string) {
  const [synthesisData, setSynthesisData] = useState<SynthesisData>({
    protocol1: {
      score: 0,
      status: 'pending',
      validationPrerequis: 0,
      evaluationMTP: 0,
      entretien: 0,
      data: null
    },
    protocol2: {
      score: 0,
      status: 'pending',
      miseEnSituation: 0,
      validationOperationnelle: 0,
      analyseCompetences: 0,
      data: null
    },
    globalScore: 0,
    finalStatus: 'pending',
    pointsForts: '',
    pointsAmelioration: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculer le score global à partir des deux protocoles
  const calculateGlobalScore = useCallback((protocol1Score: number, protocol2Score: number) => {
    // Moyenne pondérée : 40% Protocol 1, 60% Protocol 2
    return Math.round((protocol1Score * 0.4 + protocol2Score * 0.6) * 10) / 10;
  }, []);

  // Calculer le score d'un protocole à partir de ses composants
  const calculateProtocolScore = useCallback((scores: number[]) => {
    const validScores = scores.filter(score => score > 0);
    if (validScores.length === 0) return 0;
    return Math.round((validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 20); // Convertir en pourcentage
  }, []);

  // Calculer la moyenne des étoiles (sur 5)
  const calculateStarAverage = useCallback((scores: number[]) => {
    const validScores = scores.filter(score => score > 0);
    if (validScores.length === 0) return 0;
    return Math.round((validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 10) / 10;
  }, []);

  // Charger les données du Protocol 1
  const loadProtocol1Data = useCallback(async () => {
    if (!applicationId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('protocol1_evaluations')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const protocol1Data: Protocol1Data = {
          status: data.completed ? 'completed' : 'in_progress',
          validation_prerequis: {
            score: data.validation_prerequis_score || 0,
            comments: data.validation_prerequis_notes || ''
          },
          evaluation_mtp: {
            score: data.evaluation_mtp_score || 0,
            comments: data.evaluation_mtp_notes || ''
          },
          entretien: {
            score: data.entretien_score || 0,
            comments: data.entretien_notes || ''
          }
        };

        const scores = [
          protocol1Data.validation_prerequis.score,
          protocol1Data.evaluation_mtp.score,
          protocol1Data.entretien.score
        ];

        return {
          data: protocol1Data,
          score: calculateProtocolScore(scores),
          status: protocol1Data.status,
          validationPrerequis: calculateStarAverage([protocol1Data.validation_prerequis.score]),
          evaluationMTP: calculateStarAverage([protocol1Data.evaluation_mtp.score]),
          entretien: calculateStarAverage([protocol1Data.entretien.score])
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors du chargement des données Protocol 1:', error);
      return null;
    }
  }, [applicationId, user, calculateProtocolScore]);

  // Charger les données du Protocol 2
  const loadProtocol2Data = useCallback(async () => {
    if (!applicationId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('protocol2_evaluations')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const protocol2Data: Protocol2Data = {
          status: data.completed ? 'completed' : 'in_progress',
          mise_en_situation: {
            jeu_de_role: {
              score: data.qcm_role_score || 0,
              comments: data.interview_notes || ''
            },
            jeu_codir: {
              score: data.qcm_codir_score || 0,
              comments: data.visit_notes || ''
            }
          },
          validation_operationnelle: {
            fiche_kpis: {
              score: data.overall_score || 0,
              comments: data.skills_gap_notes || ''
            }
          },
          analyse_competences: {
            gap_competences: {
              score: data.overall_score || 0,
              comments: (() => {
                const notes = data.skills_gap_notes || '';
                return notes.replace(/Niveau: (faible|moyen|important|critique) - /, '');
              })(),
              gapLevel: (() => {
                const notes = data.skills_gap_notes || '';
                const match = notes.match(/Niveau: (faible|moyen|important|critique)/);
                return match ? match[1] : '';
              })()
            },
            plan_formation: {
              score: data.overall_score || 0,
              comments: data.skills_gap_notes || ''
            }
          }
        };

        const scores = [
          protocol2Data.mise_en_situation.jeu_de_role.score,
          protocol2Data.mise_en_situation.jeu_codir.score,
          protocol2Data.validation_operationnelle.fiche_kpis.score,
          protocol2Data.analyse_competences.gap_competences.score,
          protocol2Data.analyse_competences.plan_formation.score
        ];

        return {
          data: protocol2Data,
          score: calculateProtocolScore(scores),
          status: protocol2Data.status,
          miseEnSituation: calculateStarAverage([
            protocol2Data.mise_en_situation.jeu_de_role.score,
            protocol2Data.mise_en_situation.jeu_codir.score
          ]),
          validationOperationnelle: calculateStarAverage([protocol2Data.validation_operationnelle.fiche_kpis.score]),
          analyseCompetences: calculateStarAverage([protocol2Data.analyse_competences.gap_competences.score])
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors du chargement des données Protocol 2:', error);
      return null;
    }
  }, [applicationId, user, calculateProtocolScore]);

  // Charger toutes les données de synthèse
  const loadSynthesisData = useCallback(async () => {
    if (!applicationId || !user) return;

    setIsLoading(true);
    try {
      const [protocol1Result, protocol2Result] = await Promise.all([
        loadProtocol1Data(),
        loadProtocol2Data()
      ]);

      const protocol1Score = protocol1Result?.score || 0;
      const protocol2Score = protocol2Result?.score || 0;
      const globalScore = calculateGlobalScore(protocol1Score, protocol2Score);

      setSynthesisData({
        protocol1: {
          score: protocol1Score,
          status: protocol1Result?.status || 'pending',
          validationPrerequis: protocol1Result?.validationPrerequis || 0,
          evaluationMTP: protocol1Result?.evaluationMTP || 0,
          entretien: protocol1Result?.entretien || 0,
          data: protocol1Result?.data || null
        },
        protocol2: {
          score: protocol2Score,
          status: protocol2Result?.status || 'pending',
          miseEnSituation: protocol2Result?.miseEnSituation || 0,
          validationOperationnelle: protocol2Result?.validationOperationnelle || 0,
          analyseCompetences: protocol2Result?.analyseCompetences || 0,
          data: protocol2Result?.data || null
        },
        globalScore,
        finalStatus: globalScore >= 70 ? 'embauche' : globalScore >= 50 ? 'incubation' : 'refuse',
        pointsForts: '',
        pointsAmelioration: ''
      });

      console.log('Données de synthèse chargées:', {
        protocol1: {
          score: protocol1Score,
          status: protocol1Result?.status,
          data: protocol1Result?.data
        },
        protocol2: {
          score: protocol2Score,
          status: protocol2Result?.status,
          data: protocol2Result?.data
        },
        globalScore,
        finalStatus: globalScore >= 70 ? 'embauche' : globalScore >= 50 ? 'incubation' : 'refuse'
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données de synthèse:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données de synthèse.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, user, loadProtocol1Data, loadProtocol2Data, calculateGlobalScore, toast]);

  // Mettre à jour les points forts et d'amélioration
  const updateRecommendations = useCallback((pointsForts: string, pointsAmelioration: string) => {
    setSynthesisData(prev => ({
      ...prev,
      pointsForts,
      pointsAmelioration
    }));
  }, []);

  useEffect(() => {
    if (applicationId && user) {
      loadSynthesisData();
    }
  }, [applicationId, user]);

  return {
    synthesisData,
    isLoading,
    updateRecommendations,
    refreshData: loadSynthesisData
  };
}
