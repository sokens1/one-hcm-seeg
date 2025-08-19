import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRecruiterJobOffers } from "@/hooks/useJobOffers";

export default function RecruiterJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const recruiterId = user?.id;
  const { data: jobs = [], isLoading, error } = useRecruiterJobOffers(recruiterId);
  
  const handleEditJob = (jobId: string | number) => {
    navigate(`/recruiter/jobs/${jobId}/edit`);
  };

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Postes à pourvoir</h1>
          <p className="text-muted-foreground">
            Gérez toutes vos offres d'emploi et suivez les candidatures
          </p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button variant="hero" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Créer une offre
          </Button>
        </Link>
      </div>

      {/* Statistiques */}
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offres Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{jobs.filter(j => j.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Offres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{jobs.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offres Inactives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{jobs.filter(j => j.status !== 'active').length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Candidatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{jobs.reduce((acc, job) => acc + (job.application_count || 0), 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des offres */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Toutes les offres</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-12 justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Chargement des offres...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            Une erreur est survenue lors du chargement des offres.
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <Card className="hover:shadow-medium transition-all cursor-pointer group h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary-dark transition-colors">
                      {job.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.contract_type}</span>
                      <span>•</span>
                      <Badge variant={job.status === 'active' ? 'secondary' : 'default'}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-foreground pt-2">
                      <strong>{job.application_count}</strong> {job.application_count === 1 ? 'candidature' : 'candidatures'}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Link to={`/recruiter/jobs/${job.id}/pipeline`} className="flex-1">
                        <Button variant="hero" size="sm" className="gap-2 w-full">
                          <Eye className="w-4 h-4" />
                          Voir le Pipeline
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 px-3"
                        onClick={() => handleEditJob(job.id)}
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        )}
      </div>
      </div>
    </RecruiterLayout>
  );
}