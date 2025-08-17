import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Filter } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { EnhancedCandidateCard } from "@/components/recruiter/EnhancedCandidateCard";

// Types pour le pipeline
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

// Mock data
const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: "Marie",
    lastName: "Obame",
    email: "marie.obame@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-15",
    status: "candidature",
    currentPosition: "Ingénieur Électricité",
    yearsExperience: 5,
    protocol1Score: 60,
    protocol2Score: 0
  },
  {
    id: 2,
    firstName: "Jean",
    lastName: "Ndong",
    email: "jean.ndong@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-14",
    status: "candidature",
    currentPosition: "Technicien Maintenance",
    yearsExperience: 3,
    protocol1Score: 45,
    protocol2Score: 0
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Mba",
    email: "sarah.mba@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-13",
    status: "incubation",
    currentPosition: "Chef de Service Clientèle",
    yearsExperience: 8,
    protocol1Score: 85,
    protocol2Score: 25
  },
  {
    id: 4,
    firstName: "Paul",
    lastName: "Nze",
    email: "paul.nze@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-12",
    status: "embauche",
    currentPosition: "Directeur Technique",
    yearsExperience: 12,
    protocol1Score: 90,
    protocol2Score: 85
  },
  {
    id: 5,
    firstName: "Lucie",
    lastName: "Ondo",
    email: "lucie.ondo@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-10",
    status: "refuse",
    currentPosition: "Analyste Financier",
    yearsExperience: 2,
    protocol1Score: 25,
    protocol2Score: 0
  }
];

const statusConfig = {
  candidature: { label: "Candidature", color: "bg-blue-100 text-blue-800 border-blue-200", count: 0 },
  incubation: { label: "Incubation", color: "bg-yellow-100 text-yellow-800 border-yellow-200", count: 0 },
  embauche: { label: "Embauché", color: "bg-green-100 text-green-800 border-green-200", count: 0 },
  refuse: { label: "Refusé", color: "bg-red-100 text-red-800 border-red-200", count: 0 }
};


export default function JobPipeline() {
  const { id } = useParams();
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  const getCandidatesByStatus = (status: Candidate['status']) => {
    return candidates.filter(candidate => candidate.status === status);
  };

  // Calcul des compteurs
  Object.keys(statusConfig).forEach(status => {
    statusConfig[status as keyof typeof statusConfig].count = getCandidatesByStatus(status as Candidate['status']).length;
  });

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
              <h1 className="text-3xl font-bold text-foreground">Pipeline pour : Directeur des Ressources Humaines</h1>
              <p className="text-muted-foreground">
                Gérez le flux de candidats pour ce poste spécifique
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

        {/* Kanban Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusCandidates = getCandidatesByStatus(status as Candidate['status']);
            
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">
                    {config.label} ({statusCandidates.length})
                  </h3>
                </div>
                
                <div className="space-y-3 min-h-[500px] bg-muted/30 rounded-lg p-3 border-2 border-dashed border-muted-foreground/20">
                  {statusCandidates.map((candidate) => (
                    <EnhancedCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      jobId={id || "1"}
                    />
                  ))}
                  
                  {statusCandidates.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      <p>Aucun candidat</p>
                      <p className="text-xs mt-1">Glissez-déposez des candidats ici</p>
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