import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Loader2, 
  Plus, 
  Briefcase, 
  Bell, 
  TrendingUp, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRecruiterDashboard } from "@/hooks/useRecruiterDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useRecruiterActivity } from "@/hooks/useRecruiterActivity";
import { ActivityHistoryModal } from "@/components/modals/ActivityHistoryModal";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Legend
} from "recharts";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useState } from 'react';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { 
    stats, 
    jobCoverage, 
    statusEvolution, 
    applicationsPerJob, 
    isLoading, 
    error 
  } = useRecruiterDashboard();
  const { data: activities, isLoading: isLoadingActivities, error: errorActivities } = useRecruiterActivity();
  const { isRecruiter } = useAuth();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">Vue d'ensemble de vos recrutements</p>
          </div>
          {isRecruiter && (
            <Link to="/recruiter/jobs/new">
              <Button variant="hero" className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Nouvelle offre
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards - Mobile First Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Candidats */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                      Total Candidats
                    </CardTitle>
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalCandidates}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    +{stats.newCandidates} ce jour
                  </p>
                </CardContent>
              </Card>

              {/* Offres Actives */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                      Offres Actives
                    </CardTitle>
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.totalJobs}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    En cours
                  </p>
                </CardContent>
              </Card>

              {/* Entretiens */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">
                      Entretiens
                    </CardTitle>
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.interviewsScheduled}
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Planifiés
                  </p>
                </CardContent>
              </Card>

              {/* Multi-postes */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
                      Multi-postes
                    </CardTitle>
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.multiPostCandidates ?? 0}
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Candidats
                  </p>
                </CardContent>
              </Card>
            </div>

                         {/* Charts Section - Two per Row Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
               {/* Coverage Rate Chart */}
               <Card>
                 <CardHeader className="pb-3">
                   <div className="flex items-center gap-2">
                     <Target className="h-5 w-5 text-primary" />
                     <CardTitle className="text-base sm:text-lg">Score de couverture par poste</CardTitle>
                   </div>
                   <p className="text-sm text-muted-foreground">
                     Basé sur le nombre de candidatures reçues
                   </p>
                 </CardHeader>
                 <CardContent>
                   <div className="h-64 sm:h-80">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={jobCoverage.slice(0, 8)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                         <XAxis 
                           dataKey="title" 
                           tick={{ fontSize: 10 }}
                           interval={0}
                           height={60}
                           angle={-45}
                           textAnchor="end"
                         />
                         <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                         <Tooltip 
                           formatter={(value: number, name: string) => [
                             name === 'coverage_rate' ? `${value}%` : value,
                             name === 'coverage_rate' ? 'Score de couverture' : 'Candidatures'
                           ]}
                           labelFormatter={(value) => {
                             const job = jobCoverage.find(j => j.title === value);
                             return `${value} (${job?.current_applications} candidatures)`;
                           }}
                         />
                         <Bar 
                           dataKey="coverage_rate" 
                           radius={[4, 4, 0, 0]}
                           name="coverage_rate"
                         >
                           {jobCoverage.slice(0, 8).map((entry, index) => (
                             <Cell 
                               key={`cell-${index}`}
                               fill={
                                 entry.coverage_status === 'excellent' ? '#10b981' :
                                 entry.coverage_status === 'good' ? '#3b82f6' :
                                 entry.coverage_status === 'moderate' ? '#f59e0b' :
                                 '#ef4444'
                               }
                             />
                           ))}
                         </Bar>
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                   {/* Legend */}
                   <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-green-500"></div>
                       <span>Excellent (≥10 candidatures)</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                       <span>Bon (7-9 candidatures)</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                       <span>Modéré (4-6 candidatures)</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500"></div>
                       <span>Faible (1-3 candidatures)</span>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               {/* Applications per Job Chart */}
               <Card>
                 <CardHeader className="pb-3">
                   <div className="flex items-center gap-2">
                     <BarChart3 className="h-5 w-5 text-primary" />
                     <CardTitle className="text-base sm:text-lg">Candidatures par offre</CardTitle>
                   </div>
                 </CardHeader>
                 <CardContent>
                   <div className="h-64 sm:h-80">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={applicationsPerJob.slice(0, 8)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                         <XAxis 
                           dataKey="title" 
                           tick={{ fontSize: 10 }}
                           interval={0}
                           height={60}
                           angle={-45}
                           textAnchor="end"
                         />
                         <YAxis tick={{ fontSize: 12 }} />
                         <Tooltip />
                         <Bar 
                           dataKey="applications_count" 
                           fill="#10b981" 
                           radius={[4, 4, 0, 0]}
                           name="Total candidatures"
                         />
                         <Bar 
                           dataKey="new_applications_24h" 
                           fill="#f59e0b" 
                           radius={[4, 4, 0, 0]}
                           name="Nouvelles (24h)"
                         />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </CardContent>
               </Card>

               {/* Status Evolution Chart */}
               <Card>
                 <CardHeader className="pb-3">
                   <div className="flex items-center gap-2">
                     <TrendingUp className="h-5 w-5 text-primary" />
                     <CardTitle className="text-base sm:text-lg">Évolution des statuts (7 jours)</CardTitle>
                   </div>
                 </CardHeader>
                 <CardContent>
                   <div className="h-64 sm:h-80">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={statusEvolution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                         <XAxis 
                           dataKey="date" 
                           tick={{ fontSize: 12 }}
                           tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                         />
                         <YAxis tick={{ fontSize: 12 }} />
                         <Tooltip 
                           labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                             weekday: 'long', 
                             year: 'numeric', 
                             month: 'long', 
                             day: 'numeric' 
                           })}
                         />
                         <Area 
                           type="monotone" 
                           dataKey="candidature" 
                           stackId="1" 
                           stroke="#3b82f6" 
                           fill="#3b82f6" 
                           fillOpacity={0.6}
                           name="Candidature"
                         />
                         <Area 
                           type="monotone" 
                           dataKey="incubation" 
                           stackId="1" 
                           stroke="#f59e0b" 
                           fill="#f59e0b" 
                           fillOpacity={0.6}
                           name="Incubation"
                         />
                         <Area 
                           type="monotone" 
                           dataKey="embauche" 
                           stackId="1" 
                           stroke="#10b981" 
                           fill="#10b981" 
                           fillOpacity={0.6}
                           name="Embauche"
                         />
                         <Area 
                           type="monotone" 
                           dataKey="refuse" 
                           stackId="1" 
                           stroke="#ef4444" 
                           fill="#ef4444" 
                           fillOpacity={0.6}
                           name="Refusé"
                         />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                 </CardContent>
               </Card>

               {/* Gender Distribution */}
               <Card>
                 <CardHeader className="pb-3">
                   <div className="flex items-center gap-2">
                     <PieChart className="h-5 w-5 text-primary" />
                     <CardTitle className="text-base sm:text-lg">Répartition par genre</CardTitle>
                   </div>
                   <p className="text-sm text-muted-foreground">
                     Distribution des candidats par genre
                   </p>
                 </CardHeader>
                 <CardContent>
                   <div className="h-64 sm:h-80">
                     <ResponsiveContainer width="100%" height="100%">
                       <RechartsPieChart>
                         <Pie
                           data={[
                             { 
                               name: 'Femmes', 
                               value: stats.femalePercent ?? 0, 
                               fill: '#ec4899',
                               candidates: Math.round((stats.femalePercent ?? 0) * (stats.totalCandidates ?? 0) / 100)
                             },
                             { 
                               name: 'Hommes', 
                               value: stats.malePercent ?? 0, 
                               fill: '#3b82f6',
                               candidates: Math.round((stats.malePercent ?? 0) * (stats.totalCandidates ?? 0) / 100)
                             },
                           ]}
                           cx="50%"
                           cy="50%"
                           outerRadius={80}
                           innerRadius={40}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {[
                             { name: 'Femmes', value: stats.femalePercent ?? 0, fill: '#ec4899' },
                             { name: 'Hommes', value: stats.malePercent ?? 0, fill: '#3b82f6' },
                           ].map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.fill} />
                           ))}
                         </Pie>
                         <Tooltip 
                           formatter={(value: number, name: string, props) => [
                             `${value.toFixed(1)}% (${props.payload.candidates} candidats)`,
                             name
                           ]}
                           contentStyle={{
                             backgroundColor: 'hsl(var(--background))',
                             border: '1px solid hsl(var(--border))',
                             borderRadius: '8px',
                             padding: '8px'
                           }}
                         />
                         <Legend 
                           verticalAlign="bottom" 
                           height={36}
                           formatter={(value, entry) => {
                             const candidates = Math.round((entry.payload.value) * (stats.totalCandidates ?? 0) / 100);
                             return (
                               <span style={{ color: entry.color, fontSize: '14px' }}>
                                 {value} ({(entry.payload.value).toFixed(1)}% - {candidates} candidats)
                               </span>
                             );
                           }}
                         />
                       </RechartsPieChart>
                     </ResponsiveContainer>
                   </div>
                 </CardContent>
               </Card>
             </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">Actions rapides</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isRecruiter && (
                    <Link to="/recruiter/jobs/new" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Plus className="w-4 h-4" />
                        Créer une nouvelle offre
                      </Button>
                    </Link>
                  )}
                  <Link to="/recruiter/candidates" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Users className="w-4 h-4" />
                      Voir tous les candidats
                    </Button>
                  </Link>
                  <Link to="/recruiter/jobs" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Briefcase className="w-4 h-4" />
                      Mes offres
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base sm:text-lg">Activité récente</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setIsHistoryModalOpen(true)}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="max-h-48 overflow-auto">
                  {isLoadingActivities ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : errorActivities ? (
                    <p className="text-red-500 text-center">Erreur de chargement</p>
                  ) : activities && activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate" title={`${activity.description} pour ${activity.job_title}`}>
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {activity.job_title}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: fr })}
                          </Badge>
                        </div>
                      ))}
                      <div className="pt-2 text-center">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-sm"
                          onClick={() => setIsHistoryModalOpen(true)}
                        >
                          Voir tout l'historique
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Aucune activité récente</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Activity History Modal */}
        <ActivityHistoryModal 
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      </div>
    </RecruiterLayout>
  );
}