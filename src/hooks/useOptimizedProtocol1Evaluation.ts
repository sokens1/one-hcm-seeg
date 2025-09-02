import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EvaluationData } from './useProtocol1Evaluation';

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

export function useOptimizedProtocol1Evaluation(applicationId: string) {
  const [evaluationData, setEvaluationData] = useState<EvaluationData>(defaultEvaluationData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const LOCAL_KEY = `protocol1_evaluation_details_${applicationId}`;
  const LOCAL_MTIME_KEY = `protocol1_evaluation_details_${applicationId}_mtime`;
  const LOCAL_DIRTY_KEY = `protocol1_evaluation_details_${applicationId}_dirty`;

  // Fonction pour calculer les scores partiels de chaque section (pondération 10/20/70, sans arrondi côté UI)
  const calculateSectionScores = useCallback((protocol1: any) => {
    // 1) Score documentaire: moyenne des 3 documents (sur 5) -> %
    const documentaryScores = [
      protocol1.documentaryEvaluation.cv.score,
      protocol1.documentaryEvaluation.lettreMotivation.score,
      protocol1.documentaryEvaluation.diplomesEtCertificats.score
    ];
    const documentaryAvgOn5 = documentaryScores.reduce((a: number, b: number) => a + (b || 0), 0) / documentaryScores.length;
    const documentaryScore = (documentaryAvgOn5 / 5) * 100;
    
    // 2) Score MTP: moyenne des 3 axes (sur 5) -> %
    const mtpScores = [
      protocol1.mtpAdherence.metier.score,
      protocol1.mtpAdherence.talent.score,
      protocol1.mtpAdherence.paradigme.score
    ];
    const mtpAverage = mtpScores.length > 0 ? mtpScores.reduce((a: number, b: number) => a + (b || 0), 0) / mtpScores.length : 0;
    const mtpScore = (mtpAverage / 5) * 100;
    
    // 3) Score Entretien: moyenne des 3 axes physiques MTP + gap de compétence (sur 5) -> %
    const interviewScores = [
      protocol1.interview.physicalMtpAdherence.metier.score,
      protocol1.interview.physicalMtpAdherence.talent.score,
      protocol1.interview.physicalMtpAdherence.paradigme.score,
      protocol1.interview.gapCompetence.score
    ];
    const interviewAverage = interviewScores.length > 0
      ? interviewScores.reduce((a: number, b: number) => a + (b || 0), 0) / interviewScores.length
      : 0;
    const interviewScore = (interviewAverage / 5) * 100;
    
    // Score global pondéré = 10% documentaire, 20% MTP, 70% entretien
    const totalScore = (0.10 * documentaryScore) + (0.20 * mtpScore) + (0.70 * interviewScore);

    return {
      documentaryScore,
      mtpScore, 
      interviewScore,
      totalScore
    };
  }, []);

  // Charger les données avec cache
  const loadEvaluation = useCallback(async () => {
    if (!applicationId) return;
    
    setIsLoading(true);
    try {
      // Requête complète pour récupérer toutes les données nécessaires
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
          status,
          completed,
          created_at,
          updated_at
        `)
        .eq('application_id', applicationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let loadedData = defaultEvaluationData;
      let dbUpdatedAt: number | undefined;
      if (data) {
        console.log('📥 [LOAD DEBUG] Données brutes de la DB:', data);
        
        loadedData = {
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
        dbUpdatedAt = data.updated_at ? new Date(data.updated_at).getTime() : 0;
      } else {
        // Aucun enregistrement en BD: tenter d'utiliser un brouillon local, sinon valeurs par défaut
        try {
          const localRaw = localStorage.getItem(LOCAL_KEY);
          if (localRaw) {
            const localData = JSON.parse(localRaw) as EvaluationData;
            loadedData = localData;
            // Persister immédiatement le brouillon local en BD pour supprimer l'incohérence
            try {
              await saveEvaluation(localData);
            } catch {
              /* empty */
            }
          }
        } catch (e) {
          console.warn('Impossible de charger les détails locaux Protocol 1:', e);
        }
      }
      
      // Comparer avec un brouillon local plus récent que la BD, uniquement si marqué dirty
      try {
        const localRaw = localStorage.getItem(LOCAL_KEY);
        const localMtimeRaw = localStorage.getItem(LOCAL_MTIME_KEY);
        const localDirty = localStorage.getItem(LOCAL_DIRTY_KEY) === '1';
        if (localRaw && localMtimeRaw) {
          const localMtime = parseInt(localMtimeRaw);
          if (localDirty && localMtime > (dbUpdatedAt ?? 0)) {
            const localData = JSON.parse(localRaw) as EvaluationData;
            // Heuristique: n'écrase pas avec un état totalement vide (tout à 0 et comments vides)
            const hasMeaningfulContent = (
              (localData.protocol1.documentaryEvaluation.cv.score > 0 ||
               localData.protocol1.documentaryEvaluation.lettreMotivation.score > 0 ||
               localData.protocol1.documentaryEvaluation.diplomesEtCertificats.score > 0 ||
               localData.protocol1.mtpAdherence.metier.score > 0 ||
               localData.protocol1.mtpAdherence.talent.score > 0 ||
               localData.protocol1.mtpAdherence.paradigme.score > 0 ||
               localData.protocol1.interview.physicalMtpAdherence.metier.score > 0 ||
               localData.protocol1.interview.physicalMtpAdherence.talent.score > 0 ||
               localData.protocol1.interview.physicalMtpAdherence.paradigme.score > 0 ||
               localData.protocol1.interview.gapCompetence.score > 0 ||
               (localData.protocol1.interview.generalSummary || '').trim().length > 0)
            );
            if (hasMeaningfulContent) {
              console.log('♻️ [LOAD] Local plus récent et dirty: on restaure le brouillon local');
              loadedData = localData;
              // Persister immédiatement la version locale plus récente
              try {
                await saveEvaluation(localData);
                localStorage.setItem(LOCAL_DIRTY_KEY, '0');
              } catch {
                /* empty */
              }
            }
          }
        }
      } catch (e) {
        console.warn('Impossible de comparer mtime local avec BD:', e);
      }

      // Recalculer le score global à partir des champs actuels
      try {
        const sectionScores = calculateSectionScores(loadedData.protocol1);
        loadedData.protocol1.score = sectionScores.totalScore;
        loadedData.globalScore = sectionScores.totalScore;
      } catch (e) {
        console.warn('Erreur lors du recalcul du score global Protocol 1 au chargement:', e);
      }

      setEvaluationData(loadedData);
      
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
  }, [applicationId, toast, calculateSectionScores]);

  // Sauvegarder les données avec invalidation du cache
  const saveEvaluation = useCallback(async (data: EvaluationData) => {
    if (!applicationId) return;
    
    console.log('💾 [SAVE DEBUG] Début de la sauvegarde pour applicationId:', applicationId);
    console.log('💾 [SAVE DEBUG] Données à sauvegarder:', data);
    
    setIsSaving(true);
    try {
      const sectionScores = calculateSectionScores(data.protocol1);
      // Conformer aux types BD (entiers) pour éviter 22P02
      const documentaryScoreInt = Math.round(sectionScores.documentaryScore);
      const mtpScoreInt = Math.round(sectionScores.mtpScore);
      const interviewScoreInt = Math.round(sectionScores.interviewScore);
      const totalScoreInt = Math.round(sectionScores.totalScore);
      
      const evaluationRecord = {
        application_id: applicationId,
        evaluator_id: user?.id ?? null,
        
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
        
        // Scores calculés (entiers)
        documentary_score: documentaryScoreInt,
        mtp_score: mtpScoreInt,
        interview_score: interviewScoreInt,
        total_score: totalScoreInt,
        overall_score: totalScoreInt,
        
        // Statut
        status: data.protocol1.status,
        completed: data.protocol1.status === 'completed',
        
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 [SAVE DEBUG] Enregistrement à sauvegarder:', evaluationRecord);

      // Protéger les données existantes: ne pas écraser des valeurs non nulles avec 0/''
      const { data: existingFull } = await supabase
        .from('protocol1_evaluations')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      const preferExistingIfNewEmpty = <T>(newVal: T | null | undefined, oldVal: T | null | undefined): T | null | undefined => {
        // Pour nombres: si newVal === 0 et oldVal > 0 -> garder old
        if (typeof newVal === 'number') {
          if (newVal === 0 && typeof oldVal === 'number' && oldVal > 0) return oldVal;
          return newVal;
        }
        // Pour chaînes: si newVal vide et old non vide -> garder old
        if (typeof newVal === 'string') {
          if ((newVal || '').trim().length === 0 && (oldVal || '').toString().trim().length > 0) return oldVal;
          return newVal;
        }
        // Dates ISO: si new vide et old présent -> garder old
        if (newVal == null && oldVal != null) return oldVal;
        return newVal;
      };

      const mergedRecord = existingFull ? {
        ...evaluationRecord,
        cv_score: preferExistingIfNewEmpty(evaluationRecord.cv_score as unknown as number, existingFull.cv_score),
        cv_comments: preferExistingIfNewEmpty(evaluationRecord.cv_comments as unknown as string, existingFull.cv_comments),
        lettre_motivation_score: preferExistingIfNewEmpty(evaluationRecord.lettre_motivation_score as unknown as number, existingFull.lettre_motivation_score),
        lettre_motivation_comments: preferExistingIfNewEmpty(evaluationRecord.lettre_motivation_comments as unknown as string, existingFull.lettre_motivation_comments),
        diplomes_certificats_score: preferExistingIfNewEmpty(evaluationRecord.diplomes_certificats_score as unknown as number, existingFull.diplomes_certificats_score),
        diplomes_certificats_comments: preferExistingIfNewEmpty(evaluationRecord.diplomes_certificats_comments as unknown as string, existingFull.diplomes_certificats_comments),
        metier_score: preferExistingIfNewEmpty(evaluationRecord.metier_score as unknown as number, existingFull.metier_score),
        metier_comments: preferExistingIfNewEmpty(evaluationRecord.metier_comments as unknown as string, existingFull.metier_comments),
        talent_score: preferExistingIfNewEmpty(evaluationRecord.talent_score as unknown as number, existingFull.talent_score),
        talent_comments: preferExistingIfNewEmpty(evaluationRecord.talent_comments as unknown as string, existingFull.talent_comments),
        paradigme_score: preferExistingIfNewEmpty(evaluationRecord.paradigme_score as unknown as number, existingFull.paradigme_score),
        paradigme_comments: preferExistingIfNewEmpty(evaluationRecord.paradigme_comments as unknown as string, existingFull.paradigme_comments),
        interview_date: preferExistingIfNewEmpty(evaluationRecord.interview_date as unknown as string, existingFull.interview_date),
        interview_metier_score: preferExistingIfNewEmpty(evaluationRecord.interview_metier_score as unknown as number, existingFull.interview_metier_score),
        interview_metier_comments: preferExistingIfNewEmpty(evaluationRecord.interview_metier_comments as unknown as string, existingFull.interview_metier_comments),
        interview_talent_score: preferExistingIfNewEmpty(evaluationRecord.interview_talent_score as unknown as number, existingFull.interview_talent_score),
        interview_talent_comments: preferExistingIfNewEmpty(evaluationRecord.interview_talent_comments as unknown as string, existingFull.interview_talent_comments),
        interview_paradigme_score: preferExistingIfNewEmpty(evaluationRecord.interview_paradigme_score as unknown as number, existingFull.interview_paradigme_score),
        interview_paradigme_comments: preferExistingIfNewEmpty(evaluationRecord.interview_paradigme_comments as unknown as string, existingFull.interview_paradigme_comments),
        gap_competence_score: preferExistingIfNewEmpty(evaluationRecord.gap_competence_score as unknown as number, existingFull.gap_competence_score),
        gap_competence_comments: preferExistingIfNewEmpty(evaluationRecord.gap_competence_comments as unknown as string, existingFull.gap_competence_comments),
        general_summary: preferExistingIfNewEmpty(evaluationRecord.general_summary as unknown as string, existingFull.general_summary),
        documentary_score: preferExistingIfNewEmpty(evaluationRecord.documentary_score as unknown as number, existingFull.documentary_score),
        mtp_score: preferExistingIfNewEmpty(evaluationRecord.mtp_score as unknown as number, existingFull.mtp_score),
        interview_score: preferExistingIfNewEmpty(evaluationRecord.interview_score as unknown as number, existingFull.interview_score),
        total_score: preferExistingIfNewEmpty(evaluationRecord.total_score as unknown as number, existingFull.total_score),
        overall_score: preferExistingIfNewEmpty(evaluationRecord.overall_score as unknown as number, existingFull.overall_score),
      } : evaluationRecord;

      // Upsert atomique pour éviter les duplications (409) en cas d'autosaves concurrentes
      const result = await supabase
        .from('protocol1_evaluations')
        .upsert(mergedRecord, { onConflict: 'application_id' });

      if (result.error) {
        throw result.error;
      }
      
      console.log('Évaluation sauvegardée avec succès');

      // Recharger depuis la BD pour garantir l'état source-de-vérité côté UI
      const { data: fresh, error: freshErr } = await supabase
        .from('protocol1_evaluations')
        .select(`
          id,
          application_id,
          cv_score, cv_comments,
          lettre_motivation_score, lettre_motivation_comments,
          diplomes_certificats_score, diplomes_certificats_comments,
          metier_score, metier_comments,
          talent_score, talent_comments,
          paradigme_score, paradigme_comments,
          interview_date,
          interview_metier_score, interview_metier_comments,
          interview_talent_score, interview_talent_comments,
          interview_paradigme_score, interview_paradigme_comments,
          gap_competence_score, gap_competence_comments,
          general_summary,
          overall_score,
          status,
          updated_at
        `)
        .eq('application_id', applicationId)
        .maybeSingle();

      if (!freshErr && fresh) {
        const mapped: EvaluationData = {
          globalScore: fresh.overall_score || 0,
          status: fresh.status === 'completed' ? 'Évaluation terminée' : 'Évaluation - Protocole 1 en cours',
          protocol1: {
            score: fresh.overall_score || 0,
            status: fresh.status || 'pending',
            documentaryEvaluation: {
              cv: { score: fresh.cv_score || 0, comments: fresh.cv_comments || '' },
              lettreMotivation: { score: fresh.lettre_motivation_score || 0, comments: fresh.lettre_motivation_comments || '' },
              diplomesEtCertificats: { score: fresh.diplomes_certificats_score || 0, comments: fresh.diplomes_certificats_comments || '' },
            },
            mtpAdherence: {
              metier: { score: fresh.metier_score || 0, comments: fresh.metier_comments || '' },
              talent: { score: fresh.talent_score || 0, comments: fresh.talent_comments || '' },
              paradigme: { score: fresh.paradigme_score || 0, comments: fresh.paradigme_comments || '' },
            },
            interview: {
              interviewDate: fresh.interview_date ? new Date(fresh.interview_date) : undefined,
              physicalMtpAdherence: {
                metier: { score: fresh.interview_metier_score || 0, comments: fresh.interview_metier_comments || '' },
                talent: { score: fresh.interview_talent_score || 0, comments: fresh.interview_talent_comments || '' },
                paradigme: { score: fresh.interview_paradigme_score || 0, comments: fresh.interview_paradigme_comments || '' },
              },
              gapCompetence: { score: fresh.gap_competence_score || 0, comments: fresh.gap_competence_comments || '' },
              generalSummary: fresh.general_summary || ''
            }
          }
        };
        setEvaluationData(mapped);
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(mapped));
          localStorage.setItem(LOCAL_MTIME_KEY, Date.now().toString());
          localStorage.setItem(LOCAL_DIRTY_KEY, '0');
        } catch {
          /* empty */
        }
      } else {
        // À défaut, on écrit ce qu'on vient d'envoyer et on nettoie le dirty
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
          localStorage.setItem(LOCAL_MTIME_KEY, Date.now().toString());
          localStorage.setItem(LOCAL_DIRTY_KEY, '0');
        } catch (e) {
          console.warn('Impossible d\'écrire les détails Protocol 1 en localStorage:', e);
        }
      }
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

  // Mettre à jour les données avec sauvegarde automatique optimisée
  const updateEvaluation = useCallback((updater: (prev: EvaluationData) => EvaluationData) => {
    setEvaluationData(prev => {
      const newData = updater(prev);
      
      console.log('🔄 [UPDATE DEBUG] Données mises à jour:', newData);
      
      const sectionScores = calculateSectionScores(newData.protocol1);
      newData.protocol1.score = sectionScores.totalScore;
      newData.globalScore = sectionScores.totalScore;
      
      // Mettre à jour le statut basé sur les scores
      if (sectionScores.documentaryScore > 0 || sectionScores.mtpScore > 0) {
        newData.protocol1.status = 'in_progress';
      }
      if (sectionScores.totalScore >= 60) {
        newData.protocol1.status = 'completed';
      }
      
      // Annuler la sauvegarde précédente si elle existe
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Écrire immédiatement une copie locale pour ne rien perdre en cas de reload
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(newData));
        localStorage.setItem(LOCAL_MTIME_KEY, Date.now().toString());
        localStorage.setItem(LOCAL_DIRTY_KEY, '1');
      } catch (e) {
        console.warn('Impossible d\'écrire les détails Protocol 1 en localStorage (update):', e);
      }

      // Sauvegarder automatiquement après un délai plus court (1 seconde)
      saveTimeoutRef.current = setTimeout(() => {
        console.log('💾 [SAVE DEBUG] Sauvegarde automatique déclenchée');
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

  // Nettoyer le timeout au démontage
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Sauvegarde forcée juste avant rafraîchissement/fermeture ou tab cachée
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
        // Lancer la sauvegarde sans attendre
        saveEvaluation(evaluationData);
      } catch (e) {
        console.warn('Erreur lors de la persistance immédiate Protocol 1:', e);
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
    calculateSectionScores: () => calculateSectionScores(evaluationData.protocol1),
    isLoading,
    isSaving,
    reload: loadEvaluation
  };
}
