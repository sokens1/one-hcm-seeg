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

interface EvaluationData {
  globalScore: number;
  status: string;
  protocol1: {
    score: number;
    status: 'pending' | 'in_progress' | 'completed';
    // Partie 1: Validation des Prérequis (10%)
    documentaryEvaluation: {
      cv: {
        score: number; // 5 étoiles
        comments: string;
      };
      diplomas: {
        score: number; // 5 étoiles
        comments: string;
      };
      certificates: {
        score: number; // 5 étoiles
        comments: string;
      };
    };
    // Evaluation MTP - Taux d'adhérence MTP (20%)
    mtpAdherence: {
      metier: {
        score: number; // 5 étoiles
        comments: string;
      };
      talent: {
        score: number; // 5 étoiles
        comments: string;
      };
      paradigme: {
        score: number; // 5 étoiles
        comments: string;
      };
    };
    // Partie 2: Entretien (70%)
    interview: {
    interviewDate?: Date;
      // Evaluation adhérence MTP physique
      physicalMtpAdherence: {
        metier: {
          score: number; // 5 étoiles
          comments: string;
        };
        talent: {
          score: number; // 5 étoiles
          comments: string;
        };
        paradigme: {
          score: number; // 5 étoiles
          comments: string;
        };
      };
    generalSummary: string;
    };
  };
  protocol2: {
    score: number;
    status: 'pending' | 'in_progress' | 'completed';
    rolePlay: {
      completed: boolean;
      score: number;
      reportAttached: boolean;
    };
    codirGame: {
      completed: boolean;
      score: number;
      reportAttached: boolean;
    };
    physicalVisit: boolean;
    jobDescriptionValidated: boolean;
    skillsGap: 'low' | 'medium' | 'high';
    skillsGapJustification: string;
  };
}

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, label }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={cn(
                "w-5 h-5",
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
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
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  candidateName,
  jobTitle,
  applicationId,
  onStatusChange
}) => {
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    globalScore: 0,
    status: "Évaluation - Protocole 1 en cours",
    protocol1: {
      score: 0,
      status: 'pending',
      // Partie 1: Validation des Prérequis (10%)
      documentaryEvaluation: {
        cv: {
          score: 0,
          comments: "",
        },
        diplomas: {
          score: 0,
          comments: "",
        },
        certificates: {
          score: 0,
          comments: "",
        },
      },
      // Evaluation MTP - Taux d'adhérence MTP (20%)
      mtpAdherence: {
        metier: {
          score: 0,
          comments: "",
        },
        talent: {
          score: 0,
          comments: "",
        },
        paradigme: {
          score: 0,
          comments: "",
        },
      },
      // Partie 2: Entretien (70%)
      interview: {
        physicalMtpAdherence: {
          metier: {
            score: 0,
            comments: "",
          },
          talent: {
            score: 0,
            comments: "",
          },
          paradigme: {
            score: 0,
            comments: "",
          },
        },
      generalSummary: ""
      },
    },
    protocol2: {
      score: 0,
      status: 'pending',
      rolePlay: {
        completed: false,
        score: 0,
        reportAttached: false
      },
      codirGame: {
        completed: false,
        score: 0,
        reportAttached: false
      },
      physicalVisit: false,
      jobDescriptionValidated: false,
      skillsGap: 'medium',
      skillsGapJustification: ""
    }
  });

  const [interviewDate, setInterviewDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Données des entretiens occupés (exemple - à remplacer par des vraies données)
  const busySlots = {
    '2024-01-15': ['09:00', '10:30', '14:00'], // 15 janvier 2024
    '2024-01-16': ['09:30', '11:00', '15:00'], // 16 janvier 2024
    '2024-01-22': ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'], // 22 janvier - jour complet
    '2024-01-28': ['14:00', '15:30'], // 28 janvier 2024
  };
  
  // Créneaux horaires disponibles
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
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
  
  // Fonction pour vérifier si une date a des créneaux partiellement occupés
  const isDatePartiallyBooked = (date: Date) => {
    const dateKey = getDateKey(date);
    const busySlotsForDate = busySlots[dateKey] || [];
    return busySlotsForDate.length > 0 && busySlotsForDate.length < timeSlots.length;
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

  // Fonction pour calculer les scores partiels de chaque section
  const calculateSectionScores = (protocol1: any) => {
    // Validation des Prérequis (10%) - Moyenne des 3 évaluations documentaires
    const documentaryScores = [
      protocol1.documentaryEvaluation.cv.score,
      protocol1.documentaryEvaluation.diplomas.score,
      protocol1.documentaryEvaluation.certificates.score
    ];
    const documentaryAverage = documentaryScores.length > 0 ? documentaryScores.reduce((a, b) => a + b, 0) / documentaryScores.length : 0;
    const documentaryScore = (documentaryAverage / 5) * 10;
    
    // Evaluation MTP - Taux d'adhérence MTP (20%)
    const mtpScores = [
      protocol1.mtpAdherence.metier.score,
      protocol1.mtpAdherence.talent.score,
      protocol1.mtpAdherence.paradigme.score
    ];
    const mtpAverage = mtpScores.length > 0 ? mtpScores.reduce((a, b) => a + b, 0) / mtpScores.length : 0;
    const mtpScore = (mtpAverage / 5) * 20;
    
    // Entretien (70%)
    const interviewScores = [
      protocol1.interview.physicalMtpAdherence.metier.score,
      protocol1.interview.physicalMtpAdherence.talent.score,
      protocol1.interview.physicalMtpAdherence.paradigme.score
    ];
    const interviewAverage = interviewScores.length > 0 ? interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length : 0;
    const interviewScore = (interviewAverage / 5) * 70;

    return {
      documentaryScore,
      mtpScore, 
      interviewScore,
      totalScore: documentaryScore + mtpScore + interviewScore
    };
  };

  const updateProtocol1 = (section: string, field: string, value: any) => {
    setEvaluationData(prev => {
      const newProtocol1 = { ...prev.protocol1 };
      
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
        } else {
          newProtocol1.interview = {
            ...newProtocol1.interview,
            [field]: value
          };
        }
      }
      
      // Calculer le score selon la nouvelle pondération
      const sectionScores = calculateSectionScores(newProtocol1);
      newProtocol1.score = Math.round(sectionScores.totalScore);
      
      // Mettre à jour le statut
      if (sectionScores.documentaryScore > 0 && sectionScores.mtpScore > 0) {
        newProtocol1.status = 'in_progress';
      }
      if (newProtocol1.score >= 60) {
        newProtocol1.status = 'completed';
      }
      
      // Calculer le score global
      const globalScore = newProtocol1.score;
      
      return {
        ...prev,
        protocol1: newProtocol1,
        globalScore
      };
    });
  };

  const updateProtocol2 = (field: string, value: any) => {
    setEvaluationData(prev => {
      const newProtocol2 = {
        ...prev.protocol2,
        [field]: value
      };
      
      // Calculer le score du protocole 2 dynamiquement
      let totalScore = 0;
      let scoreCount = 0;
      
      if (newProtocol2.rolePlay.completed && newProtocol2.rolePlay.score > 0) {
        totalScore += newProtocol2.rolePlay.score;
        scoreCount++;
      }
      
      if (newProtocol2.codirGame.completed && newProtocol2.codirGame.score > 0) {
        totalScore += newProtocol2.codirGame.score;
        scoreCount++;
      }
      
      // Bonus pour validations opérationnelles
      if (newProtocol2.physicalVisit) totalScore += 5;
      if (newProtocol2.jobDescriptionValidated) totalScore += 5;
      
      newProtocol2.score = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
      
      // Mettre à jour le statut
      if (newProtocol2.rolePlay.completed || newProtocol2.codirGame.completed) {
        newProtocol2.status = 'in_progress';
      }
      if (newProtocol2.rolePlay.completed && newProtocol2.codirGame.completed) {
        newProtocol2.status = 'completed';
      }
      
      // Calculer le score global (moyenne des deux protocoles)
      const globalScore = prev.protocol1.score > 0 && newProtocol2.score > 0 
        ? Math.round((prev.protocol1.score + newProtocol2.score) / 2)
        : prev.protocol1.score;
      
      return {
        ...prev,
        protocol2: newProtocol2,
        globalScore
      };
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

  return (
    <div className="space-y-6">
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Score Global Provisoire</span>
              <span className="text-sm text-muted-foreground">{evaluationData.globalScore === 0 ? '0' : evaluationData.globalScore.toFixed(1)}%</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                style={{ width: `${Math.max(0, Math.min(100, evaluationData.globalScore || 0))}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Validation Prérequis</div>
              <div className="font-semibold text-sm text-blue-600">10%</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Évaluation MTP</div>
              <div className="font-semibold text-sm text-green-600">20%</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Entretien</div>
              <div className="font-semibold text-sm text-purple-600">70%</div>
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
              Protocole 1 : Validation et Entretien
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
                {calculateSectionScores(evaluationData.protocol1).documentaryScore.toFixed(1)}%
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
                    onChange={(value) => updateProtocol1('documentaryEvaluation', 'cv.score', value)}
                    label="CV"
                  />
                  <Textarea
                    placeholder="Commentaires sur le CV..."
                    value={evaluationData.protocol1.documentaryEvaluation.cv.comments}
                    onChange={(e) => updateProtocol1('documentaryEvaluation', 'cv.comments', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.documentaryEvaluation.diplomas.score}
                    onChange={(value) => updateProtocol1('documentaryEvaluation', 'diplomas.score', value)}
                    label="Diplômes"
                  />
                  <Textarea
                    placeholder="Commentaires sur les diplômes..."
                    value={evaluationData.protocol1.documentaryEvaluation.diplomas.comments}
                    onChange={(e) => updateProtocol1('documentaryEvaluation', 'diplomas.comments', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.documentaryEvaluation.certificates.score}
                    onChange={(value) => updateProtocol1('documentaryEvaluation', 'certificates.score', value)}
                    label="Certificats"
                  />
                  <Textarea
                    placeholder="Commentaires sur les certificats..."
                    value={evaluationData.protocol1.documentaryEvaluation.certificates.comments}
                    onChange={(e) => updateProtocol1('documentaryEvaluation', 'certificates.comments', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Évaluation MTP - Taux d'adhérence MTP */}
          <div className="border rounded-lg p-4 bg-blue-50 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-white font-semibold">
                {calculateSectionScores(evaluationData.protocol1).mtpScore.toFixed(1)}%
                    </Badge>
                  </div>
            <h4 className="font-semibold mb-4 flex items-center gap-2 pr-16">
              <Users className="w-4 h-4" />
              Évaluation MTP - Taux d'adhérence MTP
            </h4>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.mtpAdherence.metier.score}
                    onChange={(value) => updateProtocol1('mtpAdherence', 'metier.score', value)}
                    label="Métier"
                  />
                  <Textarea
                    placeholder="Commentaires métier..."
                    value={evaluationData.protocol1.mtpAdherence.metier.comments}
                    onChange={(e) => updateProtocol1('mtpAdherence', 'metier.comments', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.mtpAdherence.talent.score}
                    onChange={(value) => updateProtocol1('mtpAdherence', 'talent.score', value)}
                    label="Talent"
                  />
                  <Textarea
                    placeholder="Commentaires talent..."
                    value={evaluationData.protocol1.mtpAdherence.talent.comments}
                    onChange={(e) => updateProtocol1('mtpAdherence', 'talent.comments', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="space-y-3">
                  <StarRating
                    value={evaluationData.protocol1.mtpAdherence.paradigme.score}
                    onChange={(value) => updateProtocol1('mtpAdherence', 'paradigme.score', value)}
                    label="Paradigme"
                  />
                  <Textarea
                    placeholder="Commentaires paradigme..."
                    value={evaluationData.protocol1.mtpAdherence.paradigme.comments}
                    onChange={(e) => updateProtocol1('mtpAdherence', 'paradigme.comments', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </div>
              
              {/* Bouton Programmer l'entretien */}
              <div className="flex justify-end pt-4 border-t border-blue-200">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg flex items-center gap-3"
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
                          {generateCalendar().days.map((date, index) => {
                            const isCurrentMonth = date.getMonth() === new Date().getMonth();
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isFullyBooked = isDateFullyBooked(date);
                            const isPartiallyBooked = isDatePartiallyBooked(date);
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
                                    // Date partiellement occupée
                                    "bg-orange-500 text-white hover:bg-orange-600": isPartiallyBooked && !isSelected,
                                    // Date passée ou autre mois
                                    "text-gray-300 cursor-not-allowed": isPast || !isCurrentMonth,
                                    // Aujourd'hui
                                    "border-2 border-blue-500": isToday && !isSelected && !isFullyBooked && !isPartiallyBooked,
                                    // Date normale disponible
                                    "hover:bg-blue-50 text-gray-700": !isSelected && !isFullyBooked && !isPartiallyBooked && !isPast && isCurrentMonth,
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
                                    if (!isBusy) {
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
                {calculateSectionScores(evaluationData.protocol1).interviewScore.toFixed(1)}%
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
                          !interviewDate && "text-muted-foreground"
                        )}
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
                          {generateCalendar().days.map((date, index) => {
                            const isCurrentMonth = date.getMonth() === new Date().getMonth();
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isFullyBooked = isDateFullyBooked(date);
                            const isPartiallyBooked = isDatePartiallyBooked(date);
                            const isSelected = isDateSelected(date);
                            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                            
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  if (!isFullyBooked && !isPast && isCurrentMonth) {
                                    setInterviewDate(date);
                                    setSelectedTimeSlot(''); // Reset time slot
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
                                    // Date partiellement occupée
                                    "bg-orange-500 text-white hover:bg-orange-600": isPartiallyBooked && !isSelected,
                                    // Date passée ou autre mois
                                    "text-gray-300 cursor-not-allowed": isPast || !isCurrentMonth,
                                    // Aujourd'hui
                                    "border-2 border-blue-500": isToday && !isSelected && !isFullyBooked && !isPartiallyBooked,
                                    // Date normale disponible
                                    "hover:bg-blue-50 text-gray-700": !isSelected && !isFullyBooked && !isPartiallyBooked && !isPast && isCurrentMonth,
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
                                    if (!isBusy) {
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

                <div className="space-y-4">
                <Label className="text-sm font-medium">Évaluation Adhérence MTP (Évaluation Physique)</Label>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                  <StarRating
                      value={evaluationData.protocol1.interview.physicalMtpAdherence.metier.score}
                      onChange={(value) => updateProtocol1('interview', 'physicalMtpAdherence.metier.score', value)}
                      label="Métier"
                  />
                  <Textarea
                      placeholder="Commentaires métier..."
                      value={evaluationData.protocol1.interview.physicalMtpAdherence.metier.comments}
                      onChange={(e) => updateProtocol1('interview', 'physicalMtpAdherence.metier.comments', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                  <div className="space-y-3">
                  <StarRating
                      value={evaluationData.protocol1.interview.physicalMtpAdherence.talent.score}
                      onChange={(value) => updateProtocol1('interview', 'physicalMtpAdherence.talent.score', value)}
                      label="Talent"
                  />
                  <Textarea
                      placeholder="Commentaires talent..."
                      value={evaluationData.protocol1.interview.physicalMtpAdherence.talent.comments}
                      onChange={(e) => updateProtocol1('interview', 'physicalMtpAdherence.talent.comments', e.target.value)}
                    className="min-h-[60px]"
                  />
              </div>

                  <div className="space-y-3">
                <StarRating
                      value={evaluationData.protocol1.interview.physicalMtpAdherence.paradigme.score}
                      onChange={(value) => updateProtocol1('interview', 'physicalMtpAdherence.paradigme.score', value)}
                      label="Paradigme"
                />
                <Textarea
                      placeholder="Commentaires paradigme..."
                      value={evaluationData.protocol1.interview.physicalMtpAdherence.paradigme.comments}
                      onChange={(e) => updateProtocol1('interview', 'physicalMtpAdherence.paradigme.comments', e.target.value)}
                  className="min-h-[60px]"
                />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Compte-rendu général de l'entretien</Label>
                <Textarea
                  placeholder="Résumé détaillé de l'entretien..."
                  value={evaluationData.protocol1.interview.generalSummary}
                  onChange={(e) => updateProtocol1('interview', 'generalSummary', e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </div>
          
          {/* Actions Protocole 1 */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => onStatusChange('refuse')}
              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
            >
              Refuser
            </Button>
            <Button 
              onClick={() => onStatusChange('incubation')}
              disabled={evaluationData.protocol1.score < 60}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Incuber
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Protocole 2 - Évaluation Approfondie & Tests */}
      <Card className={cn(
        "transition-all duration-200",
        evaluationData.protocol1.score < 60 && "opacity-50 pointer-events-none"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(evaluationData.protocol2.status)}
              Protocole 2 : Évaluation Approfondie & Tests
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(evaluationData.protocol2.status)}
              <div className="text-right">
                <div className="font-bold text-lg">{evaluationData.protocol2.score}/100</div>
                <div className="text-xs text-muted-foreground">Score Protocole 2</div>
              </div>
            </div>
          </div>
          {evaluationData.protocol1.score < 60 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Ce protocole sera accessible une fois le Protocole 1 validé (score ≥ 60)
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Module 2.1 : Mise en Situation & Tests Techniques */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              2.1 Mise en Situation & Tests Techniques
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-medium">Jeu de Rôle</h5>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={evaluationData.protocol2.rolePlay.completed}
                      onCheckedChange={(checked) => updateProtocol2('rolePlay', {
                        ...evaluationData.protocol2.rolePlay,
                        completed: checked
                      })}
                    />
                    <Badge variant={evaluationData.protocol2.rolePlay.completed ? "default" : "secondary"}>
                      {evaluationData.protocol2.rolePlay.completed ? "Réalisé" : "Non réalisé"}
                    </Badge>
                  </div>
                  {evaluationData.protocol2.rolePlay.completed && (
                    <div className="space-y-2">
                      <Label>Score obtenu</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={evaluationData.protocol2.rolePlay.score}
                          onChange={(e) => updateProtocol2('rolePlay', {
                            ...evaluationData.protocol2.rolePlay,
                            score: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Joindre le rapport d'évaluation
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium">Jeu de CODIR (Comité de Direction)</h5>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={evaluationData.protocol2.codirGame.completed}
                      onCheckedChange={(checked) => updateProtocol2('codirGame', {
                        ...evaluationData.protocol2.codirGame,
                        completed: checked
                      })}
                    />
                    <Badge variant={evaluationData.protocol2.codirGame.completed ? "default" : "secondary"}>
                      {evaluationData.protocol2.codirGame.completed ? "Réalisé" : "Non réalisé"}
                    </Badge>
                  </div>
                  {evaluationData.protocol2.codirGame.completed && (
                    <div className="space-y-2">
                      <Label>Score obtenu</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={evaluationData.protocol2.codirGame.score}
                          onChange={(e) => updateProtocol2('codirGame', {
                            ...evaluationData.protocol2.codirGame,
                            score: parseInt(e.target.value) || 0
                          })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Joindre le rapport d'évaluation
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Module 2.2 : Validation Opérationnelle */}
          <div className="border rounded-lg p-4 bg-purple-50">
            <h4 className="font-semibold mb-4">2.2 Validation Opérationnelle</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={evaluationData.protocol2.physicalVisit}
                  onCheckedChange={(checked) => updateProtocol2('physicalVisit', checked)}
                />
                <Label>Visite physique effectuée</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={evaluationData.protocol2.jobDescriptionValidated}
                  onCheckedChange={(checked) => updateProtocol2('jobDescriptionValidated', checked)}
                />
                <Label>Fiche de fonction éditée et validée avec le candidat</Label>
              </div>
            </div>
          </div>

          {/* Module 2.3 : Synthèse des Compétences */}
          <div className="border rounded-lg p-4 bg-orange-50">
            <h4 className="font-semibold mb-4">2.3 Synthèse des Compétences</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Analyse du "Gap" de compétences</Label>
                <Select 
                  value={evaluationData.protocol2.skillsGap}
                  onValueChange={(value: 'low' | 'medium' | 'high') => updateProtocol2('skillsGap', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Justification</Label>
                <Textarea
                  placeholder="Le candidat devra être formé sur notre logiciel de paie interne. Excellente maîtrise des autres aspects."
                  value={evaluationData.protocol2.skillsGapJustification}
                  onChange={(e) => updateProtocol2('skillsGapJustification', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Protocole 2 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline">Sauvegarder le brouillon</Button>
        <Button 
          variant="outline" 
          onClick={() => onStatusChange('refuse')}
          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
        >
          Refuser
        </Button>
        <Button 
          onClick={() => onStatusChange('embauche')}
          disabled={evaluationData.protocol2.score < 70}
          className="bg-green-600 hover:bg-green-700"
        >
          Engager
        </Button>
      </div>
    </div>
  );
};
