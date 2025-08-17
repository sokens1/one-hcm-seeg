import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Mock data pour les offres
const mockJobs = [
  {
    id: 1,
    title: "Développeur React.js",
    location: "Libreville",
    contractType: "CDI",
    candidateCount: 12,
    newCandidates: 3,
    status: "active"
  },
  {
    id: 2,
    title: "Chef de Projet Digital",
    location: "Port-Gentil",
    contractType: "CDI",
    candidateCount: 8,
    newCandidates: 1,
    status: "active"
  },
  {
    id: 3,
    title: "Analyste Financier",
    location: "Libreville",
    contractType: "CDD",
    candidateCount: 15,
    newCandidates: 5,
    status: "active"
  }
];

export default function RecruiterJobs() {
  const navigate = useNavigate();
  
  const handleEditJob = (jobId: number) => {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offres Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockJobs.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Candidatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {mockJobs.reduce((sum, job) => sum + job.candidateCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nouvelles Candidatures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {mockJobs.reduce((sum, job) => sum + job.newCandidates, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des offres */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Toutes les offres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockJobs.map((job, index) => (
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
      </div>
      </div>
    </RecruiterLayout>
  );
}