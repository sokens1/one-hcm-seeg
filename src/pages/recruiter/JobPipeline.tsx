import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Eye, X, CheckCircle, Calendar } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Label } from "@/components/ui/label";

// Types pour le pipeline
interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: 'new' | 'preselected' | 'interview' | 'offer' | 'rejected';
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
    status: "interview"
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
  interview: { label: "Entretien", color: "bg-purple-100 text-purple-800 border-purple-200", count: 0 },
  offer: { label: "Offre envoyée", color: "bg-green-100 text-green-800 border-green-200", count: 0 },
  rejected: { label: "Refusés", color: "bg-red-100 text-red-800 border-red-200", count: 0 }
};

interface CandidateCardProps {
  candidate: Candidate;
  onStatusChange: (candidateId: number, newStatus: Candidate['status']) => void;
  onViewDetails: (candidate: Candidate) => void;
}

function CandidateCard({ candidate, onStatusChange, onViewDetails }: CandidateCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-medium transition-all group">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
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
                className="text-xs px-2 py-1 h-7 text-primary border-primary hover:bg-primary hover:text-white"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Présélectionner
              </Button>
            )}
            
            {candidate.status === 'preselected' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(candidate.id, 'interview');
                  }}
                  className="text-xs px-2 py-1 h-7 text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Entretien
                </Button>
              </>
            )}
            
            {candidate.status === 'interview' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implémenter la programmation d'entretien
                  }}
                  className="text-xs px-2 py-1 h-7 text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Programmer
                </Button>
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
                  Offre
                </Button>
              </>
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
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleStatusChange = (candidateId: number, newStatus: Candidate['status']) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, status: newStatus }
          : candidate
      )
    );
  };

  const getCandidatesByStatus = (status: Candidate['status']) => {
    return candidates.filter(candidate => candidate.status === status);
  };

  // Calcul des compteurs
  Object.keys(statusConfig).forEach(status => {
    statusConfig[status as keyof typeof statusConfig].count = getCandidatesByStatus(status as Candidate['status']).length;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/recruiter">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Pipeline - Directeur des Ressources Humaines</h1>
              <p className="text-muted-foreground">
                Gérez les candidatures pour ce poste de direction à la SEEG
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Contacter tous
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-4 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusCandidates = getCandidatesByStatus(status as Candidate['status']);
            
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{config.label}</h3>
                  <Badge variant="secondary" className={config.color}>
                    {statusCandidates.length}
                  </Badge>
                </div>
                
                <div className="space-y-3 min-h-[400px] bg-muted/30 rounded-lg p-3">
                  {statusCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onStatusChange={handleStatusChange}
                      onViewDetails={setSelectedCandidate}
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

        {/* Candidate Detail Modal (Simplified) */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedCandidate.firstName} {selectedCandidate.lastName}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedCandidate(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Téléphone</Label>
                    <p className="font-medium">{selectedCandidate.phone}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Date de candidature</Label>
                  <p className="font-medium">
                    {new Date(selectedCandidate.appliedDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Actions rapides</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Voir le CV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Mail className="w-4 h-4" />
                      Envoyer un email
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Calendar className="w-4 h-4" />
                      Planifier entretien
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Notes internes</Label>
                  <textarea
                    className="w-full mt-2 p-3 border rounded-md resize-none"
                    rows={4}
                    placeholder="Ajoutez des notes sur ce candidat..."
                    value={selectedCandidate.notes || ""}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}