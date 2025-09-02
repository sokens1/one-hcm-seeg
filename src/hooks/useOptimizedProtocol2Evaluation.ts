import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedCache } from './useOptimizedCache';

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
    fiche_kris: {
      score: number;
      comments: string;
    };
    fiche_kcis: {
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
    },
    fiche_kris: {
      score: 0,
      comments: ''
    },
    fiche_kcis: {
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

export function useOptimizedProtocol2Evaluation(applicationId: string) {
  const [evaluationData, setEvaluationData] = useState<Protocol2EvaluationData>(defaultEvaluationData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const cache = useOptimizedCache<Protocol2EvaluationData>({ ttl: 2 * 60 * 1000 }); // 2 minutes de cache
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les données avec cache
  const loadEvaluation = useCallback(async () => {
    if (!applicationId) return;
    
    // Vérifier le cache d'abord
    const cachedData = cache.get(`protocol2_evaluation_${applicationId}`);
    if (cachedData) {
      setEvaluationData(cachedData);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Requête optimisée - seulement les champs nécessaires
      const { data, error } = await supabase
        .from('protocol2_evaluations')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let loadedData = defaultEvaluationData;
      if (data) {
        loadedData = {
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
            },
            fiche_kris: {
              score: 0,
              comments: ''
            },
            fiche_kcis: {
              score: 0,
              comments: ''
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
        };
      }
      
      setEvaluationData(loadedData);
      // Mettre en cache les données
      cache.set(`protocol2_evaluation_${applicationId}`, loadedData);
      
    } catch (error) {
      console.error('Erreur lors du chargement de l\'évaluation Protocole 2:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données d'évaluation Protocole 2.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, toast, cache]);

  // Sauvegarder les données avec invalidation du cache
  const saveEvaluation = useCallback(async (data: Protocol2EvaluationData) => {
    if (!applicationId || !user) return;
    
    setIsSaving(true);
    try {
      const evaluationRecord = {
        application_id: applicationId,
        evaluator_id: user.id,
        qcm_role_score: data.mise_en_situation.jeu_de_role.score,
        interview_notes: data.mise_en_situation.jeu_de_role.comments,
        qcm_codir_score: data.mise_en_situation.jeu_codir.score,
        visit_notes: data.mise_en_situation.jeu_codir.comments,
        overall_score: Math.round(
          (data.mise_en_situation.jeu_de_role.score + 
           data.mise_en_situation.jeu_codir.score + 
           data.validation_operationnelle.fiche_kpis.score + 
           data.validation_operationnelle.fiche_kris.score + 
           data.validation_operationnelle.fiche_kcis.score + 
           data.analyse_competences.gap_competences.score + 
           data.analyse_competences.plan_formation.score) / 7
        ),
        skills_gap_notes: data.analyse_competences.gap_competences.comments + 
          (data.analyse_competences.gap_competences.gapLevel ? 
            ` Niveau: ${data.analyse_competences.gap_competences.gapLevel}` : ''),
        completed: data.status === 'completed',
        updated_at: new Date().toISOString()
      };

      // Vérifier si un enregistrement existe déjà
      const { data: existingRecord } = await supabase
        .from('protocol2_evaluations')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      let result;
      if (existingRecord) {
        result = await supabase
          .from('protocol2_evaluations')
          .update(evaluationRecord)
          .eq('application_id', applicationId);
      } else {
        result = await supabase
          .from('protocol2_evaluations')
          .insert(evaluationRecord);
      }

      if (result.error) {
        throw result.error;
      }

      // Invalider le cache après sauvegarde
      cache.invalidate(`protocol2_evaluation_${applicationId}`);
      
      console.log('Évaluation Protocole 2 sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde Protocole 2:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les données d'évaluation Protocole 2.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [applicationId, user, toast, cache]);

  // Mettre à jour les données avec sauvegarde automatique optimisée
  const updateEvaluation = useCallback((updater: (prev: Protocol2EvaluationData) => Protocol2EvaluationData) => {
    setEvaluationData(prev => {
      const newData = updater(prev);
      
      // Mettre à jour le statut
      const hasScores = newData.mise_en_situation.jeu_de_role.score > 0 || 
                       newData.mise_en_situation.jeu_codir.score > 0 ||
                       newData.validation_operationnelle.fiche_kpis.score > 0 ||
                       newData.analyse_competences.gap_competences.score > 0 ||
                       newData.analyse_competences.plan_formation.score > 0;
      
      if (hasScores && newData.status === 'pending') {
        newData.status = 'in_progress';
      }
      
      // Annuler la sauvegarde précédente si elle existe
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Sauvegarder automatiquement après un délai plus long (10 secondes)
      saveTimeoutRef.current = setTimeout(() => {
        saveEvaluation(newData);
        saveTimeoutRef.current = null;
      }, 10000);
      
      return newData;
    });
  }, [saveEvaluation]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  // Nettoyer le cache périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      cache.cleanup();
    }, 60000); // Nettoyer toutes les minutes

    return () => clearInterval(interval);
  }, [cache]);

  // Calculer les scores des sections
  const calculateSectionScores = useCallback(() => {
    // S'assurer que les scores ne dépassent jamais 5
    const jeuDeRoleScore = Math.min(evaluationData.mise_en_situation.jeu_de_role.score, 5);
    const jeuCodirScore = Math.min(evaluationData.mise_en_situation.jeu_codir.score, 5);
    const ficheKpisScore = Math.min(evaluationData.validation_operationnelle.fiche_kpis.score, 5);
    const ficheKrisScore = Math.min(evaluationData.validation_operationnelle.fiche_kris?.score || 0, 5);
    const ficheKcisScore = Math.min(evaluationData.validation_operationnelle.fiche_kcis?.score || 0, 5);
    const gapCompetencesScore = Math.min(evaluationData.analyse_competences.gap_competences.score, 5);
    const planFormationScore = Math.min(evaluationData.analyse_competences.plan_formation.score, 5);

    // Calculer le score global avec tous les champs
    const globalScore = Math.min(
      Math.round(
        (jeuDeRoleScore + jeuCodirScore + ficheKpisScore + ficheKrisScore + ficheKcisScore + gapCompetencesScore + planFormationScore) / 7
      ),
      5
    );

    return {
      miseEnSituation: Math.round((jeuDeRoleScore + jeuCodirScore) / 2),
      validationOperationnelle: Math.round((ficheKpisScore + ficheKrisScore + ficheKcisScore) / 3),
      analyseCompetences: Math.round((gapCompetencesScore + planFormationScore) / 2),
      global: globalScore
    };
  }, [evaluationData]);

  return {
    evaluationData,
    updateEvaluation,
    calculateSectionScores,
    isLoading,
    isSaving,
    reload: loadEvaluation
  };
}
