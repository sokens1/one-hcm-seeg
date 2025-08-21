import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { FileText, MapPin, Calendar, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplications } from "@/hooks/useApplications";
import { useJobOffers } from "@/hooks/useJobOffers";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function DashboardMain() {
  const { user } = useAuth();
  const { data: applications, isLoading: isLoadingApps, error: errorApps } = useApplications();
  const { data: jobOffers, isLoading: isLoadingJobs, error: errorJobs } = useJobOffers();

  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredApplications = applications?.filter(app => {
    if (locationFilter !== "all" && app.job_offers?.location !== locationFilter) return false;
    if (typeFilter !== "all" && app.job_offers?.contract_type !== typeFilter) return false;
    return true;
  }) || [];

  const uniqueLocations = [...new Set(applications?.map(app => app.job_offers?.location).filter(Boolean) as string[] || [])];
  const uniqueContracts = [...new Set(applications?.map(app => app.job_offers?.contract_type).filter(Boolean) as string[] || [])];

  if (isLoadingApps || isLoadingJobs) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (errorApps || errorJobs) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Une erreur est survenue lors du chargement des données.</p>
        <p className="text-sm">{errorApps?.message || errorJobs?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section d'Accueil */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Tableau de bord</h2>
        <p className="text-lg text-muted-foreground">
          Bonjour {user?.user_metadata.first_name}, voici le suivi de votre parcours de recrutement avec nous.
        </p>
      </div>

      {/* Indicateurs clés (Save bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Candidatures en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{applications?.length || 0}</div>
            <p className="text-sm text-muted-foreground">
              {(applications?.length || 0) > 1 ? "candidatures actives" : "candidature active"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Offres correspondantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{jobOffers?.length || 0}</div>
            <p className="text-sm text-muted-foreground">
              {jobOffers?.length === 1 ? 'poste disponible' : 'postes disponibles'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section "Mes Candidatures" */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Accès rapide à mes candidatures</CardTitle>
          
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lieu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les lieux</SelectItem>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type de poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {uniqueContracts.map(contract => (
                  <SelectItem key={contract} value={contract}>{contract}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Vue Carte des Candidatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{application.job_offers?.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{application.job_offers?.contract_type}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {application.job_offers?.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Déposée le {format(new Date(application.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                  <div className="pt-2">
                    <Badge variant="secondary" className="mb-3">
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

          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune candidature ne correspond aux filtres sélectionnés.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setLocationFilter("all");
                  setTypeFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}