import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useApplications } from "@/hooks/useApplications";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FullPageSpinner } from "@/components/ui/spinner";

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
    return <FullPageSpinner text="Chargement de vos candidatures..." />;
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
      <div className="space-y-6 sm:space-y-8 px-3 sm:px-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Mes candidatures</h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Suivi détaillé de toutes vos candidatures en cours
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {applications?.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg leading-tight">{application.job_offers?.title}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">{application.job_offers?.contract_type}</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{application.job_offers?.location}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">Candidature déposée le {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr })}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {application.status}
                  </Badge>
                </div>

                <Button asChild className="w-full gap-2 text-xs sm:text-sm">
                  <Link to={`/candidate/application/${application.id}`}>
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    Voir le suivi détaillé
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {applications?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Vous n'avez encore aucune candidature en cours.
              </p>
              <Button asChild className="text-sm sm:text-base">
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