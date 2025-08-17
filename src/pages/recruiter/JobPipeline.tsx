import { useParams, useNavigate } from "react-router-dom";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// Types pour les candidats
interface Candidate {
  id: number;
  name: string;
  currentPosition: string;
  currentDepartment: string;
  experience: string;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  score: number;
  applicationDate: string;
}

// Mock data pour le pipeline d'une offre spécifique
const mockCandidates: Candidate[] = [
  {
    id: 1,
    name: "Jean Dupont",
    currentPosition: "Développeur Frontend",
    currentDepartment: "IT",
    experience: "3 ans",
    status: "candidature",
    score: 85,
    applicationDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Marie Claire",
    currentPosition: "Chef de Projet",
    currentDepartment: "Marketing",
    experience: "5 ans",
    status: "incubation",
    score: 92,
    applicationDate: "2024-01-12"
  },
  {
    id: 3,
    name: "Paul Martin",
    currentPosition: "Analyste",
    currentDepartment: "Finance",
    experience: "2 ans",
    status: "embauche",
    score: 78,
    applicationDate: "2024-01-10"
  },
  {
    id: 4,
    name: "Sophie Durand",
    currentPosition: "Designer UX",
    currentDepartment: "Design",
    experience: "4 ans",
    status: "refuse",
    score: 65,
    applicationDate: "2024-01-08"
  },
  {
    id: 5,
    name: "Ahmed Benali",
    currentPosition: "Data Scientist",
    currentDepartment: "Analytics",
    experience: "4 ans",
    status: "candidature",
    score: 88,
    applicationDate: "2024-01-14"
  },
  {
    id: 6,
    name: "Fatou Ndiaye",
    currentPosition: "Product Manager",
    currentDepartment: "Product",
    experience: "6 ans",
    status: "incubation",
    score: 95,
    applicationDate: "2024-01-11"
  }
];

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
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  const jobTitle = "Développeur React.js"; // Mock data

  const getCandidatesByStatus = (status: string) => {
    return candidates.filter(candidate => candidate.status === status);
  };

  const statuses = [
    { key: 'candidature', label: 'Candidature', color: 'border-blue-500' },
    { key: 'incubation', label: 'Incubation', color: 'border-warning' },
    { key: 'embauche', label: 'Embauché', color: 'border-success' },
    { key: 'refuse', label: 'Refusé', color: 'border-red-500' }
  ];

  const handleAnalyzeCandidate = (candidateId: number) => {
    navigate(`/recruiter/candidates/${candidateId}/analysis`);
  };

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
                              Poste actuel : {candidate.currentPosition}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Département actuel : {candidate.currentDepartment}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Ancienneté : {candidate.experience}
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
      </div>
    </RecruiterLayout>
  );
}