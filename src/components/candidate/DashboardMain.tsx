import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FileText, MapPin, Calendar, Eye, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { useApplications } from "@/hooks/useApplications";
import { useJobOffers } from "@/hooks/useJobOffers";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ContentSpinner } from "@/components/ui/spinner";
import type { Application } from '@/types/application';
import { exportApplicationPdf } from '@/utils/exportPdfUtils';
import { supabase } from "@/integrations/supabase/client";

export function DashboardMain() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: applications, isLoading: isLoadingApps, error: errorApps } = useApplications();
  const { data: jobOffers, isLoading: isLoadingJobs, error: errorJobs } = useJobOffers();
  const [candidateAudience, setCandidateAudience] = useState<string | null>(null);

  // Fetch user's candidate_status (interne/externe) - même logique que JobCatalog
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = user?.id || auth?.user?.id;
        if (!uid) {
          setCandidateAudience(null);
          return;
        }
        const { data } = await supabase
          .from('users')
          .select('candidate_status, matricule')
          .eq('id', uid)
          .maybeSingle();
        if (!cancelled) {
          const row = data as { candidate_status?: string | null; matricule?: string | null } | null;
          const inferred = row?.candidate_status ?? (row?.matricule ? 'interne' : 'externe');
          setCandidateAudience(inferred ?? null);
        }
      } catch {
        if (!cancelled) setCandidateAudience(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Harmoniser le comptage avec le catalogue: exclure les offres de démonstration/fallback
  const baseJobs = (jobOffers || []).filter(j => !String(j.id).startsWith('fallback-') && j.recruiter_id !== 'fallback-recruiter');
  
  // Le filtre par audience (interne/externe) est appliqué dans useJobOffers
  // Les offres retournées sont déjà filtrées selon le statut du candidat
  const visibleJobOffers = baseJobs;
  
  // Debug: Log job offers count (après filtration identique au catalogue)
  console.log('🔍 [DashboardMain] Offres visibles (après filtre audience):', visibleJobOffers.length, 'candidateAudience:', candidateAudience);

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
    return <ContentSpinner text="Chargement des données du tableau de bord..." />;
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
    <div className="space-y-6 sm:space-y-8">
      {/* Section d'Accueil */}
      <div className="text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Tableau de bord</h2>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
          Bonjour {user?.user_metadata.first_name}, voici le suivi de votre parcours de recrutement avec nous.
        </p>
      </div>

      {/* Indicateurs clés (Save bar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Candidatures en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-primary">{applications?.length || 0}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {(applications?.length || 0) > 1 ? "candidatures actives" : "candidature active"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Offres correspondantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-primary">{visibleJobOffers.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {visibleJobOffers.length === 1 ? 'poste disponible' : 'postes disponibles'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section "Mes Candidatures" */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Accès rapide à mes candidatures</CardTitle>
          
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-48">
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
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type de poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Types de contrats</SelectItem>
                {uniqueContracts.map(contract => (
                  <SelectItem key={contract} value={contract}>{contract}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Vue Carte des Candidatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="border hover:shadow-md transition-shadow relative">
                <div className="absolute top-3 right-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => {
                          // Naviguer vers la page de suivi
                          navigate(`/candidate/application/${application.id}`);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Voir le suivi</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await exportApplicationPdf(application, application.job_offers?.title || 'Candidature', application.job_offers?.status_offerts);
                          } catch (error) {
                            console.error('Error exporting PDF:', error);
                            // Vous pourriez vouloir afficher une notification d'erreur ici
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Télécharger PDF</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardHeader className="pb-3 pr-12">
                  <CardTitle className="text-base sm:text-lg line-clamp-2">{application.job_offers?.title}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">{application.job_offers?.contract_type}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{application.job_offers?.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Déposée le {format(new Date(application.created_at), 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                  <div className="pt-2">
                    <Badge variant="secondary" className="mb-3 text-xs">
                      {application.status}
                    </Badge>
                  </div>
                  {/* <Button asChild className="w-full gap-2 text-xs sm:text-sm">
                    <Link to={`/candidate/application/${application.id}`}>
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Voir le suivi détaillé</span>
                      <span className="sm:hidden">Voir détails</span>
                    </Link>
                  </Button> */}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm sm:text-base text-muted-foreground">Aucune candidature ne correspond aux filtres sélectionnés.</p>
              <Button 
                variant="outline" 
                className="mt-4 text-xs sm:text-sm"
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