import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useApplications } from "@/hooks/useApplications";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CandidateApplications() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const { data: applications, isLoading: isAppsLoading, error } = useApplications();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/candidate/login");
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  if (isAuthLoading || isAppsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <CandidateLayout>
        <div className="text-center py-12 text-red-600">
          <p>Une erreur est survenue lors du chargement de vos candidatures.</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </CandidateLayout>
    );
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
          {applications?.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{application.job_offers?.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{application.job_offers?.contract_type}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {application.job_offers?.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Candidature déposée le {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="secondary">
                    {application.status}
                  </Badge>
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

        {applications?.length === 0 && (
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