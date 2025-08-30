import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type Protocol2Evaluation = Tables<'protocol2_evaluations'>;

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
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger l'évaluation existante
  const loadEvaluation = useCallback(async () => {
    if (!applicationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('protocol2_evaluations')
        .select(`
          id,
          application_id,
          evaluator_id,
          physical_visit,
          interview_completed,
          qcm_role_completed,
          qcm_codir_completed,
          job_sheet_created,
          skills_gap_assessed,
          interview_notes,
          visit_notes,
          qcm_role_score,
          qcm_codir_score,
          skills_gap_notes,
          overall_score,
          completed,
          created_at,
          updated_at
        `)
        .eq('application_id', applicationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        // Convertir les données de la base vers le format du composant
        const convertedData: Protocol2EvaluationData = {
          status: data.completed ? 'completed' : 'in_progress',
          mise_en_situation: {
            // Jeu de rôle (interview)
            jeu_de_role: {
              score: data.qcm_role_score || 0,
              comments: data.interview_notes || ''
            },
            // Jeu de mise en situation CODIR
            jeu_codir: {
              score: data.qcm_codir_score || 0,
              comments: data.visit_notes || ''
            }
          },
          validation_operationnelle: {
            // Edition de Fiche KPI'S
            fiche_kpis: {
              score: data.overall_score || 0,
              comments: data.skills_gap_notes || ''
            }
          },
          analyse_competences: {
            // Analyse du Gap de compétences
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
        };
        setEvaluationData(convertedData);
        
        console.log('Évaluation Protocol 2 chargée avec succès:', {
          'Jeu de mise en situation CODIR': {
            score: convertedData.mise_en_situation.jeu_codir.score,
            comments: convertedData.mise_en_situation.jeu_codir.comments,
            loaded_from: 'qcm_codir_score, visit_notes'
          },
          'Edition de Fiche KPI\'S': {
            score: convertedData.validation_operationnelle.fiche_kpis.score,
            comments: convertedData.validation_operationnelle.fiche_kpis.comments,
            loaded_from: 'overall_score, skills_gap_notes'
          },
          'Analyse du Gap de compétences': {
            score: convertedData.analyse_competences.gap_competences.score,
            comments: convertedData.analyse_competences.gap_competences.comments,
            gapLevel: convertedData.analyse_competences.gap_competences.gapLevel,
            loaded_from: 'skills_gap_notes'
          },
          'Niveau de Gap identifié': {
            gapLevel: convertedData.analyse_competences.gap_competences.gapLevel,
            loaded_from: 'skills_gap_notes (extracted)'
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'évaluation:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données d'évaluation.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, toast]);

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
        qcm_codir_score: data.mise_en_situation.jeu_codir.score,
        visit_notes: data.mise_en_situation.jeu_codir.comments,
        
        // Jeu de rôle (interview)
        interview_completed: data.mise_en_situation.jeu_de_role.score > 0,
        qcm_role_completed: data.mise_en_situation.jeu_de_role.score > 0,
        qcm_role_score: data.mise_en_situation.jeu_de_role.score,
        interview_notes: data.mise_en_situation.jeu_de_role.comments,
        
        // Edition de Fiche KPI'S
        job_sheet_created: data.validation_operationnelle.fiche_kpis.score > 0,
        
        // Analyse du Gap de compétences
        skills_gap_assessed: data.analyse_competences.gap_competences.score > 0,
        skills_gap_notes: data.analyse_competences.gap_competences.gapLevel 
          ? `Niveau: ${data.analyse_competences.gap_competences.gapLevel} - ${data.analyse_competences.gap_competences.comments}`
          : data.analyse_competences.gap_competences.comments,
        
        // Score global calculé (converti en pourcentage)
        overall_score: Math.round(
          ((data.mise_en_situation.jeu_de_role.score +
           data.mise_en_situation.jeu_codir.score +
           data.validation_operationnelle.fiche_kpis.score +
           data.analyse_competences.gap_competences.score +
           data.analyse_competences.plan_formation.score) / 5) * 20
        ),
        
        // Statut
        completed: data.status === 'completed',
        updated_at: new Date().toISOString()
      };

      // Vérifier si l'évaluation existe déjà
      const { data: existingRecord } = await supabase
        .from('protocol2_evaluations')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      let result;
      if (existingRecord) {
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

      console.log('Évaluation Protocol 2 sauvegardée avec succès:', {
        'Jeu de mise en situation CODIR': {
          score: data.mise_en_situation.jeu_codir.score,
          comments: data.mise_en_situation.jeu_codir.comments,
          saved_to: 'qcm_codir_score, visit_notes'
        },
        'Edition de Fiche KPI\'S': {
          score: data.validation_operationnelle.fiche_kpis.score,
          comments: data.validation_operationnelle.fiche_kpis.comments,
          saved_to: 'job_sheet_created'
        },
        'Analyse du Gap de compétences': {
          score: data.analyse_competences.gap_competences.score,
          comments: data.analyse_competences.gap_competences.comments,
          gapLevel: data.analyse_competences.gap_competences.gapLevel,
          saved_to: 'skills_gap_notes'
        },
        'Niveau de Gap identifié': {
          gapLevel: data.analyse_competences.gap_competences.gapLevel,
          saved_to: 'skills_gap_notes (with level prefix)'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les données d'évaluation.",
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
    const miseEnSituationScore = (
      evaluationData.mise_en_situation.jeu_de_role.score +
      evaluationData.mise_en_situation.jeu_codir.score
    ) / 2 * 20; // Convertir en pourcentage (sur 5, donc * 20)

    const validationScore = evaluationData.validation_operationnelle.fiche_kpis.score * 20;

    const analyseScore = (
      evaluationData.analyse_competences.gap_competences.score +
      evaluationData.analyse_competences.plan_formation.score
    ) / 2 * 20;

    const globalScore = (miseEnSituationScore + validationScore + analyseScore) / 3;

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
    calculateSectionScores: () => calculateSectionScores(),
    isLoading,
    isSaving,
    error,
    reload: loadEvaluation
  };
}
