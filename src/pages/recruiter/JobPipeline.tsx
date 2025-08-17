import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

// Types pour le pipeline Kanban
interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  currentPosition: string;
  currentDepartment: string;
  yearsExperience: number;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  protocol1Progress: number; // 0-100
  protocol2Progress: number; // 0-100
  applicationDate: string;
}

// Mock data pour les candidats
const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: "Marie",
    lastName: "Obame",
    currentPosition: "Développeuse Frontend",
    currentDepartment: "IT",
    yearsExperience: 3,
    status: "candidature",
    protocol1Progress: 60,
    protocol2Progress: 0,
    applicationDate: "2024-01-15"
  },
  {
    id: 2,
    firstName: "Jean",
    lastName: "Ndong",
    currentPosition: "Chef de Projet",
    currentDepartment: "Digital",
    yearsExperience: 5,
    status: "candidature",
    protocol1Progress: 80,
    protocol2Progress: 0,
    applicationDate: "2024-01-14"
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Mba",
    currentPosition: "Analyste Senior",
    currentDepartment: "Finance",
    yearsExperience: 7,
    status: "incubation",
    protocol1Progress: 100,
    protocol2Progress: 45,
    applicationDate: "2024-01-13"
  },
  {
    id: 4,
    firstName: "Paul",
    lastName: "Nze",
    currentPosition: "Développeur Full Stack",
    currentDepartment: "IT",
    yearsExperience: 4,
    status: "embauche",
    protocol1Progress: 100,
    protocol2Progress: 100,
    applicationDate: "2024-01-12"
  }
];

const statusConfig = {
  candidature: { 
    label: "Candidature", 
    color: "bg-blue-50 border-blue-200",
    count: 0 
  },
  incubation: { 
    label: "Incubation", 
    color: "bg-yellow-50 border-yellow-200",
    count: 0 
  },
  embauche: { 
    label: "Embauché", 
    color: "bg-green-50 border-green-200",
    count: 0 
  },
  refuse: { 
    label: "Refusé", 
    color: "bg-red-50 border-red-200",
    count: 0 
  }
};

interface CandidateCardProps {
  candidate: Candidate;
  onAnalyze: (candidateId: number) => void;
}

function CandidateCard({ candidate, onAnalyze }: CandidateCardProps) {
  const getProgressLabel = () => {
    if (candidate.status === 'candidature') {
      return `Protocole 1 : ${Math.round(candidate.protocol1Progress)}%`;
    } else if (candidate.status === 'incubation') {
      return `Protocole 2 : ${Math.round(candidate.protocol2Progress)}%`;
    }
    return 'Terminé ✓';
  };

  const getCurrentProgress = () => {
    if (candidate.status === 'candidature') {
      return candidate.protocol1Progress;
    } else if (candidate.status === 'incubation') {
      return candidate.protocol2Progress;
    }
    return 100;
  };

  return (
    <Card className="hover:shadow-medium transition-all cursor-pointer group">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Nom du candidat */}
          <div>
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {candidate.firstName} {candidate.lastName}
            </h4>
          </div>

          {/* Poste actuel et ancienneté */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Poste actuel :</span>
              <span className="font-medium">{candidate.currentPosition}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Département :</span>
              <span className="font-medium">{candidate.currentDepartment}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ancienneté :</span>
              <span className="font-medium">{candidate.yearsExperience} années</span>
            </div>
          </div>

          {/* Indicateur de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression :</span>
              <span className="font-medium text-primary">{getProgressLabel()}</span>
            </div>
            <Progress value={getCurrentProgress()} className="h-2" />
          </div>

          {/* Bouton d'action */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze(candidate.id);
              }}
              className="w-full gap-2 hover:bg-primary hover:text-white"
            >
              Analyser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobPipeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  const handleAnalyze = (candidateId: number) => {
    navigate(`/recruiter/jobs/${id}/candidates/${candidateId}/analysis`);
  };

  const getCandidatesByStatus = (status: Candidate['status']) => {
    return candidates.filter(candidate => candidate.status === status);
  };

  // Calcul des compteurs
  Object.keys(statusConfig).forEach(status => {
    statusConfig[status as keyof typeof statusConfig].count = getCandidatesByStatus(status as Candidate['status']).length;
  });

  // Mock job title - en réalité, ceci viendrait d'une API
  const jobTitle = "Développeur React.js";

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/recruiter/jobs">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Pipeline pour : {jobTitle}
              </h1>
              <p className="text-muted-foreground">
                Gérez le flux de tous les candidats pour ce poste
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un candidat
            </Button>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Modifier l'offre
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statusConfig).map(([status, config]) => (
            <Card key={status} className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{config.count}</div>
                <div className="text-sm text-muted-foreground">{config.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Vue Kanban */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusCandidates = getCandidatesByStatus(status as Candidate['status']);
            
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{config.label}</h3>
                  <Badge variant="outline" className="text-xs">
                    {config.count}
                  </Badge>
                </div>
                
                <div className={`space-y-3 min-h-[500px] rounded-lg p-3 border-2 border-dashed ${config.color}`}>
                  {statusCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onAnalyze={handleAnalyze}
                    />
                  ))}
                  
                  {statusCandidates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Aucun candidat
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RecruiterLayout>
  );
}