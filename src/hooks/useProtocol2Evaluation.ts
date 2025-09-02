import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Protocol2EvaluationData {
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

const defaultEvaluationData: Protocol2EvaluationData = {
  status: 'pending',
  mise_en_situation: {
    jeu_de_role: {
      score: 0,
      comments: ''
    },
    jeu_codir: {
      score: 0,
      comments: ''
    }
  },
  validation_operationnelle: {
    fiche_kpis: {
      score: 0,
      comments: ''
    }
  },
  analyse_competences: {
    gap_competences: {
      score: 0,
      comments: '',
      gapLevel: ''
    },
    plan_formation: {
      score: 0,
      comments: ''
    }
  }
};

export function useProtocol2Evaluation(applicationId: string) {
  const [evaluationData, setEvaluationData] = useState<Protocol2EvaluationData>(defaultEvaluationData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger l'évaluation existante
  const loadEvaluation = useCallback(async () => {
    if (!applicationId || !user) return;

    setIsLoading(true);
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
        console.log('Évaluation Protocol 2 chargée avec succès:', data);
        
        setEvaluationData({
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
                // Extraire les commentaires sans le niveau
                const notes = data.skills_gap_notes || '';
                return notes.replace(/Niveau: (faible|moyen|important|critique) - /, '');
              })(),
              gapLevel: (() => {
                // Extraire le niveau de gap des commentaires si présent
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
        });
      } else {
        setEvaluationData(defaultEvaluationData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'évaluation Protocol 2:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger l'évaluation Protocol 2",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, user, toast]);

  // Sauvegarder l'évaluation
  const saveEvaluation = useCallback(async (data: Protocol2EvaluationData) => {
    if (!applicationId || !user) return;

    setIsSaving(true);
    try {
      // Convertir les données du composant vers le format de la base
      const evaluationRecord = {
        application_id: applicationId,
        evaluator_id: user.id,
        
        // Jeu de mise en situation CODIR
        physical_visit: data.mise_en_situation.jeu_codir.score > 0,
        qcm_codir_completed: data.mise_en_situation.jeu_codir.score > 0,
        qcm_codir_score: Math.min(data.mise_en_situation.jeu_codir.score, 5),
        visit_notes: data.mise_en_situation.jeu_codir.comments,
        
        // Jeu de rôle (interview)
        interview_completed: data.mise_en_situation.jeu_de_role.score > 0,
        qcm_role_completed: data.mise_en_situation.jeu_de_role.score > 0,
        qcm_role_score: Math.min(data.mise_en_situation.jeu_de_role.score, 5),
        interview_notes: data.mise_en_situation.jeu_de_role.comments,
        
        // Edition de Fiche KPI'S
        job_sheet_created: data.validation_operationnelle.fiche_kpis.score > 0,
        
        // Analyse du Gap de compétences
        skills_gap_assessed: data.analyse_competences.gap_competences.score > 0,
        skills_gap_notes: data.analyse_competences.gap_competences.gapLevel 
          ? `Niveau: ${data.analyse_competences.gap_competences.gapLevel} - ${data.analyse_competences.gap_competences.comments}`
          : data.analyse_competences.gap_competences.comments,
        
        // Score global calculé (converti en pourcentage, limité à 100%)
        overall_score: Math.min(
          Math.round(
            ((Math.min(data.mise_en_situation.jeu_de_role.score, 5) +
             Math.min(data.mise_en_situation.jeu_codir.score, 5) +
             Math.min(data.validation_operationnelle.fiche_kpis.score, 5) +
             Math.min(data.analyse_competences.gap_competences.score, 5) +
             Math.min(data.analyse_competences.plan_formation.score, 5)) / 5) * 20
          ),
          100
        ),
        
        // Statut
        completed: data.status === 'completed',
        updated_at: new Date().toISOString()
      };

      // Vérifier si une évaluation existe déjà
      const { data: existingData, error: checkError } = await supabase
        .from('protocol2_evaluations')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existingData) {
        // Mettre à jour l'évaluation existante
        result = await supabase
          .from('protocol2_evaluations')
          .update(evaluationRecord)
          .eq('application_id', applicationId);
      } else {
        // Créer une nouvelle évaluation
        result = await supabase
          .from('protocol2_evaluations')
          .insert(evaluationRecord);
      }

      if (result.error) {
        throw result.error;
      }

      console.log('Évaluation Protocol 2 sauvegardée avec succès:', evaluationRecord);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder l'évaluation Protocol 2",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [applicationId, user, toast]);

  // Mettre à jour l'évaluation
  const updateEvaluation = useCallback((updater: (prev: Protocol2EvaluationData) => Protocol2EvaluationData) => {
    setEvaluationData(prev => {
      const newData = updater(prev);
      
      // S'assurer que tous les scores sont limités à 5
      newData.mise_en_situation.jeu_de_role.score = Math.min(newData.mise_en_situation.jeu_de_role.score, 5);
      newData.mise_en_situation.jeu_codir.score = Math.min(newData.mise_en_situation.jeu_codir.score, 5);
      newData.validation_operationnelle.fiche_kpis.score = Math.min(newData.validation_operationnelle.fiche_kpis.score, 5);
      newData.analyse_competences.gap_competences.score = Math.min(newData.analyse_competences.gap_competences.score, 5);
      newData.analyse_competences.plan_formation.score = Math.min(newData.analyse_competences.plan_formation.score, 5);
      
      // Mettre à jour le statut
      const totalScore = (
        newData.mise_en_situation.jeu_de_role.score +
        newData.mise_en_situation.jeu_codir.score +
        newData.validation_operationnelle.fiche_kpis.score +
        newData.analyse_competences.gap_competences.score +
        newData.analyse_competences.plan_formation.score
      ) / 5;
      
      if (totalScore > 0) {
        newData.status = 'in_progress';
      }
      if (totalScore >= 3) { // Seuil de 3/5 pour considérer comme terminé
        newData.status = 'completed';
      }
      
      // Sauvegarder automatiquement après un délai
      setTimeout(() => {
        saveEvaluation(newData);
      }, 1000);
      
      return newData;
    });
  }, [saveEvaluation]);

  // Calculer les scores des sections
  const calculateSectionScores = useCallback(() => {
    // S'assurer que les scores ne dépassent jamais 5
    const jeuDeRoleScore = Math.min(evaluationData.mise_en_situation.jeu_de_role.score, 5);
    const jeuCodirScore = Math.min(evaluationData.mise_en_situation.jeu_codir.score, 5);
    const ficheKpisScore = Math.min(evaluationData.validation_operationnelle.fiche_kpis.score, 5);
    const gapCompetencesScore = Math.min(evaluationData.analyse_competences.gap_competences.score, 5);
    const planFormationScore = Math.min(evaluationData.analyse_competences.plan_formation.score, 5);

    // Utiliser le même calcul que pour overall_score en base de données
    const globalScore = Math.min(
      Math.round(
        ((jeuDeRoleScore + jeuCodirScore + ficheKpisScore + gapCompetencesScore + planFormationScore) / 5) * 20
      ),
      100
    );

    // Calculer les scores des sections pour l'affichage détaillé
    const miseEnSituationScore = Math.min(
      Math.round(((jeuDeRoleScore + jeuCodirScore) / 2) * 20),
      100
    );

    const validationScore = Math.min(
      Math.round(ficheKpisScore * 20),
      100
    );

    const analyseScore = Math.min(
      Math.round(((gapCompetencesScore + planFormationScore) / 2) * 20),
      100
    );

    return {
      miseEnSituationScore,
      validationScore,
      analyseScore,
      globalScore
    };
  }, [evaluationData]);

  // Charger l'évaluation au montage du composant
  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  return {
    evaluationData,
    updateEvaluation,
    calculateSectionScores,
    isLoading,
    isSaving
  };
}