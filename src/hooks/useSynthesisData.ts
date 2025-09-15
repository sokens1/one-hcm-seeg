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
  conclusion: string;
}

const defaultSynthesisData: SynthesisData = {
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
  pointsAmelioration: '',
  conclusion: ''
};

export function useSynthesisData(applicationId: string) {
  const [synthesisData, setSynthesisData] = useState<SynthesisData>(defaultSynthesisData);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculer le score global à partir des deux protocoles SANS arrondi
  const calculateGlobalScore = useCallback((protocol1Score: number, protocol2Score: number) => {
    // Moyenne pondérée : 40% Protocol 1, 60% Protocol 2
    // S'assurer que les scores ne dépassent jamais 100%
    const safeProtocol1Score = Math.min(protocol1Score, 100);
    const safeProtocol2Score = Math.min(protocol2Score, 100);
    return Math.min(safeProtocol1Score * 0.4 + safeProtocol2Score * 0.6, 100);
  }, []);

  // Calculer la moyenne des étoiles (les scores sont déjà sur 5)
  const calculateStarAverage = useCallback((scores: number[]) => {
    const validScores = scores.filter(score => score > 0);
    if (validScores.length === 0) return 0;
    // Les scores sont déjà sur 5, on retourne la moyenne arrondie à l'entier
    return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
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

        // console.log('🔍 [PROTOCOL 1 DEBUG] Données brutes:', {
        //   overall_score: data.overall_score,
        //   documentary_score: data.documentary_score,
        //   mtp_score: data.mtp_score,
        //   interview_score: data.interview_score,
        //   total_score: data.total_score
        // });

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
          status: data.status || (data.completed ? 'completed' : 'in_progress'),
          mise_en_situation: {
            jeu_de_role: {
              score: data.jeu_de_role_score || 0,
              comments: data.jeu_de_role_comments || ''
            },
            jeu_codir: {
              score: data.jeu_codir_score || 0,
              comments: data.jeu_codir_comments || ''
            }
          },
          validation_operationnelle: {
            fiche_kpis: {
              score: data.fiche_kpis_score || 0,
              comments: data.fiche_kpis_comments || ''
            },
            fiche_kris: {
              score: data.fiche_kris_score || 0,
              comments: data.fiche_kris_comments || ''
            },
            fiche_kcis: {
              score: data.fiche_kcis_score || 0,
              comments: data.fiche_kcis_comments || ''
            }
          },
          analyse_competences: {
            gap_competences: {
              score: data.gap_competences_score || 0,
              comments: data.gap_competences_comments || '',
              gapLevel: data.gap_competences_level || ''
            },
            plan_formation: {
              score: data.plan_formation_score || 0,
              comments: data.plan_formation_comments || ''
            }
          }
        };

        console.log('🔍 [PROTOCOL 2 DEBUG] Données brutes:', {
          overall_score: data.overall_score,
          jeu_de_role_score: data.jeu_de_role_score,
          jeu_codir_score: data.jeu_codir_score,
          fiche_kpis_score: data.fiche_kpis_score,
          gap_competences_score: data.gap_competences_score,
          plan_formation_score: data.plan_formation_score,
          status: data.status,
          completed: data.completed
        });

        console.log('🔍 [PROTOCOL 2 SYNTHESIS] Score direct de la DB:', {
          overall_score: data.overall_score,
          total_score: data.total_score,
          mise_en_situation_score: data.mise_en_situation_score,
          validation_operationnelle_score: data.validation_operationnelle_score,
          analyse_competences_score: data.analyse_competences_score
        });

        // Calculer le score exact comme dans le dashboard (même formule que calculateSectionScores)
        const jeuDeRoleScore = Math.min(data.jeu_de_role_score || 0, 5);
        const jeuCodirScore = Math.min(data.jeu_codir_score || 0, 5);
        const ficheKpisScore = Math.min(data.fiche_kpis_score || 0, 5);
        const ficheKrisScore = Math.min(data.fiche_kris_score || 0, 5);
        const ficheKcisScore = Math.min(data.fiche_kcis_score || 0, 5);
        const gapCompetencesScore = Math.min(data.gap_competences_score || 0, 5);
        const planFormationScore = Math.min(data.plan_formation_score || 0, 5);

        // Moyennes par section (sur 5)
        const situationAvgOn5 = (jeuDeRoleScore + jeuCodirScore) / 2;
        const performanceAvgOn5 = (ficheKpisScore + ficheKrisScore + ficheKcisScore) / 3;
        const competenceAvgOn5 = (gapCompetencesScore + planFormationScore) / 2;

        // Conversion en pourcentage
        const situationPct = (situationAvgOn5 / 5) * 100;
        const performancePct = (performanceAvgOn5 / 5) * 100;
        const competencePct = (competenceAvgOn5 / 5) * 100;

        // Pondération: 50% / 20% / 30% (même que dans le dashboard)
        const exactGlobalScore = situationPct * 0.5 + performancePct * 0.2 + competencePct * 0.3;

        console.log('🔍 [PROTOCOL 2 SYNTHESIS] Score final calculé:', {
          score: data.overall_score || data.total_score || 0,
          status: protocol2Data.status
        });

        console.log('🔍 [PROTOCOL 2 SYNTHESIS] Score exact calculé:', {
          exactGlobalScore: exactGlobalScore,
          situationPct: situationPct,
          performancePct: performancePct,
          competencePct: competencePct
        });

        return {
          data: protocol2Data,
          // Utiliser le score calculé exactement comme dans le dashboard
          score: exactGlobalScore,
          status: protocol2Data.status,
          // Utiliser les scores individuels (0-5) pour les étoiles
          miseEnSituation: calculateStarAverage([
            data.jeu_de_role_score || 0,
            data.jeu_codir_score || 0
          ]),
          // Utiliser les scores calculés des sections (déjà en pourcentage, pas besoin de diviser)
          validationOperationnelle: data.validation_operationnelle_score ? data.validation_operationnelle_score / 20 : 0,
          analyseCompetences: data.analyse_competences_score ? data.analyse_competences_score / 20 : 0
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors du chargement des données Protocol 2:', error);
      return null;
    }
  }, [applicationId, user, calculateStarAverage]);

  // Charger les données de synthèse depuis la base de données
  const loadSynthesisFields = useCallback(async () => {
    if (!applicationId) return { pointsForts: '', pointsAmelioration: '', conclusion: '' };

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('synthesis_points_forts, synthesis_points_amelioration, synthesis_conclusion')
        .eq('id', applicationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors du chargement des champs de synthèse:', error);
        return { pointsForts: '', pointsAmelioration: '', conclusion: '' };
      }

      return {
        pointsForts: data?.synthesis_points_forts || '',
        pointsAmelioration: data?.synthesis_points_amelioration || '',
        conclusion: data?.synthesis_conclusion || ''
      };
    } catch (error) {
      console.error('Erreur lors du chargement des champs de synthèse:', error);
      return { pointsForts: '', pointsAmelioration: '', conclusion: '' };
    }
  }, [applicationId]);

  // Charger toutes les données de synthèse
  const loadSynthesisData = useCallback(async () => {
    if (!applicationId || !user) return;

    setIsLoading(true);
    try {
      const [protocol1Result, protocol2Result, synthesisFields] = await Promise.all([
        loadProtocol1Data(),
        loadProtocol2Data(),
        loadSynthesisFields()
      ]);

      const protocol1Score = Math.min(protocol1Result?.score || 0, 100);
      const protocol2Score = Math.min(protocol2Result?.score || 0, 100);
      const globalScore = calculateGlobalScore(protocol1Score, protocol2Score);

      // console.log('🔍 [SYNTHESIS DEBUG] Scores finaux:', {
      //   protocol1Score,
      //   protocol2Score,
      //   globalScore,
      //   protocol1Result: protocol1Result ? 'trouvé' : 'non trouvé',
      //   protocol2Result: protocol2Result ? 'trouvé' : 'non trouvé'
      // });

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
        pointsForts: synthesisFields.pointsForts,
        pointsAmelioration: synthesisFields.pointsAmelioration,
        conclusion: synthesisFields.conclusion
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
        description: "Impossible de charger les données de synthèse",
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
  }, [applicationId, user, loadSynthesisData]);

  // Sauvegarder les champs de synthèse
  const saveSynthesisFields = useCallback(async (fields: { pointsForts?: string; pointsAmelioration?: string; conclusion?: string }) => {
    if (!applicationId) return false;

    try {
      const updateData: any = {};
      if (fields.pointsForts !== undefined) updateData.synthesis_points_forts = fields.pointsForts;
      if (fields.pointsAmelioration !== undefined) updateData.synthesis_points_amelioration = fields.pointsAmelioration;
      if (fields.conclusion !== undefined) updateData.synthesis_conclusion = fields.conclusion;

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) {
        console.error('Erreur lors de la sauvegarde des champs de synthèse:', error);
        return false;
      }

      console.log('✅ Champs de synthèse sauvegardés:', updateData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des champs de synthèse:', error);
      return false;
    }
  }, [applicationId]);

  return {
    synthesisData,
    isLoading,
    updateRecommendations,
    saveSynthesisFields
  };
}