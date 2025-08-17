import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  currentPosition: string;
  yearsExperience: number;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  score?: number;
  photo?: string;
}

const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: "Marie",
    lastName: "Obame",
    email: "marie.obame@email.com",
    currentPosition: "Ingénieur Électrique",
    yearsExperience: 5,
    status: "candidature",
    score: 85
  },
  {
    id: 2,
    firstName: "Jean",
    lastName: "Ndong",
    email: "jean.ndong@email.com",
    currentPosition: "Technicien Maintenance",
    yearsExperience: 3,
    status: "candidature"
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Mba",
    email: "sarah.mba@email.com",
    currentPosition: "Chef de Projet",
    yearsExperience: 7,
    status: "incubation",
    score: 92
  },
  {
    id: 4,
    firstName: "Paul",
    lastName: "Nze",
    email: "paul.nze@email.com",
    currentPosition: "Analyste Financier",
    yearsExperience: 4,
    status: "embauche",
    score: 88
  },
  {
    id: 5,
    firstName: "Lucie",
    lastName: "Ondo",
    email: "lucie.ondo@email.com",
    currentPosition: "Assistant RH",
    yearsExperience: 2,
    status: "refuse"
  }
];

const statusConfig = {
  candidature: { 
    label: "Candidature", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    count: 0 
  },
  incubation: { 
    label: "Incubation", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    count: 0 
  },
  embauche: { 
    label: "Embauche", 
    color: "bg-green-100 text-green-800 border-green-200",
    count: 0 
  },
  refuse: { 
    label: "Refusé", 
    color: "bg-red-100 text-red-800 border-red-200",
    count: 0 
  }
};

interface CandidateCardProps {
  candidate: Candidate;
  onAnalyze: (candidateId: number) => void;
}

function CandidateCard({ candidate, onAnalyze }: CandidateCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="cursor-pointer hover:shadow-medium transition-all group">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Photo et nom */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={candidate.photo} alt={`${candidate.firstName} ${candidate.lastName}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(candidate.firstName, candidate.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium text-foreground group-hover:text-primary-dark transition-colors">
                {candidate.firstName} {candidate.lastName}
              </h4>
              <p className="text-xs text-muted-foreground">{candidate.email}</p>
            </div>
          </div>
          
          {/* Informations métier */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{candidate.currentPosition}</p>
            <p className="text-xs text-muted-foreground">
              {candidate.yearsExperience} {candidate.yearsExperience > 1 ? 'années' : 'année'} d'ancienneté
            </p>
          </div>

          {/* Score d'évaluation */}
          {candidate.score && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs font-medium text-foreground">{candidate.score}/100</span>
            </div>
          )}
          
          {/* Bouton d'action */}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(candidate.id);
            }}
            className="w-full text-xs gap-2 hover:bg-primary hover:text-white"
          >
            Analyser
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface JobPipelineBoardProps {
  jobId: string;
}

export function JobPipelineBoard({ jobId }: JobPipelineBoardProps) {
  const navigate = useNavigate();
  const [candidates] = useState<Candidate[]>(mockCandidates);

  const getCandidatesByStatus = (status: Candidate['status']) => {
    return candidates.filter(candidate => candidate.status === status);
  };

  // Calcul des compteurs
  Object.keys(statusConfig).forEach(status => {
    statusConfig[status as keyof typeof statusConfig].count = getCandidatesByStatus(status as Candidate['status']).length;
  });

  const handleAnalyzeCandidate = (candidateId: number) => {
    navigate(`/recruiter/candidates/${candidateId}/analysis?job=${jobId}`);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card key={status} className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">{config.count}</div>
              <div className="text-sm text-muted-foreground">{config.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusCandidates = getCandidatesByStatus(status as Candidate['status']);
          
          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{config.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {config.count}
                </Badge>
              </div>
              
              <div className="space-y-3 min-h-[400px] bg-muted/30 rounded-lg p-3">
                {statusCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onAnalyze={handleAnalyzeCandidate}
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
  );
}