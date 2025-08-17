import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Briefcase, Plus } from "lucide-react";
import { useCandidateLayout } from "@/components/layout/CandidateLayout";

// Mock data pour les candidatures
const mockApplications = [
  {
    id: 1,
    title: "Directeur des Ressources Humaines",
    department: "Ressources Humaines",
    location: "Libreville",
    dateSubmission: "15 Dec 2024",
    status: "En cours d'évaluation",
    currentStage: "Protocole 1 - Adhérence MTP"
  },
  {
    id: 2,
    title: "Directeur des Systèmes d'Information",
    department: "IT",
    location: "Libreville", 
    dateSubmission: "12 Dec 2024",
    status: "Documents vérifiés",
    currentStage: "Protocole 1 - Documents requis"
  }
];

export function CandidateApplications() {
  const { setCurrentView } = useCandidateLayout();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours d'évaluation":
        return "bg-yellow-500";
      case "Documents vérifiés":
        return "bg-green-500";
      case "Candidature retenue":
        return "bg-green-600";
      case "Non retenue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Mes candidatures</h2>
        <p className="text-lg text-muted-foreground">
          Suivi détaillé de toutes vos candidatures
        </p>
      </div>

      {mockApplications.length > 0 ? (
        <div className="grid gap-6">
          {mockApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{application.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {application.department}
                      </span>
                      <span>{application.location}</span>
                      <span>Candidature du {application.dateSubmission}</span>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(application.status)} text-white`}>
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Étape actuelle</p>
                    <p className="font-medium">{application.currentStage}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => setCurrentView("applications")}
                  >
                    <Eye className="w-4 h-4" />
                    Voir le suivi détaillé
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucune candidature</h3>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas encore postulé à des offres. Découvrez nos opportunités disponibles.
          </p>
          <Button 
            onClick={() => setCurrentView("jobs")}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Découvrir les offres
          </Button>
        </div>
      )}
    </div>
  );
}