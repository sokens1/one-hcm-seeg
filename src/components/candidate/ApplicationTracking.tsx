import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Users, Trophy, FileText, Loader2, XCircle, Calendar } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApplication } from "@/hooks/useApplications";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Application } from "@/hooks/useApplications";

// Define the structure for a timeline step
interface TimelineStep {
  title: string;
  status: 'completed' | 'current' | 'pending' | 'refused';
  icon: React.ElementType;
  description: string;
  date?: string;
}

// Function to generate the timeline based on application status
const generateTimeline = (application: Application | null | undefined): TimelineStep[] => {
  if (!application) return [];

  const status = application.status;
  const createdAt = format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr });

  const isCompleted = (stepStatus: Application['status'][]) => stepStatus.includes(status);

  const timeline: TimelineStep[] = [
    {
      title: "Dépôt de candidature",
      status: 'completed',
      icon: CheckCircle,
      description: "Votre candidature a bien été soumise.",
      date: createdAt,
    },
    {
      title: "Entretien (évaluation physique MTP)",
      status: status === 'incubation' ? 'current' : (isCompleted(['embauche', 'refuse']) ? 'completed' : 'pending'),
      icon: Users,
      description: "Entretien et évaluation MTP (Metier, Talent, Paradigme) avec l'équipe.",
      date: status === 'incubation' ? 'En cours' : (isCompleted(['embauche', 'refuse']) ? createdAt : 'À venir'),
    },
    {
      title: "Décision finale",
      status: status === 'embauche' ? 'completed' : (status === 'refuse' ? 'refused' : 'pending'),
      icon: status === 'refuse' ? XCircle : Trophy,
      description: status === 'embauche' ? "Félicitations ! Votre candidature est retenue." : (status === 'refuse' ? "Nous ne donnons pas suite à votre candidature." : "En attente de la décision finale."),
      date: isCompleted(['embauche', 'refuse']) ? format(new Date(application.updated_at), 'dd MMMM yyyy', { locale: fr }) : 'À venir',
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

  const timeline = generateTimeline(application);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Chargement du suivi...</p>
      </div>
    );
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
              navigate('/candidate/dashboard');
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
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Si on vient de la route paramétrée (/candidate/application/:id), retour au dashboard
            if (id) {
              navigate('/candidate/dashboard');
              return;
            }
            // Si on vient de "Mes candidatures", retour à l'onglet applications
            if (from === 'applications') {
              navigate('/candidate/dashboard?view=applications');
              return;
            }
            // Fallback: dashboard
            navigate('/candidate/dashboard');
          }}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Suivi de ma candidature pour : {application.job_offers?.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          Candidature déposée le {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr })}
        </p>
      </div>

      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">Votre parcours de recrutement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 relative">
            {timeline.map((step, index) => (
              <div key={step.title} className="flex items-start gap-4 pl-4">
                {/* Vertical line for timeline */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gray-200" style={{ zIndex: 0 }}></div>
                )}
                <div className="absolute left-10 w-0.5 h-full" 
                     style={{ top: `${index * 6.5}rem`, height: '6.5rem', background: step.status === 'completed' ? 'var(--primary)' : 'rgb(229 231 235)' }}></div>

                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all z-10 ${getStatusColor(step.status)}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0 pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-muted-foreground mb-1">{step.description}</p>
                  {step.date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {step.date}
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