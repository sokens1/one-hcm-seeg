import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MoveRight, X } from "lucide-react";
import { Link } from "react-router-dom";

// Types pour les candidats et leur statut
interface Candidate {
  id: number;
  name: string;
  currentPosition: string;
  department: string;
  experienceYears: number;
  status: "candidature" | "incubation" | "embauche" | "refuse";
  email: string;
  appliedDate: string;
}

// Mock data pour les candidats dans le pipeline
const mockCandidates: Candidate[] = [
  {
    id: 1,
    name: "Marie Dubois",
    currentPosition: "Développeur Frontend",
    department: "Informatique",
    experienceYears: 3,
    status: "candidature",
    email: "marie.dubois@email.com",
    appliedDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Jean Mvé",
    currentPosition: "Chef de Projet Digital",
    department: "Marketing",
    experienceYears: 5,
    status: "candidature",
    email: "jean.mve@email.com",
    appliedDate: "2024-01-14"
  },
  {
    id: 3,
    name: "Sarah Bongo",
    currentPosition: "Analyste Financier",
    department: "Finance",
    experienceYears: 4,
    status: "incubation",
    email: "sarah.bongo@email.com",
    appliedDate: "2024-01-13"
  },
  {
    id: 4,
    name: "Pierre Ndong",
    currentPosition: "Développeur Backend",
    department: "Informatique",
    experienceYears: 6,
    status: "incubation",
    email: "pierre.ndong@email.com",
    appliedDate: "2024-01-12"
  },
  {
    id: 5,
    name: "Alice Koumba",
    currentPosition: "UX Designer",
    department: "Design",
    experienceYears: 2,
    status: "embauche",
    email: "alice.koumba@email.com",
    appliedDate: "2024-01-10"
  },
  {
    id: 6,
    name: "David Obame",
    currentPosition: "Manager Commercial",
    department: "Ventes",
    experienceYears: 8,
    status: "refuse",
    email: "david.obame@email.com",
    appliedDate: "2024-01-08"
  }
];

interface JobPipelineBoardProps {
  jobId: string;
}

export function JobPipelineBoard({ jobId }: JobPipelineBoardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  const getColumnTitle = (status: string) => {
    switch (status) {
      case "candidature":
        return "Candidature";
      case "incubation":
        return "Incubation";
      case "embauche":
        return "Embaucher";
      case "refuse":
        return "Refusé";
      default:
        return "";
    }
  };

  const getColumnColor = (status: string) => {
    switch (status) {
      case "candidature":
        return "bg-blue-50 border-blue-200";
      case "incubation":
        return "bg-yellow-50 border-yellow-200";
      case "embauche":
        return "bg-green-50 border-green-200";
      case "refuse":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const filteredCandidates = (status: string) => {
    return candidates.filter(candidate => candidate.status === status);
  };

  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <Card className="mb-3 hover:shadow-md transition-all cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">{candidate.name}</h4>
          <p className="text-sm text-muted-foreground">{candidate.currentPosition}</p>
          <p className="text-xs text-muted-foreground">
            {candidate.department} • {candidate.experienceYears} ans d'exp.
          </p>
          <div className="flex justify-between items-center pt-2">
            <Badge variant="outline" className="text-xs">
              {candidate.appliedDate}
            </Badge>
            <Link to={`/recruiter/candidates/${candidate.id}/analysis`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Eye className="w-3 h-3" />
                Analyser
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Pipeline de Recrutement</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Offre #{jobId}</span>
        </div>
      </div>

      {/* Vue Kanban global */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {["candidature", "incubation", "embauche", "refuse"].map((status) => (
          <div key={status} className={`rounded-lg border-2 p-4 ${getColumnColor(status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{getColumnTitle(status)}</h3>
              <Badge variant="secondary" className="text-xs">
                {filteredCandidates(status).length}
              </Badge>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredCandidates(status).map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
              
              {filteredCandidates(status).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Aucun candidat</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques du pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredCandidates("candidature").length}
            </div>
            <p className="text-sm text-muted-foreground">En candidature</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredCandidates("incubation").length}
            </div>
            <p className="text-sm text-muted-foreground">En incubation</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredCandidates("embauche").length}
            </div>
            <p className="text-sm text-muted-foreground">Embauchés</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredCandidates("refuse").length}
            </div>
            <p className="text-sm text-muted-foreground">Refusés</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}