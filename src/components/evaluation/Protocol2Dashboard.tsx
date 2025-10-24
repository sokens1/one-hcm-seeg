import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle, Clock, AlertCircle, FileText, Users, Target, TrendingUp, Star, Calendar as CalendarLucide, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useOptimizedProtocol2Evaluation } from "@/hooks/useOptimizedProtocol2Evaluation";
import { useInterviewScheduling } from "@/hooks/useInterviewScheduling";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ResetAnnotationsModal } from '@/components/ui/ResetAnnotationsModal';
import { supabase } from '@/integrations/supabase/client';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = React.memo(({ value, onChange, label, disabled = false }) => {
  const handleStarClick = useCallback((starValue: number) => {
    if (disabled) return;
    
    // Empêcher les clics involontaires en vérifiant si c'est un clic intentionnel
    // console.log('⭐ [STAR DEBUG] Clic sur étoile:', starValue, 'pour', label);
    
    onChange(starValue);
  }, [disabled, onChange]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleStarClick(star);
            }}
            onMouseDown={(e) => e.preventDefault()} // Empêcher le focus involontaire
            className={cn(
              "transition-colors hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm p-1",
              disabled && "cursor-not-allowed"
            )}
            disabled={disabled}
            aria-label={`Noter ${star} étoile${star > 1 ? 's' : ''} pour ${label}`}
          >
            <Star
              className={cn(
                "w-5 h-5",
                star <= value
                  ? disabled ? "fill-yellow-200 text-yellow-200" : "fill-yellow-400 text-yellow-400"
                  : disabled ? "text-gray-200" : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{value}/5</span>
    </div>
  );
});

// Composant mémorisé pour les textareas
const MemoizedTextarea = React.memo(({ 
  placeholder, 
  value, 
  onChange, 
  className, 
  readOnly 
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className: string;
  readOnly: boolean;
}) => (
  <Textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={className}
    readOnly={readOnly}
  />
));

interface Protocol2DashboardProps {
  candidateName: string;
  jobTitle: string;
  applicationId: string;
  onStatusChange: (status: 'embauche' | 'refuse') => void;
  isReadOnly?: boolean;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-blue-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-100 text-green-800 border border-green-200">Terminé</Badge>;
    case 'in_progress':
      return <Badge variant="default" className="bg-blue-100 text-blue-800 border border-blue-200 font-medium">En cours</Badge>;
    default:
      return <Badge variant="default" className="bg-blue-500 text-white">En attente</Badge>;
  }
};

const translateStatus = (status: string) => {
  switch (status) {
    case 'candidature':
      return 'Candidature';
    case 'incubation':
      return 'Incubation';
    case 'embauche':
      return 'Embauche';
    case 'refuse':
      return 'Refusé';
    case 'completed':
      return 'Terminé';
    case 'in_progress':
      return 'En cours';
    default:
      return status;
  }
};

export const Protocol2Dashboard = React.memo(function Protocol2Dashboard({ candidateName, jobTitle, applicationId, onStatusChange, isReadOnly = false }: Protocol2DashboardProps) {
  
  const {
    evaluationData,
    updateEvaluation,
    calculateSectionScores,
    isLoading,
    isSaving,
    reload,
    saveSimulationDate,
    resetEvaluation
  } = useOptimizedProtocol2Evaluation(applicationId);

  const { toast } = useToast();

  // Hook pour la programmation de simulation (même fonctionnalité que l'entretien)
  const {
    schedules,
    isLoading: isSchedulingLoading,
    isSaving: isSchedulingSaving,
    timeSlots,
    scheduleInterview,
    cancelInterview,
    isSlotBusy,
    isDateFullyBooked,
    getAvailableSlots,
    generateCalendar
  } = useInterviewScheduling(applicationId);

  // États pour la programmation de simulation
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSimulationPopoverOpen, setIsSimulationPopoverOpen] = useState(false);
  
  // État pour le modal de réinitialisation
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Fonction pour programmer la simulation (sans changer le statut)
  const handleScheduleSimulation = useCallback(async () => {
    if (!selectedDate || !selectedTime) {
      console.log('❌ Date ou heure manquante:', { selectedDate, selectedTime });
      return;
    }
    
    console.log('🚀 Début de la programmation de simulation:', { selectedDate, selectedTime, applicationId });
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      // Créer la date en heure locale pour éviter les décalages de timezone
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const simulationDateTime = new Date(year, month - 1, day, hours, minutes);
      
      console.log('📅 Date de simulation créée (locale):', simulationDateTime.toISOString());
      console.log('📅 Date de simulation créée (locale string):', simulationDateTime.toLocaleString('fr-FR'));
      
      // Sauvegarder la date programmée en base de données (protocol2_evaluations)
      console.log('💾 Sauvegarde dans protocol2_evaluations...');
      const saveResult = await saveSimulationDate(selectedDate, selectedTime);
      console.log('✅ Résultat de la sauvegarde:', saveResult);
      
      // Mettre à jour seulement la date de simulation dans applications (garder le statut 'incubation')
      console.log('🔄 Mise à jour de la table applications...');
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          simulation_date: `${selectedDate}T${selectedTime}:00`, // Stocker en format string local
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour de la date de simulation:', updateError);
        return;
      }
      
      console.log('✅ Table applications mise à jour avec succès');

      console.log('✅ Date de simulation mise à jour:', simulationDateTime.toISOString());
      
      // Afficher un message de succès avec toast
      toast({
        title: "Simulation programmée avec succès !",
        description: `Simulation programmée pour le ${format(simulationDateTime, "EEEE dd MMMM yyyy", { locale: fr })} à ${selectedTime.slice(0, 5)}`,
        variant: "default"
      });
      
      // Envoyer une notification au candidat (remplace l'email)
      try {
        console.log('🔔 [NOTIFICATION] Début de l\'envoi de notification de simulation');
        const { data: applicationDetails } = await supabase
          .from('applications')
          .select(`
            candidate_id,
            users:users!applications_candidate_id_fkey(id, first_name, last_name, email),
            job_offers:job_offers!applications_job_offer_id_fkey(title)
          `)
          .eq('id', applicationId)
          .single();

        console.log('🔔 [NOTIFICATION] Détails de l\'application récupérés:', applicationDetails);

        if (applicationDetails?.users && applicationDetails?.job_offers) {
          const user = Array.isArray(applicationDetails.users) ? applicationDetails.users[0] : applicationDetails.users;
          const jobOffer = Array.isArray(applicationDetails.job_offers) ? applicationDetails.job_offers[0] : applicationDetails.job_offers;
          
          if (user && jobOffer) {
            const candidateName = `${user.first_name} ${user.last_name}`;
            const jobTitle = jobOffer.title;
            const candidateId = user.id || applicationDetails.candidate_id;
            
            console.log('🔔 [NOTIFICATION] IDs récupérés:', {
              user_id: user.id,
              candidate_id: applicationDetails.candidate_id,
              final_candidate_id: candidateId
            });
            
            if (!candidateId) {
              throw new Error('ID candidat non trouvé');
            }
            
            // Créer une notification pour le candidat
            const notificationData = {
              user_id: candidateId,
              title: 'Simulation programmée',
              message: `Votre simulation pour le poste de ${jobTitle} a été programmée pour le ${format(simulationDateTime, "EEEE dd MMMM yyyy", { locale: fr })} à ${selectedTime.slice(0, 5)}.`,
              type: 'simulation_scheduled',
              read: false
            };
            
            console.log('🔔 [NOTIFICATION] Données pour la notification:', notificationData);
            
            // Insérer la notification via la fonction Supabase (version avec 5 paramètres)
            const { error: notificationError } = await supabase
              .rpc('create_notification', {
                p_user_id: candidateId,
                p_title: notificationData.title,
                p_message: notificationData.message,
                p_type: 'info',
                p_link: null
              });

            if (notificationError) {
              console.error('❌ Erreur création notification:', notificationError);
              throw new Error(`Erreur création notification: ${notificationError.message || 'Erreur inconnue'}`);
            }

            console.log('✅ Notification créée avec succès');
          }
        }
      } catch (notificationError) {
        console.error('❌ Erreur lors de la création de la notification:', notificationError);
        // Afficher une alerte à l'utilisateur mais ne pas faire échouer la programmation
        alert(`Erreur lors de la création de la notification: ${notificationError.message || 'Erreur inconnue'}`);
        // Ne pas relancer l'erreur pour éviter d'interrompre la programmation
      }
      
      // Ne plus rafraîchir automatiquement la page pour garder les logs
      // window.location.reload();
      
      // Réinitialiser la sélection
      setSelectedDate('');
      setSelectedTime('');
      setIsSimulationPopoverOpen(false);
      
    } catch (error) {
      console.error('❌ Erreur lors de la programmation de la simulation:', error);
    }
  }, [selectedDate, selectedTime, saveSimulationDate, applicationId]);

  const handleDecision = (decision: 'embauche' | 'refuse') => {
    onStatusChange(decision);
  };

  // Fonction de mise à jour exactement comme dans le protocole 1 avec useCallback
  const updateProtocol2 = useCallback((section: string, field: string, value: string | number) => {
    updateEvaluation(prev => {
      const newData = { ...prev };
      const [category, subCategory] = field.split('.');

        if (section === 'mise_en_situation') {
          if (!newData.mise_en_situation[category as keyof typeof newData.mise_en_situation]) {
            newData.mise_en_situation[category as keyof typeof newData.mise_en_situation] = { score: 0, comments: '' };
          }
          (newData.mise_en_situation[category as keyof typeof newData.mise_en_situation] as { score: number; comments: string })[subCategory] = value;
        } else if (section === 'validation_operationnelle') {
          if (!newData.validation_operationnelle[category as keyof typeof newData.validation_operationnelle]) {
            newData.validation_operationnelle[category as keyof typeof newData.validation_operationnelle] = { score: 0, comments: '' };
          }
          (newData.validation_operationnelle[category as keyof typeof newData.validation_operationnelle] as { score: number; comments: string })[subCategory] = value;
        } else if (section === 'analyse_competences') {
          if (!newData.analyse_competences[category as keyof typeof newData.analyse_competences]) {
            newData.analyse_competences[category as keyof typeof newData.analyse_competences] = { score: 0, comments: '', gapLevel: '' };
          }
          (newData.analyse_competences[category as keyof typeof newData.analyse_competences] as { score: number; comments: string; gapLevel: string })[subCategory] = value;
        }

      // Mettre à jour le statut basé sur les scores
      const hasScores = newData.mise_en_situation.jeu_de_role.score > 0 || 
                       newData.mise_en_situation.jeu_codir.score > 0 ||
                       newData.validation_operationnelle.fiche_kpis.score > 0 ||
                       newData.analyse_competences.gap_competences.score > 0 ||
                       newData.analyse_competences.plan_formation.score > 0;
      
      if (hasScores && newData.status === 'pending') {
        newData.status = 'in_progress';
      }

      return newData;
    });
  }, [updateEvaluation]);

  // Fonction pour réinitialiser les annotations
  const handleResetAnnotations = useCallback(async (resetStatus: boolean) => {
    console.log('🔄 [RESET] Début de la réinitialisation - resetStatus:', resetStatus);
    try {
      // Récupérer le statut actuel avant la réinitialisation
      const { data: currentApp, error: fetchError } = await supabase
        .from('applications')
        .select('status')
        .eq('id', applicationId)
        .single();

      if (fetchError) {
        console.error('❌ Erreur lors de la récupération du statut actuel:', fetchError);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer le statut actuel.",
          variant: 'destructive'
        });
        return;
      }

      const currentStatus = currentApp?.status;
      console.log('📊 [RESET] Statut actuel récupéré:', currentStatus);

      // Déterminer le statut précédent basé sur le statut actuel
      let previousStatus: string;
      
      if (currentStatus === 'refuse') {
        // Pour un candidat refusé, récupérer le statut qu'il avait avant d'être refusé
        console.log('🔍 [RESET] Candidat refusé, récupération du statut précédent...');
        try {
          const { data: historyData, error: historyError } = await supabase
            .from('application_status_history')
            .select('previous_status')
            .eq('application_id', applicationId)
            .eq('new_status', 'refuse')
            .order('changed_at', { ascending: false })
            .limit(1)
            .single();

          if (historyError) {
            console.warn('⚠️ [RESET] Impossible de récupérer l\'historique, utilisation du statut par défaut:', historyError);
            previousStatus = 'incubation'; // Fallback par défaut
          } else {
            previousStatus = historyData?.previous_status || 'incubation';
            console.log('📊 [RESET] Statut précédent trouvé dans l\'historique:', previousStatus);
          }
        } catch (e) {
          console.warn('⚠️ [RESET] Erreur lors de la récupération de l\'historique:', e);
          previousStatus = 'incubation'; // Fallback par défaut
        }
      } else {
        // Logique normale pour les autres statuts
        switch (currentStatus) {
          case 'embauche':
            previousStatus = 'incubation';
            break;
          case 'incubation':
            previousStatus = 'candidature';
            break;
          case 'candidature':
            previousStatus = 'candidature'; // Reste en candidature
            break;
          default:
            previousStatus = 'candidature';
        }
      }

      console.log('🔄 [RESET] Statut précédent déterminé:', previousStatus);

      // Réinitialiser les données d'évaluation
      const resetData = {
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
        },
        simulation_scheduling: {
          simulation_date: null,
          simulation_time: null,
          simulation_scheduled_at: null
        }
      };

      // Si on doit aussi réinitialiser le statut, remettre le candidat au statut précédent
      if (resetStatus) {
        console.log(`🔄 [RESET] Tentative de réinitialisation du statut vers "${previousStatus}"`);
        
        // Mettre à jour le statut de la candidature en BD
        const { data: updateData, error: statusError } = await supabase
          .from('applications')
          .update({
            status: previousStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId)
          .select('id, status');

        console.log('📊 [RESET] Résultat de la mise à jour du statut:', { updateData, statusError });

        if (statusError) {
          console.error('❌ Erreur BD lors de la réinitialisation du statut:', statusError);
          toast({
            title: "Erreur",
            description: "Impossible de réinitialiser le statut. Réessayez.",
            variant: 'destructive'
          });
          return;
        }

        if (!updateData || updateData.length === 0) {
          console.error('❌ Aucune donnée retournée lors de la mise à jour du statut');
          toast({
            title: "Erreur",
            description: "Aucune candidature trouvée pour la mise à jour.",
            variant: 'destructive'
          });
          return;
        }

        console.log('✅ [RESET] Statut mis à jour avec succès:', updateData[0]);
        
        // Si on revient au statut "incubation", réinitialiser aussi les annotations du Protocole 1
        if (previousStatus === 'incubation') {
          console.log('🔄 [RESET] Retour au statut incubation - réinitialisation du Protocole 1');
          try {
            const protocol1ResetData = {
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

            // Réinitialiser le Protocole 1 en base
            const { error: protocol1Error } = await supabase
              .from('protocol1_evaluations')
              .update({
                cv_score: 0,
                cv_comments: '',
                lettre_motivation_score: 0,
                lettre_motivation_comments: '',
                diplomes_certificats_score: 0,
                diplomes_certificats_comments: '',
                metier_score: 0,
                metier_comments: '',
                talent_score: 0,
                talent_comments: '',
                paradigme_score: 0,
                paradigme_comments: '',
                interview_metier_score: 0,
                interview_metier_comments: '',
                interview_talent_score: 0,
                interview_talent_comments: '',
                interview_paradigme_score: 0,
                interview_paradigme_comments: '',
                gap_competence_score: 0,
                gap_competence_comments: '',
                general_summary: '',
                overall_score: 0,
                status: 'pending',
                completed: false,
                updated_at: new Date().toISOString()
              })
              .eq('application_id', applicationId);

            if (protocol1Error) {
              console.warn('⚠️ [RESET] Erreur lors de la réinitialisation du Protocole 1:', protocol1Error);
            } else {
              console.log('✅ [RESET] Protocole 1 réinitialisé avec succès');
              
              // Forcer le rechargement du Protocole 1 en émettant un événement personnalisé
              console.log('🔄 [RESET] Émission d\'événement pour recharger le Protocole 1');
              window.dispatchEvent(new CustomEvent('protocol1Reset', { 
                detail: { applicationId, resetData: protocol1ResetData } 
              }));
            }
          } catch (e) {
            console.warn('⚠️ [RESET] Erreur lors de la réinitialisation du Protocole 1:', e);
          }
        }
        
        // Propager le changement de statut au parent
        console.log(`🔄 [RESET] Appel de onStatusChange avec "${previousStatus}"`);
        onStatusChange(previousStatus as any);
      }

      // Utiliser la fonction resetEvaluation qui force l'écrasement
      console.log('🔄 [RESET] Utilisation de resetEvaluation avec forceOverwrite=true');
      console.log('📊 [RESET] Données de réinitialisation:', resetData);
      
      await resetEvaluation(resetData);
      
      console.log('✅ [RESET] Réinitialisation forcée terminée');

      // Notification de succès
      const message = resetStatus 
        ? `Annotations et statut réinitialisés. Le candidat est de nouveau en statut "${previousStatus}".`
        : "Annotations réinitialisées. Le statut du candidat reste inchangé.";
      
      toast({
        title: "Réinitialisation réussie",
        description: message,
        duration: 4000
      });

    } catch (e) {
      console.error('❌ Exception lors de la réinitialisation:', e);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation.",
        variant: 'destructive'
      });
    }
  }, [applicationId, onStatusChange, updateEvaluation, toast]);

  // Calculer les scores avec useMemo pour éviter les recalculs inutiles
  const scores = useMemo(() => calculateSectionScores(evaluationData), [evaluationData, calculateSectionScores]);

  // Écouter les événements de réinitialisation du Protocole 1
  React.useEffect(() => {
    const handleProtocol1Reset = (event: CustomEvent) => {
      const { applicationId: resetApplicationId, resetData } = event.detail;
      if (resetApplicationId === applicationId) {
        console.log('🔄 [PROTOCOL2] Réception de l\'événement protocol1Reset, rechargement des données');
        // Forcer le rechargement des données
        reload();
      }
    };

    window.addEventListener('protocol1Reset', handleProtocol1Reset as EventListener);
    
    return () => {
      window.removeEventListener('protocol1Reset', handleProtocol1Reset as EventListener);
    };
  }, [applicationId, reload]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground">Chargement de l'évaluation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicateur de sauvegarde (copié du protocole 1) */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Sauvegarde...</span>
        </div>
      )}

      {/* En-tête du Protocole 2 */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Synthèse de l'Évaluation
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                <span className="block sm:inline">Candidat: {candidateName}</span>
                <span className="hidden sm:inline"> • </span>
                <span className="block sm:inline">Poste: {jobTitle}</span>
              </p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-primary">{scores.global.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Score Global</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de progression globale */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-600">Progression de l'évaluation</span>
            </div>
            <Progress 
              value={scores.global} 
              className="h-3 bg-gray-200"
              style={{
                '--progress-foreground': 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
              } as React.CSSProperties}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="text-sm text-muted-foreground">Poids :</div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Situation</div>
                <div className="font-semibold text-sm text-gray-600">50%</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Performance</div>
                <div className="font-semibold text-sm text-gray-600">20%</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Compétence</div>
                <div className="font-semibold text-sm text-gray-600">30%</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Statut Actuel:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {translateStatus(evaluationData.status)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Mise en Situation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.status)}
              Simulation 
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white font-semibold">
                {scores.situation.toFixed(1)}%
              </Badge>
              {getStatusBadge(evaluationData.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Section Programmation de la simulation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Champ Date de la simulation */}
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Date de la simulation
              </Label>
              <div className="flex items-center gap-2">
                <CalendarLucide className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {evaluationData.simulation_scheduling.simulation_date && evaluationData.simulation_scheduling.simulation_time
                    ? `${format(evaluationData.simulation_scheduling.simulation_date, "EEEE dd MMMM yyyy", { locale: fr })} à ${evaluationData.simulation_scheduling.simulation_time.slice(0, 5)}`
                    : "Aucune date programmée"
                  }
                </span>
              </div>
            </div>
            
            {/* Bouton Programmer la simulation */}
            <div className="flex-shrink-0">
              <Popover open={isSimulationPopoverOpen} onOpenChange={setIsSimulationPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto text-sm sm:text-base"
                    disabled={isReadOnly}
                    onClick={() => {
                      console.log('🔘 Bouton "Programmer la simulation" cliqué');
                      setIsSimulationPopoverOpen(true);
                    }}
                  >
                    <CalendarLucide className="w-4 h-4 sm:w-5 sm:h-5" />
                    Programmer la simulation
                  </Button>
                </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="center">
                <div className="p-4 space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">Programmer la simulation</h4>
                    <p className="text-sm text-muted-foreground">Choisissez une date disponible</p>
                  </div>
                  
                  {/* Calendrier personnalisé */}
                  <div className="space-y-3">
                    {(() => {
                      const calendar = generateCalendar();
                      const weeks = [];
                      for (let i = 0; i < calendar.days.length; i += 7) {
                        weeks.push(calendar.days.slice(i, i + 7));
                      }
                      return weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 gap-1">
                          {week.map((day, dayIndex) => {
                            const today = new Date();
                            const isToday = day.toDateString() === today.toDateString();
                            const isPast = day < today;
                            const dateString = day.toISOString().split('T')[0];
                            const isFullyBooked = isDateFullyBooked(dateString);
                            const isAvailable = !isPast && !isFullyBooked;
                            
                            return (
                              <button
                                key={dayIndex}
                                onClick={() => isAvailable && setSelectedDate(dateString)}
                                disabled={!isAvailable}
                                className={cn(
                                  "w-8 h-8 text-xs rounded-md transition-colors",
                                  isToday && "bg-blue-100 text-blue-700 font-semibold",
                                  isPast && "text-gray-400 cursor-not-allowed",
                                  isFullyBooked && "bg-red-100 text-red-500 cursor-not-allowed",
                                  isAvailable && "hover:bg-blue-50 text-gray-700",
                                  selectedDate === dateString && "bg-blue-500 text-white"
                                )}
                              >
                                {day.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Créneaux horaires */}
                  {selectedDate && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm">Créneaux disponibles</h5>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => {
                          const isBusy = isSlotBusy(selectedDate, time);
                          return (
                            <button
                              key={time}
                              onClick={() => !isBusy && setSelectedTime(time)}
                              disabled={isBusy}
                              className={cn(
                                "p-2 text-sm rounded-md border transition-colors",
                                selectedTime === time
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : isBusy
                                  ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
                                  : "bg-white hover:bg-blue-50 border-gray-300"
                              )}
                            >
                              {time.slice(0, 5)}
                              {isBusy && " ✕"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleScheduleSimulation}
                      disabled={!selectedDate || !selectedTime || isSchedulingSaving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isSchedulingSaving ? 'Programmation...' : 'Programmer'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDate('');
                        setSelectedTime('');
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <StarRating
                value={evaluationData.mise_en_situation.jeu_de_role.score}
                onChange={(value) => !isReadOnly && updateProtocol2('mise_en_situation', 'jeu_de_role.score', value)}
                label="Jeu de rôle fonctionnel"
                disabled={isReadOnly}
              />
              <MemoizedTextarea
                placeholder="Commentaires sur le jeu de rôle..."
                value={evaluationData.mise_en_situation.jeu_de_role.comments}
                onChange={(e) => !isReadOnly && updateProtocol2('mise_en_situation', 'jeu_de_role.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-3">
              <StarRating
                value={evaluationData.mise_en_situation.jeu_codir.score}
                onChange={(value) => !isReadOnly && updateProtocol2('mise_en_situation', 'jeu_codir.score', value)}
                label="Jeu de rôle CODIR"
                disabled={isReadOnly}
              />
              <MemoizedTextarea
                placeholder="Commentaires sur le jeu de rôle CODIR..."
                value={evaluationData.mise_en_situation.jeu_codir.comments}
                onChange={(e) => !isReadOnly && updateProtocol2('mise_en_situation', 'jeu_codir.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Opérationnelle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.status)}
              Performance
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white font-semibold">
                {scores.performance.toFixed(1)}%
              </Badge>
              {getStatusBadge(evaluationData.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-3">
              <StarRating
                value={evaluationData.validation_operationnelle.fiche_kpis.score}
                onChange={(value) => !isReadOnly && updateProtocol2('validation_operationnelle', 'fiche_kpis.score', value)}
                label="Key Performance Indicators (KPI's)"
                disabled={isReadOnly}
              />
              <MemoizedTextarea
                placeholder="Commentaires sur les KPI's..."
                value={evaluationData.validation_operationnelle.fiche_kpis.comments}
                onChange={(e) => !isReadOnly && updateProtocol2('validation_operationnelle', 'fiche_kpis.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-3">
              <StarRating
                value={evaluationData.validation_operationnelle.fiche_kris?.score || 0}
                onChange={(value) => !isReadOnly && updateProtocol2('validation_operationnelle', 'fiche_kris.score', value)}
                label="Key Risque Indicators (KRI's)"
                disabled={isReadOnly}
              />
              <MemoizedTextarea
                placeholder="Commentaires sur les KRI's..."
                value={evaluationData.validation_operationnelle.fiche_kris?.comments || ''}
                onChange={(e) => !isReadOnly && updateProtocol2('validation_operationnelle', 'fiche_kris.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-3">
              <StarRating
                value={evaluationData.validation_operationnelle.fiche_kcis?.score || 0}
                onChange={(value) => !isReadOnly && updateProtocol2('validation_operationnelle', 'fiche_kcis.score', value)}
                label="Key Control Indicators (KCI's)"
                disabled={isReadOnly}
              />
              <MemoizedTextarea
                placeholder="Commentaires sur les KCI's..."
                value={evaluationData.validation_operationnelle.fiche_kcis?.comments || ''}
                onChange={(e) => !isReadOnly && updateProtocol2('validation_operationnelle', 'fiche_kcis.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyse des Compétences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.status)}
              Compétence
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white font-semibold">
                {scores.competence.toFixed(1)}%
              </Badge>
              {getStatusBadge(evaluationData.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <StarRating
                value={evaluationData.analyse_competences.gap_competences.score}
                onChange={(value) => !isReadOnly && updateProtocol2('analyse_competences', 'gap_competences.score', value)}
                label="Gap de compétences"
                disabled={isReadOnly}
              />
              <MemoizedTextarea
                placeholder="Commentaires sur l'analyse des compétences..."
                value={evaluationData.analyse_competences.gap_competences.comments}
                onChange={(e) => !isReadOnly && updateProtocol2('analyse_competences', 'gap_competences.comments', e.target.value)}
                className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                readOnly={isReadOnly}
              />
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Formation requise et Justification</h5>
                <MemoizedTextarea
                  placeholder="Commentaires sur la formation requise et justification..."
                  value={evaluationData.analyse_competences.plan_formation.comments}
                  onChange={(e) => !isReadOnly && updateProtocol2('analyse_competences', 'plan_formation.comments', e.target.value)}
                  className={cn("min-h-[120px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Décision Finale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Décision Finale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResetModalOpen(true)}
                  className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={() => !isReadOnly && handleDecision('refuse')}
                className={cn("text-red-600 border-red-300 hover:bg-red-50 w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3", isReadOnly ? "opacity-50 cursor-not-allowed" : "")}
                disabled={isReadOnly}
              >
                <AlertCircle className="w-4 h-4" />
                Refuser
              </Button>
              <Button 
                onClick={() => !isReadOnly && handleDecision('embauche')}
                className={cn("bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3", isReadOnly ? "opacity-50 cursor-not-allowed" : "")}
                disabled={isReadOnly}
              >
                <CheckCircle className="w-4 h-4" />
                Engager
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de réinitialisation des annotations */}
      <ResetAnnotationsModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetAnnotations}
        protocolName="Protocole 2"
        candidateName={candidateName}
      />

    </div>
  );
});