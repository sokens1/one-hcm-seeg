<<<<<<< HEAD
import { useState, useEffect, useCallback, useRef } from 'react';
=======
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
>>>>>>> c6157c5caacfefac773187232d2925ac0285fdc8
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface EvaluationData {
  globalScore: number;
  status: string;
  protocol1: {
    score: number;
    status: 'pending' | 'in_progress' | 'completed';
    // Partie 1: Validation des Prérequis
    documentaryEvaluation: {
      cv: {
        score: number;
        comments: string;
      };
      lettreMotivation: {
        score: number;
        comments: string;
      };
      diplomesEtCertificats: {
        score: number;
        comments: string;
      };
    };
    // Evaluation MTP - Taux d'adhérence MTP
    mtpAdherence: {
      metier: {
        score: number;
        comments: string;
      };
      talent: {
        score: number;
        comments: string;
      };
      paradigme: {
        score: number;
        comments: string;
      };
    };
    // Partie 2: Entretien
    interview: {
      interviewDate?: Date;
      physicalMtpAdherence: {
        metier: {
          score: number;
          comments: string;
        };
        talent: {
          score: number;
          comments: string;
        };
        paradigme: {
          score: number;
          comments: string;
        };
      };
      gapCompetence: {
        score: number;
        comments: string;
      };
      generalSummary: string;
    };
  };
}

const defaultEvaluationData: EvaluationData = {
  globalScore: 0,
  status: "Évaluation - Protocole 1 en cours",
  protocol1: {
    score: 0,
    status: 'pending',
    documentaryEvaluation: {
      cv: { score: 0, comments: "" },
      lettreMotivation: { score: 0, comments: "" },
      diplomesEtCertificats: { score: 0, comments: "" },
    },
    mtpAdherence: {
      metier: { score: 0, comments: "" },
      talent: { score: 0, comments: "" },
      paradigme: { score: 0, comments: "" },
    },
    interview: {
      physicalMtpAdherence: {
        metier: { score: 0, comments: "" },
        talent: { score: 0, comments: "" },
        paradigme: { score: 0, comments: "" },
      },
      gapCompetence: { score: 0, comments: "" },
      generalSummary: ""
    },
  },
};

export function useProtocol1Evaluation(applicationId: string) {
  const [evaluationData, setEvaluationData] = useState<EvaluationData>(defaultEvaluationData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fonction pour calculer les scores partiels de chaque section
  const calculateSectionScores = useCallback((protocol1: any) => {
    // Validation des Prérequis - Moyenne des 3 évaluations documentaires (convertie en %)
    const documentaryScores = [
      protocol1.documentaryEvaluation.cv.score,
      protocol1.documentaryEvaluation.lettreMotivation.score,
      protocol1.documentaryEvaluation.diplomesEtCertificats.score
    ];
    const documentaryAverage = documentaryScores.length > 0 ? documentaryScores.reduce((a, b) => a + b, 0) / documentaryScores.length : 0;
    const documentaryScore = (documentaryAverage / 5) * 100;
    
    // Evaluation MTP - Taux d'adhérence MTP (convertie en %)
    const mtpScores = [
      protocol1.mtpAdherence.metier.score,
      protocol1.mtpAdherence.talent.score,
      protocol1.mtpAdherence.paradigme.score
    ];
    const mtpAverage = mtpScores.length > 0 ? mtpScores.reduce((a, b) => a + b, 0) / mtpScores.length : 0;
    const mtpScore = (mtpAverage / 5) * 100;
    
    // Entretien - Moyenne des évaluations physiques MTP + Gap de compétence (convertie en %)
    const interviewScores = [
      protocol1.interview.physicalMtpAdherence.metier.score,
      protocol1.interview.physicalMtpAdherence.talent.score,
      protocol1.interview.physicalMtpAdherence.paradigme.score,
      protocol1.interview.gapCompetence.score
    ];
    const interviewAverage = interviewScores.length > 0 ? interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length : 0;
    const interviewScore = (interviewAverage / 5) * 100;

    // Score global = moyenne pondérée des 3 sections
    const totalScore = (documentaryScore + mtpScore + interviewScore) / 3;

    return {
      documentaryScore,
      mtpScore, 
      interviewScore,
      totalScore
    };
  }, []);

  // Charger les données existantes
  const loadEvaluation = useCallback(async () => {
    if (!applicationId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('protocol1_evaluations')
        .select(`
          id,
          application_id,
          cv_score,
          cv_comments,
          lettre_motivation_score,
          lettre_motivation_comments,
          diplomes_certificats_score,
          diplomes_certificats_comments,
          metier_score,
          metier_comments,
          talent_score,
          talent_comments,
          paradigme_score,
          paradigme_comments,
          interview_date,
          interview_metier_score,
          interview_metier_comments,
          interview_talent_score,
          interview_talent_comments,
          interview_paradigme_score,
          interview_paradigme_comments,
          gap_competence_score,
          gap_competence_comments,
          general_summary,
          overall_score,
          status
        `)
        .eq('application_id', applicationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        // Mapper les données de la DB vers notre structure
        const loadedData: EvaluationData = {
          globalScore: data.overall_score || 0,
          status: data.status === 'completed' ? 'Évaluation terminée' : 'Évaluation - Protocole 1 en cours',
          protocol1: {
            score: data.overall_score || 0,
            status: data.status || 'pending',
            documentaryEvaluation: {
              cv: {
                score: data.cv_score || 0,
                comments: data.cv_comments || ""
              },
              lettreMotivation: {
                score: data.lettre_motivation_score || 0,
                comments: data.lettre_motivation_comments || ""
              },
              diplomesEtCertificats: {
                score: data.diplomes_certificats_score || 0,
                comments: data.diplomes_certificats_comments || ""
              },
            },
            mtpAdherence: {
              metier: {
                score: data.metier_score || 0,
                comments: data.metier_comments || ""
              },
              talent: {
                score: data.talent_score || 0,
                comments: data.talent_comments || ""
              },
              paradigme: {
                score: data.paradigme_score || 0,
                comments: data.paradigme_comments || ""
              },
            },
            interview: {
              interviewDate: data.interview_date ? new Date(data.interview_date) : undefined,
              physicalMtpAdherence: {
                metier: {
                  score: data.interview_metier_score || 0,
                  comments: data.interview_metier_comments || ""
                },
                talent: {
                  score: data.interview_talent_score || 0,
                  comments: data.interview_talent_comments || ""
                },
                paradigme: {
                  score: data.interview_paradigme_score || 0,
                  comments: data.interview_paradigme_comments || ""
                },
              },
              gapCompetence: {
                score: data.gap_competence_score || 0,
                comments: data.gap_competence_comments || ""
              },
              generalSummary: data.general_summary || ""
            },
          },
        };
        
        setEvaluationData(loadedData);
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

  // Sauvegarder les données
  const saveEvaluation = useCallback(async (data: EvaluationData) => {
    if (!applicationId || !user) return;
    
    setIsSaving(true);
    try {
      const sectionScores = calculateSectionScores(data.protocol1);
      
      const evaluationRecord = {
        application_id: applicationId,
        evaluator_id: user.id,
        
        // Évaluation documentaire
        cv_score: data.protocol1.documentaryEvaluation.cv.score,
        cv_comments: data.protocol1.documentaryEvaluation.cv.comments,
        lettre_motivation_score: data.protocol1.documentaryEvaluation.lettreMotivation.score,
        lettre_motivation_comments: data.protocol1.documentaryEvaluation.lettreMotivation.comments,
        diplomes_certificats_score: data.protocol1.documentaryEvaluation.diplomesEtCertificats.score,
        diplomes_certificats_comments: data.protocol1.documentaryEvaluation.diplomesEtCertificats.comments,
        
        // Évaluation MTP
        metier_score: data.protocol1.mtpAdherence.metier.score,
        metier_comments: data.protocol1.mtpAdherence.metier.comments,
        talent_score: data.protocol1.mtpAdherence.talent.score,
        talent_comments: data.protocol1.mtpAdherence.talent.comments,
        paradigme_score: data.protocol1.mtpAdherence.paradigme.score,
        paradigme_comments: data.protocol1.mtpAdherence.paradigme.comments,
        
        // Entretien
        interview_date: data.protocol1.interview.interviewDate?.toISOString(),
        interview_metier_score: data.protocol1.interview.physicalMtpAdherence.metier.score,
        interview_metier_comments: data.protocol1.interview.physicalMtpAdherence.metier.comments,
        interview_talent_score: data.protocol1.interview.physicalMtpAdherence.talent.score,
        interview_talent_comments: data.protocol1.interview.physicalMtpAdherence.talent.comments,
        interview_paradigme_score: data.protocol1.interview.physicalMtpAdherence.paradigme.score,
        interview_paradigme_comments: data.protocol1.interview.physicalMtpAdherence.paradigme.comments,
        gap_competence_score: data.protocol1.interview.gapCompetence.score,
        gap_competence_comments: data.protocol1.interview.gapCompetence.comments,
        general_summary: data.protocol1.interview.generalSummary,
        
        // Scores calculés
        documentary_score: sectionScores.documentaryScore,
        mtp_score: sectionScores.mtpScore,
        interview_score: sectionScores.interviewScore,
        total_score: sectionScores.totalScore,
        overall_score: Math.round(sectionScores.totalScore),
        
        // Statut
        status: data.protocol1.status,
        completed: data.protocol1.status === 'completed',
        
        updated_at: new Date().toISOString()
      };

      // Vérifier si un enregistrement existe déjà
      const { data: existingRecord } = await supabase
        .from('protocol1_evaluations')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      let result;
      if (existingRecord) {
        // Mettre à jour l'enregistrement existant
        result = await supabase
          .from('protocol1_evaluations')
          .update(evaluationRecord)
          .eq('application_id', applicationId);
      } else {
        // Créer un nouvel enregistrement
        result = await supabase
          .from('protocol1_evaluations')
          .insert(evaluationRecord);
      }

      if (result.error) {
        throw result.error;
      }

      // console.log('Évaluation sauvegardée avec succès');
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
  }, [applicationId, user, calculateSectionScores, toast]);

  // Debounce timer pour les sauvegardes automatiques
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mettre à jour les données avec sauvegarde automatique optimisée
  const updateEvaluation = useCallback((updater: (prev: EvaluationData) => EvaluationData) => {
    setEvaluationData(prev => {
      const newData = updater(prev);
      
      // Calculer les nouveaux scores
      const sectionScores = calculateSectionScores(newData.protocol1);
      newData.protocol1.score = Math.round(sectionScores.totalScore);
      newData.globalScore = sectionScores.totalScore;
      
      // Mettre à jour le statut
      if (sectionScores.documentaryScore > 0 && sectionScores.mtpScore > 0) {
        newData.protocol1.status = 'in_progress';
      }
      if (newData.protocol1.score >= 60) {
        newData.protocol1.status = 'completed';
      }
      
      // Annuler la sauvegarde précédente si elle existe
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Sauvegarder automatiquement après un délai plus long (5 secondes au lieu de 1)
      saveTimeoutRef.current = setTimeout(() => {
        saveEvaluation(newData);
        saveTimeoutRef.current = null;
      }, 5000);
      
      return newData;
    });
  }, [calculateSectionScores, saveEvaluation]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  return {
    evaluationData,
    updateEvaluation,
    calculateSectionScores: () => calculateSectionScores(evaluationData.protocol1),
    isLoading,
    isSaving,
    reload: loadEvaluation
  };
}
