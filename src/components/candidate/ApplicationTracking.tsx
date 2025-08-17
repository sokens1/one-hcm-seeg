import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Clock, Circle, Users, Eye, PlayCircle, FileText, TrendingUp } from "lucide-react";

interface Application {
  id: number;
  jobTitle: string;
  department: string;
  location: string;
  dateApplied: string;
  status: string;
}

interface ApplicationTrackingProps {
  application: Application;
  onBack: () => void;
}

interface TimelineStep {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: any;
}

export function ApplicationTracking({ application, onBack }: ApplicationTrackingProps) {
  // Protocole 1 - Étape d'évaluation
  const protocol1Steps: TimelineStep[] = [
    {
      title: "Dépôt de candidature",
      description: "Votre candidature a bien été soumise",
      status: "completed",
      icon: CheckCircle2
    },
    {
      title: "Documents requis vérifiés",
      description: "Documents reçus et validés",
      status: "completed", 
      icon: FileText
    },
    {
      title: "Adhérence MTP",
      description: "Evaluation en cours",
      status: "current",
      icon: Clock
    }
  ];

  // Protocole 2 - Étape d'évaluation (conditionnel)
  const protocol2Steps: TimelineStep[] = [
    {
      title: "Visite physique",
      description: "Visite effectuée",
      status: "pending",
      icon: Eye
    },
    {
      title: "Entretien",
      description: "Entretien effectué", 
      status: "pending",
      icon: Users
    },
    {
      title: "Jeux de rôle",
      description: "Evaluation en cours",
      status: "pending",
      icon: PlayCircle
    },
    {
      title: "Jeux de CoDir",
      description: "Prévus",
      status: "pending",
      icon: Users
    },
    {
      title: "Édition fiche de fonction",
      description: "En préparation",
      status: "pending",
      icon: FileText
    },
    {
      title: "Gap de compétences",
      description: "Analyse en cours",
      status: "pending",
      icon: TrendingUp
    }
  ];

  // Calcul du pourcentage de progression
  const completedSteps = protocol1Steps.filter(step => step.status === 'completed').length;
  const totalSteps = protocol1Steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getStepIcon = (step: TimelineStep) => {
    const IconComponent = step.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: "bg-green-50 border-green-200",
          icon: "bg-green-500 text-white",
          title: "text-green-800",
          description: "text-green-600"
        };
      case 'current':
        return {
          container: "bg-orange-50 border-orange-200",
          icon: "bg-orange-500 text-white animate-pulse",
          title: "text-orange-800",
          description: "text-orange-600"
        };
      default:
        return {
          container: "bg-gray-50 border-gray-200",
          icon: "bg-gray-300 text-gray-600",
          title: "text-gray-600",
          description: "text-gray-500"
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec retour */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Suivi de ma candidature pour :</h1>
          <h2 className="text-2xl text-primary font-semibold">{application.jobTitle}</h2>
          <p className="text-muted-foreground">{application.department} • {application.location}</p>
        </div>
      </div>

      {/* Barre de progression globale */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Progression globale</span>
            <Badge variant="secondary">{Math.round(progressPercentage)}% complété</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {completedSteps} étape(s) sur {totalSteps} terminée(s)
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1 : Protocole 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">
              Protocole 1 - Étape d'évaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {protocol1Steps.map((step, index) => {
                const styles = getStepStyles(step.status);
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${styles.container}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.icon}`}>
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          getStepIcon(step)
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${styles.title}`}>
                          {step.status === 'completed' && '✓ '}
                          {step.status === 'current' && '🟠 '}
                          {step.status === 'pending' && '⚪ '}
                          {step.title}
                        </h4>
                        <p className={`text-sm ${styles.description}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Décision globale (conditionnel) */}
              <div className="p-4 rounded-lg border-2 bg-gray-50 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">
                    <Circle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-600">
                      ⚪ Décision globale
                    </h4>
                    <p className="text-sm text-gray-500">
                      Candidature retenue / non retenue
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 : Protocole 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-secondary">
              Protocole 2 - Étape d'évaluation
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cette section apparaîtra lorsque vous avancerez à cette étape
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {protocol2Steps.map((step, index) => {
                const styles = getStepStyles('pending');
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${styles.container}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.icon}`}>
                        <Circle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${styles.title}`}>
                          ⚪ {step.title}
                        </h4>
                        <p className={`text-sm ${styles.description}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations sur la candidature */}
      <Card>
        <CardHeader>
          <CardTitle>Informations sur votre candidature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Date de candidature</p>
              <p className="text-sm text-muted-foreground">{application.dateApplied}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Statut actuel</p>
              <Badge variant="secondary">{application.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Prochaine étape</p>
              <p className="text-sm text-muted-foreground">
                Finalisation de l'évaluation d'adhérence MTP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}