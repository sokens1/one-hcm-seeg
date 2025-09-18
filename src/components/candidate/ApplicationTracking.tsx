import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Users, Trophy, FileText, XCircle, Calendar } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApplication } from "@/hooks/useApplications";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Application } from "@/hooks/useApplications";
import { ContentSpinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define the structure for a timeline step
interface TimelineStep {
  title: string;
  status: 'completed' | 'current' | 'pending' | 'refused';
  icon: React.ElementType;
  description: string;
  date?: string;
}

// Function to generate the timeline based on application status and interview data
const generateTimeline = (application: Application | null | undefined, hasInterview: boolean = false): TimelineStep[] => {
  if (!application) return [];

  const status = application.status;
  const createdAt = format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr });

  // Déterminer le statut de l'étape "Traitement" en fonction du statut et de l'existence d'un entretien
  let treatmentStatus: 'completed' | 'current' | 'pending' | 'refused' = 'pending';
  let treatmentDate = 'À venir';
  let treatmentDescription = "Protocole 1 : Évaluation et Entretien";

  if (status === 'candidature') {
    treatmentStatus = 'current';
    treatmentDate = 'En cours';
  } else if (['incubation', 'embauche'].includes(status)) {
    treatmentStatus = 'completed';
    treatmentDate = 'Terminé';
  } else if (status === 'refuse') {
    // Pour les candidats refusés, vérifier s'ils ont eu un entretien
    if (hasInterview) {
      treatmentStatus = 'completed';
      treatmentDate = 'Terminé';
    } else {
      treatmentStatus = 'refused';
      treatmentDate = 'Refusé sans entretien';
      treatmentDescription = "Protocole 1 : Évaluation (sans entretien)";
    }
  }

  const timeline: TimelineStep[] = [
    {
      title: "Candidature soumise",
      status: 'completed',
      icon: CheckCircle,
      description: "Votre candidature a bien été soumise et est en cours de traitement.",
      date: createdAt,
    },
    {
      title: "Traitement",
      status: treatmentStatus,
      icon: Users,
      description: treatmentDescription,
      date: treatmentDate,
    },
    {
      title: "Présélectionné (Incubation)",
      status: status === 'incubation' ? 'current' : (status === 'embauche' ? 'completed' : (status === 'refuse' ? 'refused' : 'pending')),
      icon: status === 'refuse' ? XCircle : Trophy,
      description: "Protocole 2 : Simulation, Performance et Compétence",
      date: status === 'incubation' ? 'En cours' : (status === 'embauche' ? 'Terminé' : (status === 'refuse' ? 'Refusé' : 'À venir')),
    },
    {
      title: "Selectionné (Intégration)",
      status: status === 'embauche' ? 'completed' : (status === 'refuse' ? 'refused' : 'pending'),
      icon: status === 'refuse' ? XCircle : Trophy,
      description: status === 'embauche' ? "Félicitations ! Vous avez été engagé." : (status === 'refuse' ? "Nous ne donnons pas suite à votre candidature." : "Décision finale"),
      date: status === 'embauche' ? format(new Date(application.updated_at), 'dd MMMM yyyy', { locale: fr }) : (status === 'refuse' ? format(new Date(application.updated_at), 'dd MMMM yyyy', { locale: fr }) : 'À venir'),
    },
  ];

  return timeline;
};

export function ApplicationTracking() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryId = new URLSearchParams(location.search).get('id') || undefined;
  const effectiveId = id || queryId;
  const from = (location.state as { from?: string } | null)?.from ?? new URLSearchParams(location.search).get('from');
  const { data: application, isLoading, error } = useApplication(effectiveId);
  
  const [hasInterview, setHasInterview] = useState<boolean>(false);
  const [isLoadingInterview, setIsLoadingInterview] = useState<boolean>(true);

  // Vérifier si un entretien a eu lieu
  useEffect(() => {
    const checkInterviewStatus = async () => {
      if (!effectiveId) {
        setIsLoadingInterview(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('protocol1_evaluations')
          .select('interview_date, interview_metier_score, interview_talent_score, interview_paradigme_score')
          .eq('application_id', effectiveId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors de la vérification de l\'entretien:', error);
          setHasInterview(false);
        } else if (data) {
          // Un entretien a eu lieu si :
          // 1. Il y a une date d'entretien ET
          // 2. Au moins un des scores d'entretien est > 0
          const hasInterviewDate = !!data.interview_date;
          const hasInterviewScores = (data.interview_metier_score || 0) > 0 || 
                                   (data.interview_talent_score || 0) > 0 || 
                                   (data.interview_paradigme_score || 0) > 0;
          
          setHasInterview(hasInterviewDate && hasInterviewScores);
        } else {
          setHasInterview(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'entretien:', error);
        setHasInterview(false);
      } finally {
        setIsLoadingInterview(false);
      }
    };

    checkInterviewStatus();
  }, [effectiveId]);

  const timeline = generateTimeline(application, hasInterview);

  const getStatusColor = (status: TimelineStep['status']) => {
    switch (status) {
      case "completed": return "bg-green-500 border-green-500 text-white";
      case "current": return "bg-blue-500 border-blue-500 text-white animate-pulse";
      case "refused": return "bg-red-500 border-red-500 text-white";
      default: return "bg-white border-gray-300 text-gray-400";
    }
  };

  const getStatusBadge = (status: TimelineStep['status']) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case "current": return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      case "refused": return <Badge className="bg-red-100 text-red-800">Refusé</Badge>;
      default: return <Badge variant="outline" className="text-gray-500">En attente</Badge>;
    }
  };

  if (isLoading || isLoadingInterview) {
    return <ContentSpinner text="Chargement du suivi de la candidature..." />;
  }

  if (error || !application) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Impossible de charger les informations de la candidature.</p>
        <p className="text-sm">{error?.message || "L'identifiant de la candidature est introuvable."}</p>
        <Button
          variant="outline"
          onClick={() => {
            if (id) {
              navigate('/candidate/dashboard?view=dashboard');
              return;
            }
            if (from === 'applications') {
              navigate('/candidate/dashboard?view=applications');
              return;
            }
            navigate('/candidate/dashboard');
          }}
          className="mt-4"
        >
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-3 sm:px-0">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Si on vient de "Mes candidatures", retour à l'onglet applications (priorité)
            if (from === 'applications') {
              navigate('/candidate/dashboard?view=applications');
              return;
            }
            // Si on vient d'une route paramétrée sans indication de provenance, retour au dashboard
            if (id) {
              navigate('/candidate/dashboard?view=dashboard');
              return;
            }
            // Fallback: dashboard
            navigate('/candidate/dashboard?view=dashboard');
          }}
          className="gap-2"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Retour</span>
        </Button>
      </div>

      <div className="text-center px-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
          Suivi de ma candidature pour : {application.job_offers?.title}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
          Candidature déposée le {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr })}
        </p>
      </div>

      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Votre parcours de recrutement</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-4 sm:space-y-6 relative">
            {timeline.map((step, index) => (
              <div key={step.title} className="flex items-start gap-3 sm:gap-4 pl-2 sm:pl-4">
                {/* Vertical line for timeline - Hidden on very small screens */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-0.5 bg-gray-200 hidden xs:block" style={{ zIndex: 0 }}></div>
                )}
                <div className="absolute left-8 sm:left-10 w-0.5 h-full hidden xs:block" 
                     style={{ top: `${index * 5.5}rem`, height: '5.5rem', background: step.status === 'completed' ? 'var(--primary)' : 'rgb(229 231 235)' }}></div>

                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all z-10 flex-shrink-0 ${getStatusColor(step.status)}`}>
                  <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                
                <div className="flex-1 min-w-0 pt-1 sm:pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                    <h3 className="font-semibold text-base sm:text-lg leading-tight">{step.title}</h3>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-primary font-medium mb-1 text-sm sm:text-base leading-relaxed">{step.description}</p>
                  {step.date && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{step.date}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}