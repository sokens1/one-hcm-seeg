import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Eye, Clock } from "lucide-react";

const mockApplications = [
  {
    id: 1,
    jobTitle: "Directeur des Ressources Humaines",
    department: "Ressources Humaines",
    location: "Libreville",
    applicationDate: "2024-12-15",
    status: "En cours d'évaluation",
    statusColor: "bg-orange-500"
  },
  {
    id: 2,
    jobTitle: "Directeur des Systèmes d'Information",
    department: "Informatique et Digital",
    location: "Libreville", 
    applicationDate: "2024-12-10",
    status: "Documents vérifiés",
    statusColor: "bg-blue-500"
  },
  {
    id: 3,
    jobTitle: "Directeur Financier",
    department: "Finance",
    location: "Libreville",
    applicationDate: "2024-12-05",
    status: "Candidature retenue",
    statusColor: "bg-green-500"
  }
];

export default function CandidateApplications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Mes Candidatures</h1>
        <Badge variant="secondary">{mockApplications.length} candidatures</Badge>
      </div>

      <div className="grid gap-4">
        {mockApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{application.jobTitle}</h3>
                    <div className={`w-3 h-3 rounded-full ${application.statusColor}`}></div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {application.department}
                    </span>
                    <span>{application.location}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Candidature: {new Date(application.applicationDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {application.status}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="ml-4">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir le suivi détaillé
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune candidature</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore postulé à des offres
            </p>
            <Button>
              Consulter les offres disponibles
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}