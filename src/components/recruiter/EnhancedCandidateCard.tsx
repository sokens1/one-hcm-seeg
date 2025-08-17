import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  currentPosition: string;
  yearsExperience: number;
  protocol1Score: number;
  protocol2Score: number;
  notes?: string;
}

interface EnhancedCandidateCardProps {
  candidate: Candidate;
  jobId: string;
}

export function EnhancedCandidateCard({ candidate, jobId }: EnhancedCandidateCardProps) {
  const navigate = useNavigate();

  const getProgressInfo = () => {
    if (candidate.status === 'candidature') {
      const completed = candidate.protocol1Score > 0 ? 1 : 0;
      return { 
        label: `Protocole 1 : ${completed}/4 ✓`, 
        progress: (candidate.protocol1Score / 100) * 100 
      };
    } else if (candidate.status === 'incubation') {
      const completed = candidate.protocol2Score > 0 ? 1 : 0;
      return { 
        label: `Protocole 2 : ${completed}/6 ✓`, 
        progress: (candidate.protocol2Score / 100) * 100 
      };
    }
    return { label: "Évaluation terminée", progress: 100 };
  };

  const progressInfo = getProgressInfo();

  const handleAnalyze = () => {
    navigate(`/recruiter/candidate/${candidate.id}/analysis?job=${jobId}`);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header avec avatar/initiales */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {candidate.firstName} {candidate.lastName}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {candidate.currentPosition}
              </p>
            </div>
          </div>

          {/* Expérience */}
          <div className="text-xs text-muted-foreground">
            {candidate.yearsExperience} année{candidate.yearsExperience > 1 ? 's' : ''} d'ancienneté
          </div>

          {/* Indicateur de progression */}
          {candidate.status !== 'refuse' && candidate.status !== 'embauche' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{progressInfo.label}</span>
                <span className="text-xs font-medium">{Math.round(progressInfo.progress)}%</span>
              </div>
              <Progress value={progressInfo.progress} className="h-1.5" />
            </div>
          )}

          {/* Bouton d'action */}
          <div className="pt-2">
            <Button
              onClick={handleAnalyze}
              variant="outline"
              size="sm"
              className="w-full text-xs gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Search className="w-3 h-3" />
              Analyser
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}