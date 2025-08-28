import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Briefcase, Plus, Edit, LayoutGrid, List, Download, Loader2 } from "lucide-react";
import { useCandidateLayout } from "@/components/layout/CandidateLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useApplications } from "@/hooks/useApplications";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportApplicationPdf } from '@/utils/exportPdfUtils';

// Statuts et couleurs correspondants
const statusConfig = {
  candidature: { label: "Candidature reçue", color: "bg-blue-100 text-blue-800" },
  incubation: { label: "En évaluation", color: "bg-yellow-100 text-yellow-800" },
  embauche: { label: "Embauché", color: "bg-green-100 text-green-800" },
  refuse: { label: "Refusé", color: "bg-red-100 text-red-800" },
};

export function CandidateApplications() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { setCurrentView } = useCandidateLayout();
  const { data: applications, isLoading, error } = useApplications();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row justify-center items-center py-8 sm:py-12 gap-2">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
        <span className="text-sm sm:text-base">Chargement de vos candidatures...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 text-red-600 px-4">
        <p className="text-sm sm:text-base">Une erreur est survenue : {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold">Mes candidatures</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Suivi détaillé de toutes vos candidatures
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} className="h-8 w-8 sm:h-10 sm:w-10">
            <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} className="h-8 w-8 sm:h-10 sm:w-10">
            <List className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="sr-only">List View</span>
          </Button>
        </div>
      </div>

      {applications && applications.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2" : "flex flex-col gap-3 sm:gap-4"}>
          {applications.map((application) => {
            const statusInfo = statusConfig[application.status] || { label: application.status, color: "bg-gray-100 text-gray-800" };
            // L'édition est désactivée, calcul de canModify supprimé

            return (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 sm:pb-4 md:pb-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-2 min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg md:text-xl line-clamp-2">{application.job_offers?.title || 'Titre non disponible'}</CardTitle>
                      <div className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm md:text-sm text-muted-foreground">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                          <span className="flex items-center gap-1 min-w-0">
                            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{application.job_offers?.contract_type || 'N/A'}</span>
                          </span>
                          <span className="truncate">{application.job_offers?.location || 'N/A'}</span>
                        </div>
                        <span className="text-xs sm:text-sm md:text-sm whitespace-nowrap">
                          Candidature du {format(new Date(application.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${statusInfo.color} text-xs md:text-sm whitespace-nowrap flex-shrink-0`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-2 md:gap-3">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-2 w-full">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-1 md:gap-2 text-xs sm:text-sm md:text-sm h-8 md:h-9 flex-1"
                            onClick={() => {
                              setCurrentView("tracking");
                              navigate(`/candidate/dashboard?view=tracking&id=${application.id}&from=applications`);
                            }}
                          >
                            <Eye className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden md:inline">Voir le suivi</span>
                            <span className="md:hidden">Suivi</span>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-1 md:gap-2 text-xs sm:text-sm md:text-sm h-8 md:h-9 flex-1"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await exportApplicationPdf(application, application.job_offers?.title || 'Candidature');
                              } catch (error) {
                                console.error('Error exporting PDF:', error);
                                // Vous pourriez vouloir afficher une notification d'erreur ici
                              }
                            }}
                          >
                            <Download className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden md:inline">Télécharger PDF</span>
                            <span className="md:hidden">PDF</span>
                          </Button>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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