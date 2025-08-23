import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, Plus, Briefcase, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecruiterDashboard } from "@/hooks/useRecruiterDashboard";
import { useRecruiterActivity } from "@/hooks/useRecruiterActivity";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export default function RecruiterDashboard() {
  const { stats, activeJobs, isLoading, error } = useRecruiterDashboard();
  const { data: activities, isLoading: isLoadingActivities, error: errorActivities } = useRecruiterActivity();

  // Compact, chart-first dashboard

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
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 overflow-hidden">
        {/* Header + CTA */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-[12px] sm:text-sm text-muted-foreground">Suivi global des candidatures</p>
          </div>
          <Link to="/recruiter/jobs/new">
            <Button variant="hero" size="sm" className="gap-2">
              <Plus className="w-3 h-3" />
              <span className="hidden xs:inline">Nouvelle offre</span>
              <span className="xs:hidden">Nouveau</span>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* KPI: Candidats */}
            <Card className="shadow-soft">
              <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">Candidats</p>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalCandidates}</div>
                  <p className="text-[10px] sm:text-xs text-orange-500">+{stats.newCandidates} / 24h</p>
                </div>
                <Users className="w-5 h-5 text-ocean" />
              </CardContent>
            </Card>

            {/* KPI: Entretiens (incubation) */}
            <Card className="shadow-soft">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-muted-foreground">Entretiens</p>
                <div className="text-xl sm:text-2xl font-bold">{stats.interviewsScheduled}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">planifiés</p>
              </CardContent>
            </Card>

            {/* KPI: Offres actives */}
            <Card className="shadow-soft">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-muted-foreground">Offres actives</p>
                <div className="text-xl sm:text-2xl font-bold">{stats.totalJobs}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">en cours</p>
              </CardContent>
            </Card>

            {/* KPI: Multi-postes */}
            <Card className="shadow-soft">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs text-muted-foreground">Multi-postes</p>
                <div className="text-xl sm:text-2xl font-bold">{stats.multiPostCandidates ?? 0}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">candidats</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Row: Gender Donut + Candidates per job + New per job */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 overflow-hidden">
          {/* Gender donut */}
          <Card className="shadow-soft">
            <CardHeader className="py-3 pb-0">
              <CardTitle className="text-sm">Répartition par genre</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-36 sm:h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    data={[
                      { name: 'Femmes', value: stats.femalePercent ?? 0, fill: '#ec4899' },
                      { name: 'Hommes', value: stats.malePercent ?? 0, fill: '#3b82f6' },
                    ]}
                    innerRadius={30}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar cornerRadius={8} background dataKey="value" />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-[11px] sm:text-xs mt-2">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> Femmes {(stats.femalePercent ?? 0).toFixed(1)}%</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Hommes {(stats.malePercent ?? 0).toFixed(1)}%</div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates per job (top 5) */}
          <Card className="shadow-soft">
            <CardHeader className="py-3 pb-0">
              <CardTitle className="text-sm">Candidats par offre (Top 5)</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-36 sm:h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeJobs.slice(0, 5).map(j => ({
                    name: j.title.length > 10 ? `${j.title.slice(0, 10)}…` : j.title,
                    value: j.candidate_count
                  }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} height={24} />
                    <Tooltip formatter={(v: number) => `${v} candidats`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {activeJobs.slice(0, 5).map((_, idx) => (
                        <Cell key={idx} fill={["#0ea5e9", "#22c55e", "#f59e0b", "#a855f7", "#ef4444"][idx % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* New candidates per job (24h) */}
          <Card className="shadow-soft">
            <CardHeader className="py-3 pb-0">
              <CardTitle className="text-sm">Nouveaux (24h) par offre</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-36 sm:h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeJobs.slice(0, 5).map(j => ({
                    name: j.title.length > 10 ? `${j.title.slice(0, 10)}…` : j.title,
                    value: j.new_candidates
                  }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} height={24} />
                    <Tooltip formatter={(v: number) => `${v} nouveaux`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {activeJobs.slice(0, 5).map((_, idx) => (
                        <Cell key={idx} fill={["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#a855f7"][idx % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: Quick actions + Recent activity (compact) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 overflow-hidden">
          <Card className="shadow-soft">
            <CardHeader className="py-3 pb-2">
              <CardTitle className="text-sm">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link to="/recruiter/jobs/new">
                <Button variant="outline" className="w-full h-9 text-xs">
                  <Plus className="w-3 h-3 mr-2" /> Nouvelle offre
                </Button>
              </Link>
              <Link to="/recruiter/candidates">
                <Button variant="outline" className="w-full h-9 text-xs">
                  <Users className="w-3 h-3 mr-2" /> Candidats
                </Button>
              </Link>
              <Link to="/recruiter/jobs">
                <Button variant="outline" className="w-full h-9 text-xs">
                  <Briefcase className="w-3 h-3 mr-2" /> Mes offres
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full h-9 text-xs">Accueil</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between py-3 pb-2">
              <CardTitle className="text-sm sm:text-base">Activité récente</CardTitle>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </CardHeader>
            <CardContent className="max-h-32 overflow-auto text-xs">
              {isLoadingActivities ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : errorActivities ? (
                <p className="text-red-500">Erreur de chargement</p>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-2">
                  {activities.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between gap-2">
                      <span className="truncate pr-2 min-w-0" title={`${activity.description} pour ${activity.job_title}`}>
                        {activity.description} • <strong>{activity.job_title}</strong>
                      </span>
                      <Badge variant="outline" className="text-[10px]">
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
                <p className="text-muted-foreground text-center">Aucune activité récente.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RecruiterLayout>
  );
}