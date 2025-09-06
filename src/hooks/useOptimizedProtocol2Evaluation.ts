/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const LOCAL_KEY = `protocol2_evaluation_details_${applicationId}`;
  const LOCAL_MTIME_KEY = `protocol2_evaluation_details_${applicationId}_mtime`;
  const LOCAL_DIRTY_KEY = `protocol2_evaluation_details_${applicationId}_dirty`;

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
        // Utiliser la nouvelle structure de colonnes
        loadedData = {
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
      }
      // Fusionner avec les données locales détaillées (non stockées en DB)
      try {
        const localRaw = localStorage.getItem(`protocol2_evaluation_details_${applicationId}`);
        if (localRaw) {
          const localData = JSON.parse(localRaw) as Protocol2EvaluationData;
          // On privilégie les champs locaux pour ne pas perdre les sous-scores
          loadedData = {
            ...loadedData,
            mise_en_situation: localData.mise_en_situation || loadedData.mise_en_situation,
            validation_operationnelle: localData.validation_operationnelle || loadedData.validation_operationnelle,
            analyse_competences: localData.analyse_competences || loadedData.analyse_competences,
          };
        }
      } catch (e) {
        console.warn('Impossible de charger les détails locaux Protocol 2:', e);
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
    
    console.log('💾 Sauvegarde des données Protocol 2:', {
      mise_en_situation: data.mise_en_situation,
      validation_operationnelle: data.validation_operationnelle,
      analyse_competences: data.analyse_competences
    });
    setIsSaving(true);
    try {
      // Calcul cohérent avec calculateSectionScores (pourcentages pondérés)
      const situationAvgOn5 = (
        Math.min(data.mise_en_situation.jeu_de_role.score, 5) +
        Math.min(data.mise_en_situation.jeu_codir.score, 5)
      ) / 2;
      const performanceAvgOn5 = (
        Math.min(data.validation_operationnelle.fiche_kpis.score, 5) +
        Math.min(data.validation_operationnelle.fiche_kris.score, 5) +
        Math.min(data.validation_operationnelle.fiche_kcis.score, 5)
      ) / 3;
      const competenceAvgOn5 = (
        Math.min(data.analyse_competences.gap_competences.score, 5) +
        Math.min(data.analyse_competences.plan_formation.score, 5)
      ) / 2;

      const situationPct = (situationAvgOn5 / 5) * 100;
      const performancePct = (performanceAvgOn5 / 5) * 100;
      const competencePct = (competenceAvgOn5 / 5) * 100;
      const globalPct = situationPct * 0.5 + performancePct * 0.2 + competencePct * 0.3;

      const evaluationRecord = {
        application_id: applicationId,
        evaluator_id: user.id,
        
        // Mise en situation (Simulation)
        jeu_de_role_score: data.mise_en_situation.jeu_de_role.score,
        jeu_de_role_comments: data.mise_en_situation.jeu_de_role.comments,
        jeu_codir_score: data.mise_en_situation.jeu_codir.score,
        jeu_codir_comments: data.mise_en_situation.jeu_codir.comments,
        
        // Validation opérationnelle (Performance)
        fiche_kpis_score: data.validation_operationnelle.fiche_kpis.score,
        fiche_kpis_comments: data.validation_operationnelle.fiche_kpis.comments,
        fiche_kris_score: data.validation_operationnelle.fiche_kris.score,
        fiche_kris_comments: data.validation_operationnelle.fiche_kris.comments,
        fiche_kcis_score: data.validation_operationnelle.fiche_kcis.score,
        fiche_kcis_comments: data.validation_operationnelle.fiche_kcis.comments,
        
        // Analyse des compétences
        gap_competences_score: data.analyse_competences.gap_competences.score,
        gap_competences_comments: data.analyse_competences.gap_competences.comments,
        gap_competences_level: data.analyse_competences.gap_competences.gapLevel,
        plan_formation_score: data.analyse_competences.plan_formation.score,
        plan_formation_comments: data.analyse_competences.plan_formation.comments,
        
        // Scores calculés
        mise_en_situation_score: Math.round(situationPct),
        validation_operationnelle_score: Math.round(performancePct),
        analyse_competences_score: Math.round(competencePct),
        total_score: Math.round(globalPct),
        overall_score: Math.round(globalPct),
        
        // Statut
        status: data.status,
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

      // Les données sont maintenant stockées dans des colonnes dédiées
      // Plus besoin de la colonne JSONB details

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

  // Calculer les scores des sections (retour en pourcentage, pondéré 50/20/30)
  const calculateSectionScores = useCallback((data: Protocol2EvaluationData) => {
    // S'assurer que les scores ne dépassent jamais 5
    const jeuDeRoleScore = Math.min(data.mise_en_situation.jeu_de_role.score, 5);
    const jeuCodirScore = Math.min(data.mise_en_situation.jeu_codir.score, 5);
    const ficheKpisScore = Math.min(data.validation_operationnelle.fiche_kpis.score, 5);
    const ficheKrisScore = Math.min(data.validation_operationnelle.fiche_kris?.score || 0, 5);
    const ficheKcisScore = Math.min(data.validation_operationnelle.fiche_kcis?.score || 0, 5);
    const gapCompetencesScore = Math.min(data.analyse_competences.gap_competences.score, 5);
    const planFormationScore = Math.min(data.analyse_competences.plan_formation.score, 5);

    // Moyennes par section (sur 5)
    const situationAvgOn5 = (jeuDeRoleScore + jeuCodirScore) / 2;
    const performanceAvgOn5 = (ficheKpisScore + ficheKrisScore + ficheKcisScore) / 3;
    const competenceAvgOn5 = (gapCompetencesScore + planFormationScore) / 2;

    // Conversion en pourcentage
    const situationPct = (situationAvgOn5 / 5) * 100;
    const performancePct = (performanceAvgOn5 / 5) * 100;
    const competencePct = (competenceAvgOn5 / 5) * 100;

    // Pondération: 50% / 20% / 30%
    const globalScore = (situationPct * 0.5) + (performancePct * 0.2) + (competencePct * 0.3);

    return {
      situation: situationPct,
      performance: performancePct,
      competence: competencePct,
      global: globalScore
    };
  }, []);

  // Mettre à jour les données avec sauvegarde automatique optimisée (copié du protocole 1)
  const updateEvaluation = useCallback((updater: (prev: Protocol2EvaluationData) => Protocol2EvaluationData) => {
    setEvaluationData(prev => {
      const newData = updater(prev);
      
      // console.log('🔄 Mise à jour des données:', { 
      //   prev_jeu_de_role: prev.mise_en_situation.jeu_de_role.score, 
      //   new_jeu_de_role: newData.mise_en_situation.jeu_de_role.score,
      //   prev_jeu_codir: prev.mise_en_situation.jeu_codir.score,
      //   new_jeu_codir: newData.mise_en_situation.jeu_codir.score
      // });
      
      // Calculer les scores comme dans le protocole 1
      const sectionScores = calculateSectionScores(newData);
      newData.globalScore = sectionScores.global;
      
      // Mettre à jour le statut basé sur les scores
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
      
      // Écrire immédiatement une copie locale pour ne rien perdre en cas de reload (comme protocole 1)
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(newData));
        localStorage.setItem(LOCAL_MTIME_KEY, Date.now().toString());
        localStorage.setItem(LOCAL_DIRTY_KEY, '1');
      } catch (e) {
        console.warn('Impossible d\'écrire les détails Protocol 2 en localStorage (update):', e);
      }

      // Sauvegarder automatiquement après un délai court (1 seconde comme protocole 1)
      saveTimeoutRef.current = setTimeout(() => {
        // console.log('💾 [SAVE DEBUG] Sauvegarde automatique déclenchée');
        saveEvaluation(newData);
        saveTimeoutRef.current = null;
      }, 1000);
      
      return newData;
    });
  }, [calculateSectionScores, saveEvaluation]);


  // Charger les données au montage du composant
  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  // Nettoyer le timeout au démontage (comme protocole 1)
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Sauvegarde forcée juste avant rafraîchissement/fermeture ou tab cachée (comme protocole 1)
  useEffect(() => {
    const handleImmediatePersist = () => {
      try {
        // Annule le debounce et force la sauvegarde DB immédiate
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        // Écriture locale pour résilience puis sauvegarde DB
        localStorage.setItem(LOCAL_KEY, JSON.stringify(evaluationData));
        localStorage.setItem(LOCAL_MTIME_KEY, Date.now().toString());
        // Ne pas modifier le flag dirty ici; la sauvegarde sera déclenchée juste après
        saveEvaluation(evaluationData);
      } catch (e) {
        console.warn('Impossible de sauvegarder immédiatement Protocol 2:', e);
      }
    };

    // Écouter les événements de fermeture/rafraîchissement
    window.addEventListener('beforeunload', handleImmediatePersist);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        handleImmediatePersist();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleImmediatePersist);
      document.removeEventListener('visibilitychange', handleImmediatePersist);
    };
  }, [evaluationData, saveEvaluation]);

  // Nettoyer le cache périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      cache.cleanup();
    }, 60000); // Nettoyer toutes les minutes

    return () => clearInterval(interval);
  }, [cache]);

  // Sauvegarde forcée avant rafraîchissement/fermeture pour ne pas perdre le global
  useEffect(() => {
    const handleImmediatePersist = () => {
      try {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        // Sauvegarde rapide des détails dans la colonne JSONB
        void supabase
          .from('protocol2_evaluations')
          .update({ details: evaluationData as unknown as Record<string, unknown> })
          .eq('application_id', applicationId);
        saveEvaluation(evaluationData);
      } catch (e) {
        console.warn('Erreur lors de la persistance immédiate Protocol 2:', e);
      }
    };

    window.addEventListener('beforeunload', handleImmediatePersist);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleImmediatePersist();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleImmediatePersist);
    };
  }, [applicationId, evaluationData, saveEvaluation]);


  return {
    evaluationData,
    updateEvaluation,
    calculateSectionScores,
    isLoading,
    isSaving,
    reload: loadEvaluation
  };
}
