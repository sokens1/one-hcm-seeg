import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Users, TrendingUp, Clock, BarChart3, Edit, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRecruiterDashboard } from "@/hooks/useRecruiterDashboard";
import { useRecruiterActivity } from "@/hooks/useRecruiterActivity";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { stats, activeJobs, isLoading, error } = useRecruiterDashboard();
  const { data: activities, isLoading: isLoadingActivities, error: errorActivities } = useRecruiterActivity();
  
  const handleEditJob = (jobId: string) => {
    navigate(`/recruiter/jobs/${jobId}/edit`);
  };

  if (error) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur lors du chargement: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de Bord</h1>
            <p className="text-muted-foreground">
              Gérez vos offres d'emploi et suivez vos candidatures en temps réel
            </p>
          </div>
          <Link to="/recruiter/jobs/new">
            <Button variant="hero" size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Créer une offre d'emploi
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Chargement du dashboard...</span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-soft hover:shadow-medium transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Offres Actives
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary-dark" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    +1 cette semaine
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Candidats
                  </CardTitle>
                  <Users className="h-4 w-4 text-ocean" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.totalCandidates}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.newCandidates} nouveaux
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Nouveaux Candidats
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.newCandidates}</div>
                  <p className="text-xs text-muted-foreground">
                    Dernières 24h
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Entretiens Planifiés
                  </CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stats.interviewsScheduled}</div>
                  <p className="text-xs text-muted-foreground">
                    Cette semaine
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Active Jobs Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Mes offres actives</h2>
                <Badge variant="secondary" className="bg-primary-dark text-white">
                  {activeJobs.length} offres
                </Badge>
              </div>

              {activeJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeJobs.map((job, index) => (
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
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="bg-success-light text-success-foreground">
                              {job.candidate_count} candidats
                            </Badge>
                            {job.new_candidates > 0 && (
                              <Badge variant="default" className="bg-warning text-warning-foreground animate-bounce-soft">
                                {job.new_candidates} nouveaux
                              </Badge>
                            )}
                          </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex gap-2">
                          <Link to={`/recruiter/jobs/${job.id}/pipeline`} className="flex-1">
                            <Button variant="hero" size="sm" className="gap-2 w-full">
                              <Eye className="w-4 h-4" />
                              Voir le pipeline
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
              ) : (
                <Card className="shadow-soft">
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucune offre active</h3>
                    <p className="text-muted-foreground mb-6">
                      Commencez par créer votre première offre d'emploi pour attirer les meilleurs talents.
                    </p>
                    <Link to="/recruiter/jobs/new">
                      <Button variant="hero">
                        Créer ma première offre
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/recruiter/jobs/new" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  Créer une nouvelle offre
                </Button>
              </Link>
              <Link to="/recruiter/candidates" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="w-4 h-4" />
                  Voir tous les candidats
                </Button>
              </Link>
              <Link to="/jobs" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Eye className="w-4 h-4" />
                  Espace candidature
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="text-lg">Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : errorActivities ? (
                <p className="text-red-500 text-sm">Erreur de chargement des activités</p>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-3 text-sm">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <span className="truncate pr-2" title={`${activity.description} pour ${activity.job_title}`}>
                        {activity.description} pour <strong>{activity.job_title}</strong>
                      </span>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: fr })}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">Aucune activité récente.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RecruiterLayout>
  );
}