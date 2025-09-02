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
  Target,
  TrendingUp,
  FileText,
  UserCheck,
  Calendar
} from "lucide-react";
import { 
  AdvancedHistogram, 
  AdvancedLineChart,
  MetricCard, 
  StatusDistributionChart,
  ApplicationsPerJobChart
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
  const { stats, activeJobs, statusEvolution, applicationsPerJob, isLoading, error } = useRecruiterDashboard();
  const { stats: advancedStats, isLoading: isLoadingAdvancedStats, error: advancedStatsError } = useAdvancedRecruiterStats(activeJobs.length);
  const { data: activities, isLoading: isLoadingActivities, error: errorActivities } = useRecruiterActivity();
  const { isRecruiter } = useAuth();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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
            Traitement préléminaire avec l'IA embarquée
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Analyse IA des candidatures
          </p>
        </div>
        
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col sm:flex-row justify-center items-center py-8 sm:py-12 gap-2">
          <Loader2 className="w-6 h-6 sm:w-8 sm:w-8 animate-spin text-primary" />
          <span className="text-sm sm:text-base">Chargement du dashboard...</span>
        </div>
      ) : (
        <>
          

          {/* Visualisations des données */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Attractivité des candidatures (remplace Score de couverture par poste) */}
            
                {/* Graphique d'évolution des statuts par jour avec nouvelle couleur */}
                {/* <AdvancedLineChart
                  title="Évolution des statuts par jour"
                  data={statusEvolution.map(day => ({
                    period: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                    values: {
                      candidature: day.candidature,
                      incubation: day.incubation,
                      embauche: day.embauche,
                      refuse: day.refuse
                    }
                  }))}
                  series={[
                    { key: 'candidature', label: 'Candidature', color: '#EC4899' }, // Nouvelle couleur
                    { key: 'incubation', label: 'Incubation', color: '#F59E0B' },
                    { key: 'embauche', label: 'Embauche', color: '#10B981' },
                    { key: 'refuse', label: 'Refusé', color: '#EF4444' }
                  ]}
                  height={250}
                /> */}
            
          </div>

          
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
                    <Users className="w-3 h-3 sm:w-4 sm:w-4" />
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
          Données en temps réel alimentées par Supabase
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
