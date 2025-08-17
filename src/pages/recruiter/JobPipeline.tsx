import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, X, CheckCircle, Filter } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Types pour le pipeline
interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  currentPosition?: string;
  department?: string;
  experience?: string;
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
    currentPosition: "Développeuse Frontend",
    department: "IT",
    experience: "3 ans"
  },
  {
    id: 2,
    firstName: "Jean",
    lastName: "Ndong",
    email: "jean.ndong@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-14",
    status: "candidature",
    currentPosition: "Chef de Projet",
    department: "Marketing",
    experience: "5 ans"
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Mba",
    email: "sarah.mba@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-13",
    status: "incubation",
    currentPosition: "Analyste Business",
    department: "Finance",
    experience: "4 ans"
  },
  {
    id: 4,
    firstName: "Paul",
    lastName: "Nze",
    email: "paul.nze@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-12",
    status: "embauche",
    currentPosition: "Lead Developer",
    department: "IT",
    experience: "8 ans"
  },
  {
    id: 5,
    firstName: "Lucie",
    lastName: "Ondo",
    email: "lucie.ondo@email.com",
    phone: "+241 XX XX XX XX",
    appliedDate: "2024-01-10",
    status: "refuse",
    currentPosition: "Product Manager",
    department: "Produit",
    experience: "6 ans"
  }
];

const statusConfig = {
  candidature: { label: "Candidature", color: "bg-blue-100 text-blue-800 border-blue-200", count: 0 },
  incubation: { label: "Incubation", color: "bg-yellow-100 text-yellow-800 border-yellow-200", count: 0 },
  embauche: { label: "Embauché", color: "bg-green-100 text-green-800 border-green-200", count: 0 },
  refuse: { label: "Refusé", color: "bg-red-100 text-red-800 border-red-200", count: 0 }
};

interface CandidateCardProps {
  candidate: Candidate;
  onAnalyze: (candidate: Candidate) => void;
}

function CandidateCard({ candidate, onAnalyze }: CandidateCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-medium transition-all group">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-foreground group-hover:text-primary-dark transition-colors">
              {candidate.firstName} {candidate.lastName}
            </h4>
            <p className="text-sm text-muted-foreground">
              Poste actuel : {candidate.currentPosition}
            </p>
            <p className="text-sm text-muted-foreground">
              Département actuel : {candidate.department}
            </p>
            <p className="text-sm text-muted-foreground">
              Ancienneté : {candidate.experience}
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Candidature du {new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}
          </div>

          <div className="mt-3">
            <Button
              variant="hero"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze(candidate);
              }}
              className="w-full"
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
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [dateFilter, setDateFilter] = useState<string>("");

  const handleAnalyze = (candidate: Candidate) => {
    // Redirection vers la page d'évaluation détaillée
    window.location.href = `/recruiter/candidates/${candidate.id}/analysis?jobId=${id}`;
  };

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
            <Link to="/recruiter">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Pipeline pour : Développeur React.js</h1>
              <p className="text-muted-foreground">
                Gérez le flux de tous les candidats pour ce poste de manière visuelle et interactive
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
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
                  <h3 className="font-semibold text-foreground">{config.label}</h3>
                </div>
                
                <div className="space-y-3 min-h-[300px] lg:min-h-[400px] bg-muted/30 rounded-lg p-2 lg:p-3">
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