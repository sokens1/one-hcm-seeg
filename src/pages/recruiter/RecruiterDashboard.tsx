import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Edit, Loader2, Plus, Briefcase, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRecruiterDashboard } from "@/hooks/useRecruiterDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useRecruiterActivity } from "@/hooks/useRecruiterActivity";

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { stats, activeJobs, isLoading, error } = useRecruiterDashboard();
  const { data: activities, isLoading: isLoadingActivities, error: errorActivities } = useRecruiterActivity();
  const { isRecruiter } = useAuth();

  const handleEditJob = (jobId: string) => {
    navigate(`/recruiter/jobs/${jobId}/edit`);
  };

  if (error) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-sm sm:text-base text-red-500 mb-4">Erreur lors du chargement: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="text-sm sm:text-base">
              Réessayer
            </Button>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Tableau de Bord</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gérez vos Offres d'emploi et suivez vos candidatures en temps réel
            </p>
          </div>
          {isRecruiter && (
            <Link to="/recruiter/jobs/new">
              <Button variant="hero" className="gap-2 text-sm sm:text-base">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                Créer une offre
              </Button>
            </Link>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col sm:flex-row justify-center items-center py-8 sm:py-12 gap-2">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
            <span className="text-sm sm:text-base">Chargement du dashboard...</span>
          </div>
        ) : (
          <>
            {/* Stats Cards - version dynamique */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="shadow-soft hover:shadow-medium transition-all animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total candidats
                  </CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-ocean flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.totalCandidates}</div>
                  <p className="text-xs text-orange-500 font-medium animate-bounce">+{stats.newCandidates} aux derniers 24h</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-all animate-fade-in" style={{ animationDelay: '100ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    % Hommes candidats
                  </CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{(stats.malePercent ?? 0).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">parmi les candidats uniques</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-all animate-fade-in" style={{ animationDelay: '200ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    % Femmes candidates
                  </CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{(stats.femalePercent ?? 0).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">parmi les candidats uniques</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-medium transition-all animate-fade-in" style={{ animationDelay: '300ms' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Candidats multi-postes
                  </CardTitle>
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.multiPostCandidates ?? 0}</div>
                  <p className="text-xs text-muted-foreground">ont postulé à plusieurs postes</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Jobs Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">
                  Offres actives ({activeJobs.length})
                </h2>
              </div>

              {activeJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {activeJobs.map((job, index) => (
                    <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <Card className="hover:shadow-medium transition-all cursor-pointer group h-full">
                        <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                          <div className="flex-1 space-y-3">
                            <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary-dark transition-colors line-clamp-2">
                              {job.title}
                            </h3>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <span className="truncate">{job.location}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="truncate">{job.contract_type}</span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="bg-success-light text-success-foreground text-xs">
                                {job.candidate_count} candidats
                              </Badge>
                              {job.new_candidates > 0 && (
                                <Badge variant="default" className="bg-warning text-warning-foreground animate-bounce-soft text-xs">
                                  {job.new_candidates} nouveaux
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border/50">
                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                              <Link to={`/recruiter/jobs/${job.id}/pipeline`} className="flex-1">
                                <Button variant="hero" size="sm" className="gap-2 w-full text-xs sm:text-sm h-8 sm:h-9">
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">Voir le pipeline</span>
                                  <span className="sm:hidden">Pipeline</span>
                                </Button>
                              </Link>
                              {isRecruiter && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 px-2 sm:px-3 text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0"
                                  onClick={() => handleEditJob(job.id)}
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">Modifier</span>
                                  <span className="sm:hidden">Éditer</span>
                                </Button>
                              )}
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
                    {isRecruiter && (
                      <Link to="/recruiter/jobs/new">
                        <Button variant="hero">
                          Créer ma première offre
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isRecruiter && (
                <Link to="/recruiter/jobs/new" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2 text-xs sm:text-sm">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    Créer une nouvelle offre
                  </Button>
                </Link>
              )}
              <Link to="/recruiter/candidates" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  Voir tous les candidats
                </Button>
              </Link>
              <Link to="/jobs" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 text-xs sm:text-sm">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  Espace candidature
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Activité récente</CardTitle>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
                </div>
              ) : errorActivities ? (
                <p className="text-red-500 text-xs sm:text-sm">Erreur de chargement des activités</p>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-3 text-xs sm:text-sm">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="truncate pr-2 min-w-0" title={`${activity.description} pour ${activity.job_title}`}>
                        {activity.description} pour <strong className="font-medium">{activity.job_title}</strong>
                      </span>
                      <Badge variant="outline" className="text-xs flex-shrink-0 self-start sm:self-center">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: fr })}
                      </Badge>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button variant="link" className="p-0 h-auto text-xs sm:text-sm">
                      Voir tout l'historique
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs sm:text-sm text-center py-4">Aucune activité récente.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RecruiterLayout>
  );
}