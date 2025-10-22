/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ObserverLayout } from "@/components/layout/ObserverLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Loader2, 
  Briefcase, 
  Bell, 
  TrendingUp, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { useRecruiterDashboard } from "@/hooks/useRecruiterDashboard";
import { useRecruiterActivity } from "@/hooks/useRecruiterActivity";
import { useCampaignStats } from "@/hooks/useCampaignStats";
import { ActivityHistoryModal } from "@/components/modals/ActivityHistoryModal";
import { DashboardToggle } from "@/components/ui/DashboardToggle";
import { CampaignSelector } from "@/components/ui/CampaignSelector";
import { useCampaign } from "@/contexts/CampaignContext";
import { ModernSelect } from '@/components/ui/ModernSelect';
import { DIRECTION_OPTIONS, classifyJobByDirection } from '@/config/directions';
import { CAMPAIGN_OPTIONS } from '@/config/campaigns';
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
  PieChart as RechartsPieChart,
  Pie,
  Legend
} from 'recharts';

// Import du dashboard avancé observateur
import ObserverAdvancedDashboard from "./ObserverAdvancedDashboard";

export default function ObserverDashboard() {
  const { selectedCampaignId } = useCampaign();
  
  
  const { 
    stats, 
    jobCoverage, 
    statusEvolution, 
    applicationsPerJob, 
    isLoading, 
    error 
  } = useRecruiterDashboard(selectedCampaignId);
  const { data: activities, isLoading: isLoadingActivities, error: errorActivities } = useRecruiterActivity();
  const { data: campaignStats, isLoading: isLoadingCampaignStats } = useCampaignStats();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState<'classic' | 'advanced'>('classic');
  const [attractiviteFilter, setAttractiviteFilter] = useState<string>('direction-exploitation-electricite');
  const [dynamiqueFilter, setDynamiqueFilter] = useState<string>('direction-exploitation-electricite');

  // Si la vue avancée est sélectionnée, afficher le dashboard avancé
  if (dashboardView === 'advanced') {
    return (
      <ObserverLayout>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Basculement entre les vues */}
          <DashboardToggle 
            currentView={dashboardView} 
            onToggle={setDashboardView} 
          />
          
          {/* Dashboard Avancé Observateur */}
          <ObserverAdvancedDashboard />
        </div>
      </ObserverLayout>
    );
  }

  // Vue classique (dashboard original)
  if (error) {
    return (
      <ObserverLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur lors du chargement: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </ObserverLayout>
    );
  }

  return (
    <ObserverLayout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Sélecteur de campagne */}
        <div className="mb-4">
          <CampaignSelector />
        </div>

        {/* Basculement entre les vues */}
        <DashboardToggle 
          currentView={dashboardView} 
          onToggle={setDashboardView} 
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Tableau de Bord Observateur</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Visualisez les Offres d'emploi et suivez les candidatures en temps réel
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col sm:flex-row justify-center items-center py-8 sm:py-12 gap-2">
            <Loader2 className="w-6 h-6 sm:w-8 animate-spin text-primary" />
            <span className="text-sm sm:text-base">Chargement du dashboard...</span>
          </div>
        ) : (
          <>
            {/* Stats Cards - Campagne 2025 (à partir du 27/09/2025) */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  Nouvelle Campagne
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Données à partir du 27/09/2025
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Offres de la campagne */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                      Offres Campagne
                    </CardTitle>
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      stats.totalJobs
                    )}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {selectedCampaignId === 'global' 
                      ? 'Publiées' 
                      : selectedCampaignId === 'campaign-1' 
                      ? (
                        <>
                          Clôturées<br />
                          <span className="text-blue-900 dark:text-blue-100">Dont 3 relancées à la campagne 2</span>
                        </>
                      )
                      : 'Actives'}
                  </p>
                </CardContent>
              </Card>

              {/* Candidats de la campagne */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                      Candidats Campagne
                    </CardTitle>
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                    {isLoadingCampaignStats ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      campaignStats?.total_candidates || 0
                    )}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Candidats éligibles
                  </p>
                </CardContent>
              </Card>

              {/* Candidatures de la campagne */}
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Candidatures Campagne
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {isLoadingCampaignStats ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      campaignStats?.total_applications || 0
                    )}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Total candidatures
                  </p>
                </CardContent>
              </Card>

              {/* Taux de couverture campagne */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
                      Couverture Campagne
                    </CardTitle>
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : stats.totalJobs > 0 ? (
                      Math.round((jobCoverage.filter(job => job.current_applications > 0).length / stats.totalJobs) * 100)
                    ) : (
                      0
                    )}%
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Postes avec candidats
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Deuxième rangée de KPIs - Affichage deux par deux sur mobile */}
            <div className={`grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 ${
              selectedCampaignId === 'campaign-2' || selectedCampaignId === 'campaign-3' 
                ? 'lg:grid-cols-2' 
                : 'lg:grid-cols-3'
            }`}>
              {/* Candidats multi-postes */}
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">
                      Candidats multi-postes
                    </CardTitle>
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.multiPostCandidates ?? 0}
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Candidats
                  </p>
                </CardContent>
              </Card>

              {/* Taux de couverture */}
              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-cyan-200 dark:border-cyan-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-cyan-700 dark:text-cyan-300">
                      Taux de couverture
                    </CardTitle>
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                    {jobCoverage.length > 0 ? Math.round((jobCoverage.filter(job => job.current_applications > 0).length / jobCoverage.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                    Postes avec candidats
                  </p>
                </CardContent>
              </Card>

              {/* Entretiens */}
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      Entretiens
                    </CardTitle>
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    {stats.interviewsScheduled}
                  </div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    Planifiés
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section - Affichage deux par deux */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              {/* Coverage Rate Chart - Masqué en vue globale */}
              {selectedCampaignId !== 'global' && (
               <Card>
                 <CardHeader className="pb-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <Target className="h-5 w-5 text-primary" />
                       <CardTitle className="text-base sm:text-lg">Attractivité des candidatures</CardTitle>
                     </div>
                     {selectedCampaignId === 'campaign-3' && (
                       <div className="w-48">
                         <ModernSelect
                           options={DIRECTION_OPTIONS}
                           value={attractiviteFilter}
                           onChange={setAttractiviteFilter}
                           placeholder="Sélectionner une direction"
                           className="w-full"
                         />
                       </div>
                     )}
                   </div>
                   <p className="text-sm text-muted-foreground">
                     Basé sur le nombre de candidatures reçues - 2 offres par catégorie
                   </p>
                 </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(() => {
                        // Filtrer par direction si on est en campagne 3
                        let filteredJobs = [...jobCoverage];
                        
                        if (selectedCampaignId === 'campaign-3') {
                          filteredJobs = jobCoverage.filter(job => {
                            const jobDirection = classifyJobByDirection(job.title);
                            return jobDirection === attractiviteFilter;
                          });
                        }
                        
                        // Filtrer et organiser les données pour avoir 2 offres par catégorie
                        const excellent = filteredJobs.filter(job => job.coverage_status === 'excellent').slice(0, 2);
                        const good = filteredJobs.filter(job => job.coverage_status === 'good').slice(0, 2);
                        const moderate = filteredJobs.filter(job => job.coverage_status === 'moderate').slice(0, 2);
                        const low = filteredJobs.filter(job => job.coverage_status === 'low').slice(0, 2);
                        
                        // Combiner toutes les catégories
                        return [...excellent, ...good, ...moderate, ...low];
                      })()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis 
                          dataKey="title" 
                          tick={{ fontSize: 10 }}
                          interval={0}
                          height={60}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            value,
                            'Nombre de candidatures'
                          ]}
                          labelFormatter={(value) => {
                            const job = jobCoverage.find(j => j.title === value);
                            return `${value} (${job?.current_applications} candidatures)`;
                          }}
                        />
                        <Bar 
                          dataKey="current_applications" 
                          radius={[4, 4, 0, 0]}
                          name="Nombre de candidatures"
                        >
                          {(() => {
                            const excellent = jobCoverage.filter(job => job.coverage_status === 'excellent').slice(0, 2);
                            const good = jobCoverage.filter(job => job.coverage_status === 'good').slice(0, 2);
                            const moderate = jobCoverage.filter(job => job.coverage_status === 'moderate').slice(0, 2);
                            const low = jobCoverage.filter(job => job.coverage_status === 'low').slice(0, 2);
                            
                            const allJobs = [...excellent, ...good, ...moderate, ...low];
                            
                            return allJobs.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`}
                                fill={
                                  entry.coverage_status === 'excellent' ? '#10b981' :
                                  entry.coverage_status === 'good' ? '#3b82f6' :
                                  entry.coverage_status === 'moderate' ? '#f59e0b' :
                                  '#ef4444'
                                }
                              />
                            ));
                          })()}
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
              )}

              {/* Applications per Job Chart - Masqué en vue globale */}
              {selectedCampaignId !== 'global' && (
               <Card>
                 <CardHeader className="pb-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <BarChart3 className="h-5 w-5 text-primary" />
                       <CardTitle className="text-base sm:text-lg">Dynamique des candidatures par offre</CardTitle>
                     </div>
                     {selectedCampaignId === 'campaign-3' && (
                       <div className="w-48">
                         <ModernSelect
                           options={DIRECTION_OPTIONS}
                           value={dynamiqueFilter}
                           onChange={setDynamiqueFilter}
                           placeholder="Sélectionner une direction"
                           className="w-full"
                         />
                       </div>
                     )}
                   </div>
                 </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(() => {
                        // Filtrer par direction si on est en campagne 3
                        let filteredJobs = [...applicationsPerJob];
                        
                        if (selectedCampaignId === 'campaign-3') {
                          filteredJobs = applicationsPerJob.filter(job => {
                            const jobDirection = classifyJobByDirection(job.title);
                            return jobDirection === dynamiqueFilter;
                          });
                        }
                        
                        return filteredJobs.slice(0, 8);
                      })()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                          fill="#8B5CF6" 
                          radius={[4, 4, 0, 0]}
                          name="Total candidatures"
                        />
                        <Bar 
                          dataKey="new_applications_24h" 
                          fill="#EC4899" 
                          radius={[4, 4, 0, 0]}
                          name="Nouvelles (24h)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Status Evolution Chart */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">Évolution des statuts par jour</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statusEvolution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            // La date est déjà au format YYYY-MM-DD, on peut l'afficher directement
                            const [year, month, day] = value.split('-');
                            return `${day}/${month}`;
                          }}
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
                          stroke="#EC4899" 
                          fill="#EC4899" 
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

              {/* Gender Distribution - masqué pour campagnes 2 et 3 */}
              {selectedCampaignId !== 'campaign-2' && selectedCampaignId !== 'campaign-3' && (
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
                          formatter={(value: number, name: string, props: any) => [
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
                          formatter={(value, entry: any) => {
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
              )}
            </div>

            {/* Quick Actions - Version Observateur */}
            <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-soft hover:shadow-medium transition-all">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/observer/candidates" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2 text-xs sm:text-sm">
                      <Users className="w-3 h-3 sm:w-4" />
                      Voir tous les candidats
                    </Button>
                  </Link>
                  <Link to="/jobs" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2 text-xs sm:text-sm">
                      <Eye className="w-3 h-3 sm:w-4" />
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
                      <Loader2 className="w-5 h-5 sm:w-6 animate-spin text-primary" />
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

        {/* Activity History Modal */}
        <ActivityHistoryModal 
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      </div>
    </ObserverLayout>
  );
}
