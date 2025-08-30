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



  // Calculer la moyenne des étoiles (les scores sont déjà sur 5)
  const calculateStarAverage = useCallback((scores: number[]) => {
    const validScores = scores.filter(score => score > 0);
    if (validScores.length === 0) return 0;
    // Les scores sont déjà sur 5, on retourne la moyenne directement
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
            score: data.documentary_score || 0,
            comments: data.cv_comments || ''
          },
          evaluation_mtp: {
            score: data.metier_score || 0,
            comments: data.metier_comments || ''
          },
          entretien: {
            score: data.interview_score || 0,
            comments: data.interview_metier_comments || ''
          }
        };

        return {
          data: protocol1Data,
          // Utiliser directement le score déjà calculé dans Protocol 1
          score: data.overall_score || 0,
          status: protocol1Data.status,
          // Utiliser les scores individuels (0-5) pour les étoiles
          validationPrerequis: calculateStarAverage([data.cv_score || 0, data.lettre_motivation_score || 0, data.diplomes_certificats_score || 0]),
          evaluationMTP: calculateStarAverage([data.metier_score || 0, data.talent_score || 0, data.paradigme_score || 0]),
          entretien: calculateStarAverage([data.interview_metier_score || 0, data.interview_talent_score || 0, data.interview_paradigme_score || 0])
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors du chargement des données Protocol 1:', error);
      return null;
    }
  }, [applicationId, user, calculateStarAverage]);

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

        return {
          data: protocol2Data,
          // Utiliser directement le score déjà calculé en pourcentage dans Protocol 2
          score: data.overall_score || 0,
          status: protocol2Data.status,
          // Utiliser les scores individuels (0-5) pour les étoiles
          miseEnSituation: calculateStarAverage([
            data.qcm_role_score || 0,
            data.qcm_codir_score || 0
          ]),
          validationOperationnelle: data.overall_score || 0,
          analyseCompetences: data.overall_score || 0
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors du chargement des données Protocol 2:', error);
      return null;
    }
  }, [applicationId, user, calculateStarAverage]);

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
          score: protocol1Score + '%',
          status: protocol1Result?.status,
          validationPrerequis: protocol1Result?.validationPrerequis + '/5',
          evaluationMTP: protocol1Result?.evaluationMTP + '/5',
          entretien: protocol1Result?.entretien + '/5',
          source: 'Score déjà calculé dans Protocol 1 (overall_score)'
        },
        protocol2: {
          score: protocol2Score + '%',
          status: protocol2Result?.status,
          miseEnSituation: protocol2Result?.miseEnSituation + '/5',
          validationOperationnelle: protocol2Result?.validationOperationnelle + '/5',
          analyseCompetences: protocol2Result?.analyseCompetences + '/5',
          source: 'Score déjà calculé en pourcentage dans Protocol 2 (overall_score)'
        },
        globalScore: globalScore + '%',
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
