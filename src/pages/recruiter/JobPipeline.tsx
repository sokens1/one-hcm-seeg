import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { JobPipelineBoard } from "@/components/recruiter/JobPipelineBoard";

// Types pour le pipeline
interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: 'new' | 'preselected' | 'offer' | 'rejected';
  notes?: string;
}

// Mock data
const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: "Marie",
    lastName: "Obame",
    email: "marie.obame@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-15",
    status: "new"
  },
  {
    id: 2,
    firstName: "Jean",
    lastName: "Ndong",
    email: "jean.ndong@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-14",
    status: "new"
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Mba",
    email: "sarah.mba@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-13",
    status: "preselected"
  },
  {
    id: 4,
    firstName: "Paul",
    lastName: "Nze",
    email: "paul.nze@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-12",
    status: "offer"
  },
  {
    id: 5,
    firstName: "Lucie",
    lastName: "Ondo",
    email: "lucie.ondo@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-10",
    status: "offer"
  }
];

const statusConfig = {
  new: { label: "Nouveaux", color: "bg-blue-100 text-blue-800 border-blue-200", count: 0 },
  preselected: { label: "Présélectionnés", color: "bg-yellow-100 text-yellow-800 border-yellow-200", count: 0 },
  offer: { label: "Sélection retenus", color: "bg-green-100 text-green-800 border-green-200", count: 0 },
  rejected: { label: "Refusés", color: "bg-red-100 text-red-800 border-red-200", count: 0 }
};

interface CandidateCardProps {
  candidate: Candidate;
  onStatusChange: (candidateId: number, newStatus: Candidate['status']) => void;
  onViewDetails: (candidate: Candidate) => void;
}

function CandidateCard({ candidate, onStatusChange, onViewDetails }: CandidateCardProps) {
  const [interviewDate, setInterviewDate] = useState<Date>();
  return (
    <Card className="cursor-pointer hover:shadow-medium transition-all group">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground group-hover:text-primary-dark transition-colors">
              {candidate.firstName} {candidate.lastName}
            </h4>
            <p className="text-sm text-muted-foreground">{candidate.email}</p>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Candidature du {new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(candidate);
              }}
              className="text-xs px-2 py-1 h-7"
            >
              <Eye className="w-3 h-3 mr-1" />
              CV
            </Button>
            
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {candidate.status === 'new' && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(candidate.id, 'preselected');
                }}
                className="text-xs px-2 py-1 h-7 text-primary-dark border-primary-dark hover:bg-primary-dark hover:text-white"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Présélectionner
              </Button>
            )}
            
            {candidate.status === 'preselected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(candidate.id, 'offer');
                }}
                className="text-xs px-2 py-1 h-7 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Sélectionner
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(candidate.id, 'rejected');
              }}
              className="text-xs px-2 py-1 h-7 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
            >
              <X className="w-3 h-3" />
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

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pipeline de Recrutement</h1>
            <p className="text-muted-foreground">
              Suivi des candidatures pour l'offre #{id}
            </p>
          </div>
        </div>

        <JobPipelineBoard jobId={id || "1"} />
      </div>
    </RecruiterLayout>
  );
}