import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Users, TrendingUp, Clock, BarChart3, Edit } from "lucide-react";
import { JobCard } from "@/components/ui/job-card";
import { Link, useNavigate } from "react-router-dom";

// Mock data - à remplacer par les vraies données
const mockRecruiterData = {
  activeJobs: [
    {
      id: 1,
      title: "Développeur React.js",
      location: "Libreville",
      contractType: "CDI",
      candidateCount: 12,
      newCandidates: 3
    },
    {
      id: 2,
      title: "Chef de Projet Digital",
      location: "Port-Gentil",
      contractType: "CDI",
      candidateCount: 8,
      newCandidates: 1
    },
    {
      id: 3,
      title: "Analyste Financier",
      location: "Libreville",
      contractType: "CDD",
      candidateCount: 15,
      newCandidates: 5
    }
  ],
  stats: {
    totalJobs: 3,
    totalCandidates: 35,
    newCandidates: 9,
    interviewsScheduled: 4
  }
};

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  
  const handleEditJob = (jobId: number) => {
    // Redirection vers la page d'édition de l'offre
    navigate(`/recruiter/jobs/${jobId}/edit`);
  };

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
              <div className="text-2xl font-bold text-foreground">{mockRecruiterData.stats.totalJobs}</div>
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
              <div className="text-2xl font-bold text-foreground">{mockRecruiterData.stats.totalCandidates}</div>
              <p className="text-xs text-muted-foreground">
                +{mockRecruiterData.stats.newCandidates} nouveaux
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
              <div className="text-2xl font-bold text-foreground">{mockRecruiterData.stats.newCandidates}</div>
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
              <div className="text-2xl font-bold text-foreground">{mockRecruiterData.stats.interviewsScheduled}</div>
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
              {mockRecruiterData.activeJobs.length} offres
            </Badge>
          </div>

          {mockRecruiterData.activeJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockRecruiterData.activeJobs.map((job, index) => (
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
                          <span>{job.contractType}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="bg-success-light text-success-foreground">
                            {job.candidateCount} candidats
                          </Badge>
                          {job.newCandidates > 0 && (
                            <Badge variant="default" className="bg-warning text-warning-foreground animate-bounce-soft">
                              {job.newCandidates} nouveaux
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
              <Link to="/recruiter/pipeline" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Tunnel de recrutement
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
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>3 nouvelles candidatures</span>
                  <Badge variant="outline" className="text-xs">Il y a 2h</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Entretien programmé</span>
                  <Badge variant="outline" className="text-xs">Hier</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Offre publiée</span>
                  <Badge variant="outline" className="text-xs">Il y a 3j</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RecruiterLayout>
  );
}