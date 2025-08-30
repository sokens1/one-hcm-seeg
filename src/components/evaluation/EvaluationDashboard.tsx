/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Star, Users, CheckCircle, Clock, AlertCircle, FileText, User, Calendar as CalendarLucide } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useProtocol1Evaluation } from "@/hooks/useProtocol1Evaluation";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";



interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, label, disabled = false }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onChange(star)}
            className="transition-colors hover:scale-110"
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
};

interface EvaluationDashboardProps {
  candidateName: string;
  jobTitle: string;
  applicationId: string;
  onStatusChange: (status: 'incubation' | 'embauche' | 'refuse') => void;
  isReadOnly?: boolean;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  candidateName,
  jobTitle,
  applicationId,
  onStatusChange,
  isReadOnly = false
}) => {
  const { 
    evaluationData, 
    updateEvaluation, 
    calculateSectionScores, 
    isLoading, 
    isSaving 
  } = useProtocol1Evaluation(applicationId);
  
  const { toast } = useToast();
  
  // Fonction pour gérer le clic sur le bouton "Traitement IA"
  const handleAITreatment = () => {
    toast({
      title: "Traitement IA",
      description: "Cette fonctionnalité sera disponible à partir du 01/09/2025",
      duration: 3000,
    });
  };
  
  // Fonction pour gérer l'incubation
  const handleIncubate = () => {
    onStatusChange('incubation');
    toast({
      title: "Candidat incubé",
      description: "Le candidat a été incubé et peut maintenant passer au protocole 2",
      duration: 3000,
    });
  };
  
  // Fonction pour gérer le refus
  const handleRefuse = () => {
    onStatusChange('refuse');
    toast({
      title: "Candidat refusé",
      description: "Le candidat a été refusé et sera redirigé vers la synthèse",
      duration: 3000,
    });
  };
  
  const [interviewDate, setInterviewDate] = useState<Date | undefined>(evaluationData.protocol1.interview.interviewDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Fonctions pour naviguer entre les mois
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  // Données des entretiens occupés (exemple - à remplacer par des vraies données)
  const busySlots = {
    '2024-01-15': ['09:00', '10:30', '14:00'], // 15 janvier 2024
    '2024-01-16': ['09:30', '11:00', '15:00'], // 16 janvier 2024
    '2024-01-22': ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], // 22 janvier - jour complet
    '2024-01-28': ['14:00', '15:30'], // 28 janvier 2024
  };
  
  // Créneaux horaires disponibles (plages de 1h)
  const timeSlots = [
    '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00'
  ];
  
  // Fonction pour générer le calendrier du mois
  const generateCalendar = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { days, month, year };
  };
  
  // Fonction pour obtenir la clé de date au format YYYY-MM-DD
  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Fonction pour vérifier si une date est complètement occupée
  const isDateFullyBooked = (date: Date) => {
    const dateKey = getDateKey(date);
    const busySlotsForDate = busySlots[dateKey] || [];
    return busySlotsForDate.length >= timeSlots.length;
  };
  

  
  // Fonction pour vérifier si une date est sélectionnée
  const isDateSelected = (date: Date) => {
    return interviewDate && interviewDate.toDateString() === date.toDateString();
  };
  
  // Fonction pour obtenir les créneaux disponibles pour une date
  const getAvailableSlots = (date: Date) => {
    const dateKey = getDateKey(date);
    const busySlotsForDate = busySlots[dateKey] || [];
    return timeSlots.filter(slot => !busySlotsForDate.includes(slot));
  };
  
  // Fonction pour vérifier si un créneau est occupé
  const isTimeSlotBusy = (date: Date, timeSlot: string) => {
    const dateKey = getDateKey(date);
    const busySlotsForDate = busySlots[dateKey] || [];
    return busySlotsForDate.includes(timeSlot);
  };



  const updateProtocol1 = (section: string, field: string, value: any) => {
    updateEvaluation(prev => {
      const newData = { ...prev };
      const newProtocol1 = { ...newData.protocol1 };
      
      // Mise à jour des données selon la section
      if (section === 'documentaryEvaluation') {
        const [docType, property] = field.split('.');
        newProtocol1.documentaryEvaluation = {
          ...newProtocol1.documentaryEvaluation,
          [docType]: {
            ...newProtocol1.documentaryEvaluation[docType as keyof typeof newProtocol1.documentaryEvaluation],
            [property]: value
          }
        };
      } else if (section === 'mtpAdherence') {
        const [mtpField, property] = field.split('.');
        newProtocol1.mtpAdherence = {
          ...newProtocol1.mtpAdherence,
          [mtpField]: {
            ...newProtocol1.mtpAdherence[mtpField as keyof typeof newProtocol1.mtpAdherence],
            [property]: value
          }
        };
      } else if (section === 'interview') {
        if (field.startsWith('physicalMtpAdherence.')) {
          const [_, mtpField, property] = field.split('.');
          newProtocol1.interview.physicalMtpAdherence = {
            ...newProtocol1.interview.physicalMtpAdherence,
            [mtpField]: {
              ...newProtocol1.interview.physicalMtpAdherence[mtpField as keyof typeof newProtocol1.interview.physicalMtpAdherence],
              [property]: value
            }
          };
        } else if (field.startsWith('gapCompetence.')) {
          const [_, property] = field.split('.');
          newProtocol1.interview.gapCompetence = {
            ...newProtocol1.interview.gapCompetence,
            [property]: value
          };
        } else {
          newProtocol1.interview = {
            ...newProtocol1.interview,
            [field]: value
          };
        }
      }
      
      newData.protocol1 = newProtocol1;
      return newData;
    });
  };



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
        return <Badge variant="default" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">En cours</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Chargement de l'évaluation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicateur de sauvegarde */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Sauvegarde...</span>
        </div>
      )}
      
      {/* Header - Synthèse de l'Évaluation */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Synthèse de l'Évaluation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Candidat: {candidateName} • Poste: {jobTitle}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{evaluationData.globalScore === 0 ? '0' : evaluationData.globalScore.toFixed(1)}%</div>
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
              value={evaluationData.globalScore} 
              className="h-3 bg-gray-200"
              style={{
                '--progress-foreground': 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
              } as React.CSSProperties}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Pondération :</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Validation Prérequis</div>
                <div className="font-semibold text-sm text-blue-600">{calculateSectionScores().documentaryScore.toFixed(1)}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Évaluation MTP</div>
                <div className="font-semibold text-sm text-green-600">{calculateSectionScores().mtpScore.toFixed(1)}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Entretien</div>
                <div className="font-semibold text-sm text-purple-600">{calculateSectionScores().interviewScore.toFixed(1)}%</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Statut Actuel:</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {evaluationData.status}
            </Badge>
          </div>

        </CardContent>
      </Card>

      {/* Protocole 1 - Validation et Entretien */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.protocol1.status)}
              Evaluation
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(evaluationData.protocol1.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Validation des Prérequis */}
          <div className="border rounded-lg p-4 bg-gray-50 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-white font-semibold">
                {calculateSectionScores().documentaryScore.toFixed(1)}%
              </Badge>
            </div>
            <h4 className="font-semibold mb-4 flex items-center gap-2 pr-16">
              <FileText className="w-4 h-4" />
              Validation des Prérequis
            </h4>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.documentaryEvaluation.cv.score}
                    onChange={(value) => !isReadOnly && updateProtocol1('documentaryEvaluation', 'cv.score', value)}
                    label="CV"
                    disabled={isReadOnly}
                  />
                  <Textarea
                    placeholder="Commentaires sur le CV..."
                    value={evaluationData.protocol1.documentaryEvaluation.cv.comments}
                    onChange={(e) => !isReadOnly && updateProtocol1('documentaryEvaluation', 'cv.comments', e.target.value)}
                    className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                    readOnly={isReadOnly}
                  />
                </div>
                
                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.documentaryEvaluation.lettreMotivation.score}
                    onChange={(value) => !isReadOnly && updateProtocol1('documentaryEvaluation', 'lettreMotivation.score', value)}
                    label="Lettre de motivation"
                    disabled={isReadOnly}
                  />
                  <Textarea
                    placeholder="Commentaires sur la lettre de motivation..."
                    value={evaluationData.protocol1.documentaryEvaluation.lettreMotivation.comments}
                    onChange={(e) => !isReadOnly && updateProtocol1('documentaryEvaluation', 'lettreMotivation.comments', e.target.value)}
                    className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                    readOnly={isReadOnly}
                  />
                </div>

                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.documentaryEvaluation.diplomesEtCertificats.score}
                    onChange={(value) => !isReadOnly && updateProtocol1('documentaryEvaluation', 'diplomesEtCertificats.score', value)}
                    label="Diplômes & Certificats"
                    disabled={isReadOnly}
                  />
                  <Textarea
                    placeholder="Commentaires sur les diplômes et certificats..."
                    value={evaluationData.protocol1.documentaryEvaluation.diplomesEtCertificats.comments}
                    onChange={(e) => !isReadOnly && updateProtocol1('documentaryEvaluation', 'diplomesEtCertificats.comments', e.target.value)}
                    className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Évaluation MTP - Taux d'adhérence MTP */}
          <div className="border rounded-lg p-4 bg-blue-50 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-white font-semibold">
                {calculateSectionScores().mtpScore.toFixed(1)}%
              </Badge>
            </div>
            <h4 className="font-semibold mb-4 flex items-center gap-2 pr-16">
              <Users className="w-4 h-4" />
              Évaluation MTP
            </h4>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.mtpAdherence.metier.score}
                    onChange={(value) => !isReadOnly && updateProtocol1('mtpAdherence', 'metier.score', value)}
                    label="Métier"
                    disabled={isReadOnly}
                  />
                  <Textarea
                    placeholder="Commentaires métier..."
                    value={evaluationData.protocol1.mtpAdherence.metier.comments}
                    onChange={(e) => !isReadOnly && updateProtocol1('mtpAdherence', 'metier.comments', e.target.value)}
                    className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                    readOnly={isReadOnly}
                  />
                </div>
                
                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.mtpAdherence.talent.score}
                    onChange={(value) => !isReadOnly && updateProtocol1('mtpAdherence', 'talent.score', value)}
                    label="Talent"
                    disabled={isReadOnly}
                  />
                  <Textarea
                    placeholder="Commentaires talent..."
                    value={evaluationData.protocol1.mtpAdherence.talent.comments}
                    onChange={(e) => !isReadOnly && updateProtocol1('mtpAdherence', 'talent.comments', e.target.value)}
                    className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                    readOnly={isReadOnly}
                  />
                </div>

                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.mtpAdherence.paradigme.score}
                    onChange={(value) => !isReadOnly && updateProtocol1('mtpAdherence', 'paradigme.score', value)}
                    label="Paradigme"
                    disabled={isReadOnly}
                  />
                  <Textarea
                    placeholder="Commentaires paradigme..."
                    value={evaluationData.protocol1.mtpAdherence.paradigme.comments}
                    onChange={(e) => !isReadOnly && updateProtocol1('mtpAdherence', 'paradigme.comments', e.target.value)}
                    className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
              
              {/* Boutons Traitement IA et Programmer l'entretien */}
              <div className="flex justify-end pt-4 border-t border-blue-200 gap-3">
                <Button 
                  size="lg"
                  onClick={handleAITreatment}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg shadow-lg flex items-center gap-3"
                  disabled={isReadOnly}
                >
                  <Users className="w-5 h-5" />
                  Traitement IA
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg flex items-center gap-3"
                      disabled={isReadOnly}
                    >
                      <CalendarLucide className="w-5 h-5" />
                      Programmer l'entretien
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="center">
                    <div className="p-4 space-y-4">
                      <div className="text-center">
                        <h4 className="font-semibold text-lg mb-2">Programmer l'entretien</h4>
                        <p className="text-sm text-muted-foreground">Choisissez une date disponible</p>
                  </div>
                      
                      {/* Calendrier personnalisé */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={goToPreviousMonth}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              ←
                            </button>
                            <h5 className="font-medium">
                              {format(currentMonth, "MMMM yyyy", { locale: fr })}
                            </h5>
                            <button
                              onClick={goToNextMonth}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              →
                            </button>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span>Sélectionné</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded"></div>
                              <span>Complet</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* En-têtes des jours */}
                        <div className="grid grid-cols-7 gap-1 text-xs text-center font-medium text-gray-500">
                          <div>Dim</div>
                          <div>Lun</div>
                          <div>Mar</div>
                          <div>Mer</div>
                          <div>Jeu</div>
                          <div>Ven</div>
                          <div>Sam</div>
                        </div>
                        
                        {/* Grille du calendrier */}
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendar(currentMonth).days.map((date, index) => {
                            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isFullyBooked = isDateFullyBooked(date);
                            const isSelected = isDateSelected(date);
                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                            
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  if (!isFullyBooked && !isPast && isCurrentMonth) {
                                    setInterviewDate(date);
                                    updateProtocol1('interview', 'interviewDate', date);
                                  }
                                }}
                                disabled={isFullyBooked || isPast || !isCurrentMonth}
                                className={cn(
                                  "w-8 h-8 text-xs rounded-md transition-all duration-200",
                                  "hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                                  {
                                    // Date sélectionnée
                                    "bg-green-500 text-white hover:bg-green-600": isSelected,
                                    // Date complètement occupée
                                    "bg-red-500 text-white cursor-not-allowed": isFullyBooked,

                                    // Date passée ou autre mois
                                    "text-gray-300 cursor-not-allowed": isPast || !isCurrentMonth,
                                    // Aujourd'hui
                                    "border-2 border-blue-500": isToday && !isSelected && !isFullyBooked,
                                    // Date normale disponible
                                    "hover:bg-blue-50 text-gray-700": !isSelected && !isFullyBooked && !isPast && isCurrentMonth,
                                  }
                                )}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>
              </div>

                      {/* Sélection d'heure */}
                      {interviewDate && (
                        <div className="space-y-3 border-t pt-4">
                          <Label className="text-sm font-medium">Choisissez un créneau</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((time) => {
                              const isBusy = isTimeSlotBusy(interviewDate, time);
                              const isSelected = selectedTimeSlot === time;
                              
                              return (
                                <button
                                  key={time}
                                  onClick={() => {
                                    if (!isBusy && !isReadOnly) {
                                      setSelectedTimeSlot(time);
                                      const [hours, minutes] = time.split(':');
                                      const newDate = new Date(interviewDate);
                                      newDate.setHours(parseInt(hours), parseInt(minutes));
                                      setInterviewDate(newDate);
                                      updateProtocol1('interview', 'interviewDate', newDate);
                                    }
                                  }}
                                  disabled={isBusy}
                                  className={cn(
                                    "px-3 py-2 text-xs rounded-md border transition-all duration-200",
                                    {
                                      // Créneau sélectionné
                                      "bg-blue-500 text-white border-blue-500": isSelected,
                                      // Créneau occupé
                                      "bg-red-500 text-white border-red-500 cursor-not-allowed": isBusy,
                                      // Créneau disponible
                                      "bg-white hover:bg-blue-50 border-gray-300": !isBusy && !isSelected,
                                    }
                                  )}
                                >
                                  {time}
                                  {isBusy && <span className="ml-1">✕</span>}
                                </button>
                              );
                            })}
              </div>
                          
                          {selectedTimeSlot && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                              <p className="text-sm font-medium text-green-800">
                                Entretien programmé le {format(interviewDate, "EEEE dd MMMM yyyy", { locale: fr })} à {selectedTimeSlot}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Entretien */}
          <div className="border rounded-lg p-4 bg-green-50 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-white font-semibold">
                {calculateSectionScores().interviewScore.toFixed(1)}%
              </Badge>
            </div>
            <h4 className="font-semibold mb-4 flex items-center gap-2 pr-16">
              <User className="w-4 h-4" />
              Entretien
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date d'entretien</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !interviewDate && "text-muted-foreground",
                        isReadOnly && "bg-gray-100 cursor-not-allowed"
                      )}
                      disabled={isReadOnly}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                      {interviewDate && selectedTimeSlot ? 
                        format(interviewDate, "EEEE dd MMMM yyyy", { locale: fr }) + ` à ${selectedTimeSlot}` :
                        "Aucun entretien programmé"
                      }
                      </Button>
                    </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-4 space-y-4">
                      <div className="text-center">
                        <h4 className="font-semibold text-lg mb-2">Modifier l'entretien</h4>
                        <p className="text-sm text-muted-foreground">Choisissez une nouvelle date et heure</p>
                </div>
                
                      {/* Calendrier personnalisé identique */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">
                            {format(new Date(), "MMMM yyyy", { locale: fr })}
                          </h5>
                          <div className="flex gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span>Sélectionné</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-orange-500 rounded"></div>
                              <span>Partiel</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded"></div>
                              <span>Complet</span>
                            </div>
                </div>
              </div>

                        {/* En-têtes des jours */}
                        <div className="grid grid-cols-7 gap-1 text-xs text-center font-medium text-gray-500">
                          <div>Dim</div>
                          <div>Lun</div>
                          <div>Mar</div>
                          <div>Mer</div>
                          <div>Jeu</div>
                          <div>Ven</div>
                          <div>Sam</div>
                        </div>
                        
                        {/* Grille du calendrier */}
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendar(currentMonth).days.map((date, index) => {
                            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isFullyBooked = isDateFullyBooked(date);
                            const isSelected = isDateSelected(date);
                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                            
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  if (!isFullyBooked && !isPast && isCurrentMonth && !isReadOnly) {
                                    setInterviewDate(date);
                                    setSelectedTimeSlot('');
                                    updateProtocol1('interview', 'interviewDate', date);
                                  }
                                }}
                                disabled={isFullyBooked || isPast || !isCurrentMonth || isReadOnly}
                                className={cn(
                                  "w-8 h-8 text-xs rounded-md transition-all duration-200",
                                  "hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                                  {
                                    // Date sélectionnée
                                    "bg-green-500 text-white hover:bg-green-600": isSelected,
                                    // Date complètement occupée
                                    "bg-red-500 text-white cursor-not-allowed": isFullyBooked,

                                    // Date passée ou autre mois
                                    "text-gray-300 cursor-not-allowed": isPast || !isCurrentMonth,
                                    // Aujourd'hui
                                    "border-2 border-blue-500": isToday && !isSelected && !isFullyBooked,
                                    // Date normale disponible
                                    "hover:bg-blue-50 text-gray-700": !isSelected && !isFullyBooked && !isPast && isCurrentMonth,
                                  }
                                )}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Sélection d'heure */}
                      {interviewDate && (
                        <div className="space-y-3 border-t pt-4">
                          <Label className="text-sm font-medium">Choisissez un créneau</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((time) => {
                              const isBusy = isTimeSlotBusy(interviewDate, time);
                              const isSelected = selectedTimeSlot === time;
                              
                              return (
                                <button
                                  key={time}
                                  onClick={() => {
                                    if (!isBusy && !isReadOnly) {
                                      setSelectedTimeSlot(time);
                                      const [hours, minutes] = time.split(':');
                                      const newDate = new Date(interviewDate);
                                      newDate.setHours(parseInt(hours), parseInt(minutes));
                                      setInterviewDate(newDate);
                                      updateProtocol1('interview', 'interviewDate', newDate);
                                    }
                                  }}
                                  disabled={isBusy || isReadOnly}
                                  className={cn(
                                    "px-3 py-2 text-xs rounded-md border transition-all duration-200",
                                    {
                                      // Créneau sélectionné
                                      "bg-blue-500 text-white border-blue-500": isSelected,
                                      // Créneau occupé
                                      "bg-red-500 text-white border-red-500 cursor-not-allowed": isBusy,
                                      // Créneau disponible
                                      "bg-white hover:bg-blue-50 border-gray-300": !isBusy && !isSelected,
                                    }
                                  )}
                                >
                                  {time}
                                  {isBusy && <span className="ml-1">✕</span>}
                                </button>
                              );
                            })}
                          </div>
                          
                          {selectedTimeSlot && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                              <p className="text-sm font-medium text-green-800">
                                Entretien programmé le {format(interviewDate, "EEEE dd MMMM yyyy", { locale: fr })} à {selectedTimeSlot}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Évaluation Adhérence MTP (Évaluation Physique)</Label>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <StarRating
                        value={evaluationData.protocol1.interview.physicalMtpAdherence.metier.score}
                        onChange={(value) => !isReadOnly && updateProtocol1('interview', 'physicalMtpAdherence.metier.score', value)}
                        label="Métier"
                        disabled={isReadOnly}
                      />
                      <Textarea
                        placeholder="Commentaires métier..."
                        value={evaluationData.protocol1.interview.physicalMtpAdherence.metier.comments}
                        onChange={(e) => !isReadOnly && updateProtocol1('interview', 'physicalMtpAdherence.metier.comments', e.target.value)}
                        className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                        readOnly={isReadOnly}
                      />
                    </div>

                    <div className="space-y-3">
                      <StarRating
                        value={evaluationData.protocol1.interview.physicalMtpAdherence.talent.score}
                        onChange={(value) => !isReadOnly && updateProtocol1('interview', 'physicalMtpAdherence.talent.score', value)}
                        label="Talent"
                        disabled={isReadOnly}
                      />
                      <Textarea
                        placeholder="Commentaires talent..."
                        value={evaluationData.protocol1.interview.physicalMtpAdherence.talent.comments}
                        onChange={(e) => !isReadOnly && updateProtocol1('interview', 'physicalMtpAdherence.talent.comments', e.target.value)}
                        className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                        readOnly={isReadOnly}
                      />
                    </div>

                    <div className="space-y-3">
                      <StarRating
                        value={evaluationData.protocol1.interview.physicalMtpAdherence.paradigme.score}
                        onChange={(value) => !isReadOnly && updateProtocol1('interview', 'physicalMtpAdherence.paradigme.score', value)}
                        label="Paradigme"
                        disabled={isReadOnly}
                      />
                      <Textarea
                        placeholder="Commentaires paradigme..."
                        value={evaluationData.protocol1.interview.physicalMtpAdherence.paradigme.comments}
                        onChange={(e) => !isReadOnly && updateProtocol1('interview', 'physicalMtpAdherence.paradigme.comments', e.target.value)}
                        className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                        readOnly={isReadOnly}
                      />
                    </div>
                  </div>
                </div>

              {/* Gap de compétence */}
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.interview.gapCompetence.score}
                    onChange={(value) => !isReadOnly && updateProtocol1('interview', 'gapCompetence.score', value)}
                    label="Gap de compétence"
                    disabled={isReadOnly}
                  />
                  <Textarea
                    placeholder="Commentaires sur les gaps de compétences identifiés..."
                    value={evaluationData.protocol1.interview.gapCompetence.comments}
                    onChange={(e) => !isReadOnly && updateProtocol1('interview', 'gapCompetence.comments', e.target.value)}
                    className={cn("min-h-[60px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Appréciation général de l'entretien</Label>
                <Textarea
                  placeholder="Résumé détaillé de l'entretien..."
                  value={evaluationData.protocol1.interview.generalSummary}
                  onChange={(e) => !isReadOnly && updateProtocol1('interview', 'generalSummary', e.target.value)}
                  className={cn("min-h-[120px]", isReadOnly && "bg-gray-100 cursor-not-allowed")}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          </div>
          
          {/* Actions Protocole 1 */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  Refuser
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer le refus</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir refuser ce candidat ? Cette action ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRefuse} className="bg-red-600 hover:bg-red-700">
                    Confirmer le refus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button 
              onClick={handleIncubate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Incuber
            </Button>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};
