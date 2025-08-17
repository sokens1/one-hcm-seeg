import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const mockApplications = [
  {
    id: 1,
    title: "Directeur des Ressources Humaines",
    department: "Ressources Humaines",
    location: "Libreville",
    dateDepot: "15 Décembre 2024",
    status: "En cours d'analyse",
    etape: "Adhérence MTP"
  },
  {
    id: 2,
    title: "Directeur Technique",
    department: "Technique",
    location: "Libreville",
    dateDepot: "12 Décembre 2024",
    status: "Documents vérifiés",
    etape: "Validation documents"
  },
];

export default function CandidateApplications() {
  const { isAuthenticated, isLoading } = useCandidateAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/candidate/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <CandidateLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Mes candidatures</h2>
          <p className="text-lg text-muted-foreground">
            Suivi détaillé de toutes vos candidatures en cours
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{application.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{application.department}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {application.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Candidature déposée le {application.dateDepot}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="secondary">
                    {application.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Étape actuelle: {application.etape}
                  </p>
                </div>

                <Button asChild className="w-full gap-2">
                  <Link to={`/candidate/application/${application.id}`}>
                    <Eye className="w-4 h-4" />
                    Voir le suivi détaillé
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockApplications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Vous n'avez encore aucune candidature en cours.
              </p>
              <Button asChild>
                <Link to="/candidate/jobs">
                  Découvrir les offres disponibles
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </CandidateLayout>
  );
}