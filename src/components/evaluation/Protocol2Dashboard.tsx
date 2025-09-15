import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle, Clock, AlertCircle, FileText, Users, Target, TrendingUp, Star, Calendar as CalendarLucide } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useOptimizedProtocol2Evaluation } from "@/hooks/useOptimizedProtocol2Evaluation";
import { useInterviewScheduling } from "@/hooks/useInterviewScheduling";

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
    saveSimulationDate
  } = useOptimizedProtocol2Evaluation(applicationId);

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

  // Fonction pour programmer la simulation (sans changer le statut)
  const handleScheduleSimulation = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const simulationDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      // Sauvegarder la date programmée en base de données (protocol2_evaluations)
      await saveSimulationDate(selectedDate, selectedTime);
      
      // Mettre à jour seulement la date de simulation dans applications (garder le statut 'incubation')
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          simulation_date: simulationDateTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour de la date de simulation:', updateError);
        return;
      }

      console.log('✅ Date de simulation mise à jour:', simulationDateTime.toISOString());
      
      // Envoyer un email de confirmation (optionnel)
      try {
        const { data: applicationDetails } = await supabase
          .from('applications')
          .select(`
            users:users!applications_candidate_id_fkey(first_name, last_name, email),
            job_offers:job_offers!applications_job_offer_id_fkey(title)
          `)
          .eq('id', applicationId)
          .single();

        if (applicationDetails?.users && applicationDetails?.job_offers) {
          const candidateName = `${applicationDetails.users.first_name} ${applicationDetails.users.last_name}`;
          const jobTitle = applicationDetails.job_offers.title;
          
          // Envoyer email de simulation programmée
          await supabase.functions.invoke('send-interview-email', {
            body: {
              to: applicationDetails.users.email,
              candidateName,
              jobTitle,
              interviewDate: simulationDateTime.toISOString(),
              interviewType: 'simulation'
            }
          });
        }
      } catch (emailError) {
        console.warn('⚠️ Erreur lors de l\'envoi de l\'email:', emailError);
      }
      
      // Rafraîchir la page pour mettre à jour l'interface
      window.location.reload();
      
      // Réinitialiser la sélection
      setSelectedDate('');
      setSelectedTime('');
      
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
          newData.mise_en_situation[category as keyof typeof newData.mise_en_situation] = { score: 0, comments: '' } as any;
        }
        newData.mise_en_situation[category as keyof typeof newData.mise_en_situation][subCategory] = value;
      } else if (section === 'validation_operationnelle') {
        if (!newData.validation_operationnelle[category as keyof typeof newData.validation_operationnelle]) {
          newData.validation_operationnelle[category as keyof typeof newData.validation_operationnelle] = { score: 0, comments: '' } as any;
        }
        newData.validation_operationnelle[category as keyof typeof newData.validation_operationnelle][subCategory] = value;
      } else if (section === 'analyse_competences') {
        if (!newData.analyse_competences[category as keyof typeof newData.analyse_competences]) {
          newData.analyse_competences[category as keyof typeof newData.analyse_competences] = { score: 0, comments: '', gapLevel: '' } as any;
        }
        newData.analyse_competences[category as keyof typeof newData.analyse_competences][subCategory] = value;
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


  // Calculer les scores directement comme dans le protocole 1
  const scores = calculateSectionScores(evaluationData);

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
                    ? `${new Date(evaluationData.simulation_scheduling.simulation_date).toLocaleDateString('fr-FR')} à ${evaluationData.simulation_scheduling.simulation_time.slice(0, 5)}`
                    : "Aucune date programmée"
                  }
                </span>
              </div>
            </div>
            
            {/* Bouton Programmer la simulation */}
            <div className="flex-shrink-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto text-sm sm:text-base"
                    disabled={isReadOnly}
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
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
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
        </CardContent>
      </Card>

    </div>
  );
});