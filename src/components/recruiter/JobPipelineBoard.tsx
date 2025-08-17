import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical, ArrowRight, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  currentPosition: string;
  department: string;
  yearsExperience: number;
  appliedDate: string;
  status: "candidature" | "incubation" | "embauche" | "refuse";
  location: string;
}

interface JobPipelineBoardProps {
  candidates: Candidate[];
  onAnalyzeCandidate: (candidateId: number) => void;
  onPhaseChange: (candidateId: number, newStatus: Candidate["status"]) => void;
}

const phaseConfig = {
  candidature: {
    title: "Candidature",
    color: "border-blue-200 bg-blue-50",
    headerColor: "bg-blue-100 text-blue-800"
  },
  incubation: {
    title: "Incubation", 
    color: "border-orange-200 bg-orange-50",
    headerColor: "bg-orange-100 text-orange-800"
  },
  embauche: {
    title: "Embauché",
    color: "border-green-200 bg-green-50", 
    headerColor: "bg-green-100 text-green-800"
  },
  refuse: {
    title: "Refusé",
    color: "border-red-200 bg-red-50",
    headerColor: "bg-red-100 text-red-800"
  }
};

interface CandidateCardProps {
  candidate: Candidate;
  onAnalyze: () => void;
  onPhaseChange: (newStatus: Candidate["status"]) => void;
}

function CandidateCard({ candidate, onAnalyze, onPhaseChange }: CandidateCardProps) {
  const getNextPhase = (currentStatus: Candidate["status"]): Candidate["status"] | null => {
    switch (currentStatus) {
      case "candidature": return "incubation";
      case "incubation": return "embauche";
      default: return null;
    }
  };

  const getPreviousPhase = (currentStatus: Candidate["status"]): Candidate["status"] | null => {
    switch (currentStatus) {
      case "incubation": return "candidature";
      case "embauche": return "incubation";
      case "refuse": return "candidature";
      default: return null;
    }
  };

  const nextPhase = getNextPhase(candidate.status);
  const previousPhase = getPreviousPhase(candidate.status);

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">
              {candidate.firstName} {candidate.lastName}
            </h4>
            <p className="text-sm text-muted-foreground">{candidate.currentPosition}</p>
            <p className="text-sm text-muted-foreground">{candidate.department}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {candidate.yearsExperience} ans d'exp.
              </Badge>
              <Badge variant="outline" className="text-xs">
                {candidate.location}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAnalyze}>
                <Eye className="mr-2 h-4 w-4" />
                Analyser
              </DropdownMenuItem>
              {previousPhase && (
                <DropdownMenuItem onClick={() => onPhaseChange(previousPhase)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Revenir à {phaseConfig[previousPhase].title}
                </DropdownMenuItem>
              )}
              {nextPhase && (
                <DropdownMenuItem onClick={() => onPhaseChange(nextPhase)}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Passer à {phaseConfig[nextPhase].title}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onPhaseChange("refuse")}
                className="text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Refuser
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={onAnalyze}
          >
            <Eye className="h-3 w-3" />
            Analyser
          </Button>

          {candidate.status === "candidature" && (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full gap-2"
              onClick={() => onPhaseChange("incubation")}
            >
              <ArrowRight className="h-3 w-3" />
              Passer en Incubation
            </Button>
          )}

          {candidate.status === "incubation" && (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full gap-2"
              onClick={() => onPhaseChange("embauche")}
            >
              <CheckCircle className="h-3 w-3" />
              Engager
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function JobPipelineBoard({ candidates, onAnalyzeCandidate, onPhaseChange }: JobPipelineBoardProps) {
  const getCandidatesByPhase = (phase: Candidate["status"]) => {
    return candidates.filter(candidate => candidate.status === phase);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {Object.entries(phaseConfig).map(([phase, config]) => {
        const phaseCandidates = getCandidatesByPhase(phase as Candidate["status"]);
        
        return (
          <div key={phase} className="space-y-4">
            <Card className={`${config.color} border-2`}>
              <CardHeader className={`${config.headerColor} rounded-t-lg`}>
                <CardTitle className="text-lg flex items-center justify-between">
                  {config.title}
                  <Badge variant="secondary" className="bg-white text-gray-700">
                    {phaseCandidates.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 min-h-[400px]">
                {phaseCandidates.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Aucun candidat dans cette phase
                  </div>
                ) : (
                  phaseCandidates.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onAnalyze={() => onAnalyzeCandidate(candidate.id)}
                      onPhaseChange={(newStatus) => onPhaseChange(candidate.id, newStatus)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}