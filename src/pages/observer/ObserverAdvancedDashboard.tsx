import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  Target,
  Calendar,
  BarChart3,
  TrendingUp,
  Eye
} from "lucide-react";
import { useRecruiterDashboard } from "@/hooks/useRecruiterDashboard";
import { useRecruiterActivity } from "@/hooks/useRecruiterActivity";
import { useCampaign } from "@/contexts/CampaignContext";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

// Import des composants Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

export default function ObserverAdvancedDashboard() {
  const { selectedCampaignId } = useCampaign();
  const { 
    stats, 
    jobCoverage, 
    statusEvolution, 
    applicationsPerJob, 
    isLoading 
  } = useRecruiterDashboard(selectedCampaignId);
  
  const { data: activities } = useRecruiterActivity();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des données avancées...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Avancé - Mode Observateur</h2>
        <p className="text-muted-foreground">
          Analyse approfondie des données de recrutement (lecture seule)
        </p>
      </div>

      {/* KPIs Avancés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Taux de Conversion
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalCandidates > 0 ? Math.round((stats.interviewsScheduled / stats.totalCandidates) * 100) : 0}%
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Candidats → Entretiens
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Efficacité des Offres
              </CardTitle>
              <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {jobCoverage.length > 0 ? Math.round((jobCoverage.filter(job => job.current_applications >= 5).length / jobCoverage.length) * 100) : 0}%
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Offres performantes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Diversité Genre
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {Math.abs((stats.femalePercent ?? 0) - (stats.malePercent ?? 0))}%
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Écart de diversité
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Activité 24h
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.newCandidates}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Nouvelles candidatures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques Avancés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution temporelle des candidatures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des candidatures (7 jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statusEvolution}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="candidature" 
                    stroke="#EC4899" 
                    strokeWidth={2}
                    name="Candidatures"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="incubation" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Incubation"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution des candidatures par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Répartition par statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Candidature', value: statusEvolution.reduce((sum, day) => sum + day.candidature, 0), fill: '#EC4899' },
                  { name: 'Incubation', value: statusEvolution.reduce((sum, day) => sum + day.incubation, 0), fill: '#f59e0b' },
                  { name: 'Embauche', value: statusEvolution.reduce((sum, day) => sum + day.embauche, 0), fill: '#10b981' },
                  { name: 'Refusé', value: statusEvolution.reduce((sum, day) => sum + day.refuse, 0), fill: '#ef4444' },
                  { name: 'Entretien Programmé', value: statusEvolution.reduce((sum, day) => sum + (day.entretien_programme || 0), 0), fill: '#8b5cf6' },
                ]}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activités Récentes Détaillées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Activités Récentes Détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities && activities.slice(0, 10).map((activity, index) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.description} pour <span className="text-primary">{activity.job_title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Observateur
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informations Système */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Mode Observateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Fonctionnalités disponibles :</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Visualisation de toutes les données</li>
                <li>• Analyse des statistiques</li>
                <li>• Consultation des graphiques</li>
                <li>• Suivi des activités</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Fonctionnalités désactivées :</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Modification des offres</li>
                <li>• Évaluation des candidats</li>
                <li>• Ajout de commentaires</li>
                <li>• Changement de statuts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
