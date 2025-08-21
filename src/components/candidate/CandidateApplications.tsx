import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Briefcase, Plus, Edit, LayoutGrid, List } from "lucide-react";
import { useCandidateLayout } from "@/components/layout/CandidateLayout";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useApplications } from "@/hooks/useApplications";
import { Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Chargement de vos candidatures...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Une erreur est survenue : {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Mes candidatures</h2>
          <p className="text-muted-foreground">
            Suivi détaillé de toutes vos candidatures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="w-5 h-5" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
            <List className="w-5 h-5" />
            <span className="sr-only">List View</span>
          </Button>
        </div>
      </div>

      {applications && applications.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2" : "flex flex-col gap-4"}>
          {applications.map((application) => {
            const statusInfo = statusConfig[application.status] || { label: application.status, color: "bg-gray-100 text-gray-800" };
            const deadline = application.job_offers?.date_limite;
            const canModify = deadline ? new Date(deadline) > new Date() : false;

            return (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{application.job_offers?.title || 'Titre non disponible'}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {application.job_offers?.contract_type || 'N/A'}
                        </span>
                        <span>{application.job_offers?.location || 'N/A'}</span>
                        <span>Candidature du {format(new Date(application.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      {canModify && (
                        <Button
                          variant="secondary"
                          className="gap-2"
                          onClick={() => navigate(`/candidate/applications/${application.id}/edit?step=4`)}
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => {
                          setCurrentView("tracking");
                          navigate(`/candidate/dashboard?view=tracking&id=${application.id}&from=applications`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Voir le suivi détaillé
                      </Button>
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