import { useParams, useNavigate } from "react-router-dom";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecruiterApplications } from "@/hooks/useApplications";
import { useState } from "react";

// Types pour les candidats
interface Candidate {
  id: string;
  name: string;
  currentPosition: string;
  currentDepartment: string;
  experience: string;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  score: number;
  applicationDate: string;
  email: string;
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'candidature': return 'Candidature';
    case 'incubation': return 'Incubation';
    case 'embauche': return 'Embauché';
    case 'refuse': return 'Refusé';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'candidature': return 'border-blue-500';
    case 'incubation': return 'border-warning';
    case 'embauche': return 'border-success';
    case 'refuse': return 'border-red-500';
    default: return 'border-muted';
  }
};

export default function JobPipeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, isLoading, error, updateApplicationStatus } = useRecruiterApplications(id);

  // Transform applications to candidates format
  const candidates: Candidate[] = applications.map(app => ({
    id: app.id,
    name: `${app.users?.first_name || ''} ${app.users?.last_name || ''}`.trim(),
    currentPosition: app.users?.email || '',
    currentDepartment: '',
    experience: '',
    status: app.status,
    score: 0, // TODO: Calculate from evaluations
    applicationDate: new Date(app.created_at).toISOString().split('T')[0],
    email: app.users?.email || ''
  }));

  const jobTitle = applications[0]?.job_offers?.title || "Offre d'emploi";
  const getCandidatesByStatus = (status: string) => {
    return candidates.filter(candidate => candidate.status === status);
  };

  const statuses = [
    { key: 'candidature', label: 'Candidature', color: 'border-blue-500' },
    { key: 'incubation', label: 'Incubation', color: 'border-warning' },
    { key: 'embauche', label: 'Embauché', color: 'border-success' },
    { key: 'refuse', label: 'Refusé', color: 'border-red-500' }
  ];

  const handleAnalyzeCandidate = (candidateId: string) => {
    navigate(`/recruiter/candidates/${candidateId}/analysis`);
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
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/recruiter/jobs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux postes
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Pipeline pour : {jobTitle}
          </h1>
          <p className="text-muted-foreground">
            Gérez le flux de tous les candidats pour ce poste de manière visuelle et interactive
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Chargement du pipeline...</span>
          </div>
        ) : (
          <>
            {/* Statistiques globales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statuses.map((status) => {
                const count = getCandidatesByStatus(status.key).length;
                return (
                  <Card key={status.key}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-foreground">{count}</div>
                      <div className="text-sm text-muted-foreground">{status.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Vue Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statuses.map((status) => {
                const statusCandidates = getCandidatesByStatus(status.key);
                
                return (
                  <div key={status.key}>
                    <Card className={`border-t-4 ${status.color} h-full`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold">{status.label}</CardTitle>
                          <Badge variant="secondary" className="text-sm">
                            {statusCandidates.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 min-h-[400px]">
                        {statusCandidates.map((candidate) => (
                          <Card key={candidate.id} className="p-4 hover:shadow-medium transition-all cursor-pointer group">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {candidate.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Email : {candidate.email}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Candidature : {new Date(candidate.applicationDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Score</span>
                                <Badge variant="outline" className="text-sm">
                                  {candidate.score}/100
                                </Badge>
                              </div>
                              
                              <Button 
                                size="sm" 
                                className="w-full gap-2"
                                variant="hero"
                                onClick={() => handleAnalyzeCandidate(candidate.id)}
                              >
                                <Eye className="w-4 h-4" />
                                Analyser
                              </Button>
                            </div>
                          </Card>
                        ))}
                        
                        {statusCandidates.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Aucun candidat</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </RecruiterLayout>
  );
}