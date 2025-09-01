import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Trophy, XCircle, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Interface pour simuler une application
interface MockApplication {
  id: string;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  created_at: string;
  updated_at: string;
  job_offers?: {
    title: string;
  };
}

// Interface pour les étapes de la timeline
interface TimelineStep {
  title: string;
  status: 'completed' | 'current' | 'pending' | 'refused';
  icon: React.ElementType;
  description: string;
  date?: string;
}

// Fonction pour générer la timeline
const generateTimeline = (application: MockApplication): TimelineStep[] => {
  const status = application.status;
  const createdAt = format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr });

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
      status: status === 'candidature' ? 'current' : (['incubation', 'embauche', 'refuse'].includes(status) ? 'completed' : 'pending'),
      icon: Users,
      description: "Protocole 1 : Évaluation et entretien",
      date: status === 'candidature' ? 'En cours' : (['incubation', 'embauche', 'refuse'].includes(status) ? 'Terminé' : 'À venir'),
    },
    {
      title: "Incubation",
      status: status === 'incubation' ? 'current' : (status === 'embauche' ? 'completed' : (status === 'refuse' ? 'refused' : 'pending')),
      icon: status === 'refuse' ? XCircle : Trophy,
      description: "Protocole 2 : Simulation, Performance et Compétence",
      date: status === 'incubation' ? 'En cours' : (status === 'embauche' ? 'Terminé' : (status === 'refuse' ? 'Refusé' : 'À venir')),
    },
    {
      title: "Engagé",
      status: status === 'embauche' ? 'completed' : (status === 'refuse' ? 'refused' : 'pending'),
      icon: status === 'refuse' ? XCircle : Trophy,
      description: status === 'embauche' ? "Félicitations ! Vous avez été engagé." : (status === 'refuse' ? "Nous ne donnons pas suite à votre candidature." : "En attente de la décision finale."),
      date: status === 'embauche' ? format(new Date(application.updated_at), 'dd MMMM yyyy', { locale: fr }) : (status === 'refuse' ? format(new Date(application.updated_at), 'dd MMMM yyyy', { locale: fr }) : 'À venir'),
    },
  ];

  return timeline;
};

export function TimelineTest() {
  // Données de test pour différents statuts
  const testApplications: MockApplication[] = [
    {
      id: '1',
      status: 'candidature',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      job_offers: { title: 'Développeur Full Stack' }
    },
    {
      id: '2',
      status: 'incubation',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
      job_offers: { title: 'Chef de Projet' }
    },
    {
      id: '3',
      status: 'embauche',
      created_at: '2024-01-05T10:00:00Z',
      updated_at: '2024-01-25T10:00:00Z',
      job_offers: { title: 'Analyste Business' }
    },
    {
      id: '4',
      status: 'refuse',
      created_at: '2024-01-08T10:00:00Z',
      updated_at: '2024-01-22T10:00:00Z',
      job_offers: { title: 'Consultant IT' }
    }
  ];

  const [selectedApp, setSelectedApp] = React.useState<MockApplication>(testApplications[0]);
  const timeline = generateTimeline(selectedApp);

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

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test de la Timeline des Candidatures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {testApplications.map((app) => (
              <Button
                key={app.id}
                variant={selectedApp.id === app.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedApp(app)}
              >
                {app.status} - {app.job_offers?.title}
              </Button>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              Suivi de candidature pour : {selectedApp.job_offers?.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Statut actuel : <Badge className="ml-2">{selectedApp.status}</Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Votre parcours de recrutement</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <div className="space-y-6 relative">
            {timeline.map((step, index) => (
              <div key={step.title} className="flex items-start gap-4 pl-4">
                {/* Ligne verticale */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-10 w-0.5 h-full" 
                       style={{ top: `${index * 5.5}rem`, height: '5.5rem', background: step.status === 'completed' ? 'var(--primary)' : 'rgb(229 231 235)' }}></div>
                )}

                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all z-10 flex-shrink-0 ${getStatusColor(step.status)}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0 pt-2">
                  <div className="flex flex-row items-center justify-between mb-2 gap-2">
                    <h3 className="font-semibold text-lg leading-tight">{step.title}</h3>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-primary font-medium mb-1 text-base leading-relaxed">{step.description}</p>
                  {step.date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
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


