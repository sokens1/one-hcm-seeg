import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Eye, 
  Users, 
  Edit, 
  Loader2, 
  Plus, 
  Bell, 
  BarChart3,
  Target
} from "lucide-react";
import { 
  AdvancedHistogram, 
  AdvancedLineChart, 
  MetricCard, 
  StatusDistributionChart 
} from "@/components/ui/AdvancedCharts";
import { Link, useNavigate } from "react-router-dom";
import { useRecruiterDashboard } from "@/hooks/useRecruiterDashboard";
import { useAdvancedRecruiterStats } from "@/hooks/useAdvancedRecruiterStats";
import { useAuth } from "@/hooks/useAuth";
import { useRecruiterActivity } from "@/hooks/useRecruiterActivity";
import { ActivityHistoryModal } from "@/components/modals/ActivityHistoryModal";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export default function AdvancedDashboard() {
  const navigate = useNavigate();
  const { stats, activeJobs, isLoading, error } = useRecruiterDashboard();
  const { stats: advancedStats, isLoading: isLoadingAdvancedStats, error: advancedStatsError } = useAdvancedRecruiterStats(activeJobs.length);
  const { data: activities, isLoading: isLoadingActivities, error: errorActivities } = useRecruiterActivity();
  const { isRecruiter } = useAuth();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [hideActiveListings, setHideActiveListings] = useState(false);

  const handleEditJob = (jobId: string) => {
    navigate(`/recruiter/jobs/${jobId}/edit`);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm sm:text-base text-red-500 mb-4">Erreur lors du chargement: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="text-sm sm:text-base">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Header avec titre moderne */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Recruiter & Observer Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tableau de bord moderne pour la gestion des candidatures et l'analyse des données
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

      {/* Contrôle pour masquer les offres actives */}
      <Card className="mb-6 shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="hide-active-listings"
              checked={hideActiveListings}
              onCheckedChange={setHideActiveListings}
            />
            <Label htmlFor="hide-active-listings" className="flex items-center gap-2 cursor-pointer">
              <Users className="w-4 h-4" />
              Masquer les Offres Actives
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col sm:flex-row justify-center items-center py-8 sm:py-12 gap-2">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          <span className="text-sm sm:text-base">Chargement du dashboard...</span>
        </div>
      ) : (
        <>
          {/* KPIs Modernes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <MetricCard
              title="Total Applications"
              value={advancedStats?.totalApplications || 0}
              change={{ value: 12, type: 'increase' }}
              icon={Users}
              color="blue"
            />
            
            <MetricCard
              title="Coverage Rate"
              value={`${advancedStats?.coverageRate || 0}%`}
              icon={BarChart3}
              color="green"
            />
            
            <MetricCard
              title="Open Positions"
              value={advancedStats?.openPositions || 0}
              icon={Target}
              color="purple"
            />
          </div>

          {/* Visualisations des données */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Histogramme des candidatures par poste */}
            {isLoadingAdvancedStats ? (
              <div className="col-span-2 flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <AdvancedHistogram
                  title="Applications by Position"
                  data={advancedStats?.applicationsByPosition.slice(0, 6).map(item => ({
                    label: item.position,
                    value: item.count,
                    color: '#3B82F6'
                  })) || []}
                  height={250}
                />

                <AdvancedLineChart
                  title="Status Evolution"
                  data={advancedStats?.statusEvolution.slice(0, 6).map(month => ({
                    period: month.month,
                    values: {
                      applied: month.applied,
                      interview: month.interview,
                      offer: month.offer,
                      rejected: month.rejected
                    }
                  })) || []}
                  series={[
                    { key: 'applied', label: 'Applied', color: '#3B82F6' },
                    { key: 'interview', label: 'Interview', color: '#10B981' },
                    { key: 'offer', label: 'Offer', color: '#F59E0B' },
                    { key: 'rejected', label: 'Rejected', color: '#EF4444' }
                  ]}
                  height={250}
                />
              </>
            )}
          </div>

          {/* Graphique de répartition par statut */}
          {!isLoadingAdvancedStats && advancedStats && (
            <div className="mb-8">
              <StatusDistributionChart data={advancedStats.applicationsByStatus} />
            </div>
          )}

          {/* Section des offres actives (conditionnelle) */}
          {!hideActiveListings && (
            <div className="space-y-4 sm:space-y-6 mb-8">
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
          )}

          {/* Actions rapides et Activité récente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <Bell className="h-4 w-4 sm:h-5 sm:h-5" />
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
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs sm:text-sm"
                        onClick={() => setIsHistoryModalOpen(true)}
                      >
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
        </>
      )}

      {/* Footer avec source des données */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Real-time data powered by Supabase
        </p>
      </div>

      {/* Activity History Modal */}
      <ActivityHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </>
  );
}
