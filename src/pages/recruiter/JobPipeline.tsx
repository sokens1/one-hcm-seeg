import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, X, CheckCircle, Filter, Users, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Types pour le tunnel de recrutement
interface TunnelTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  appliedDate: string;
  status: 'candidature' | 'preselection' | 'selection' | 'embauche';
  tasks: TunnelTask[];
  notes?: string;
}

// Mock data avec tâches pour le tunnel de recrutement
const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@email.com",
    phone: "+241 XX XX XX XX",
    position: "Chef de Projet Innovation",
    appliedDate: "2024-01-15",
    status: "candidature",
    tasks: [
      { id: "task1", title: "Analyse des profils", completed: false }
    ]
  },
  {
    id: 2,
    firstName: "Aïssata",
    lastName: "Traoré",
    email: "aissata.traore@email.com",
    phone: "+241 XX XX XX XX",
    position: "Data Scientist Senior",
    appliedDate: "2024-01-14",
    status: "preselection",
    tasks: [
      { id: "task1", title: "Tests de personnalité", completed: true },
      { id: "task2", title: "Tests de raisonnement", completed: true },
      { id: "task3", title: "Evaluation du Gap de compétence", completed: false },
      { id: "task4", title: "Entretien Face à Face", completed: false },
      { id: "task5", title: "QCM / Jeux de rôle", completed: false }
    ]
  },
  {
    id: 3,
    firstName: "Marc",
    lastName: "Lemoine",
    email: "marc.lemoine@email.com",
    phone: "+241 XX XX XX XX",
    position: "Développeur Backend",
    appliedDate: "2024-01-13",
    status: "selection",
    tasks: [
      { id: "task1", title: "Evaluation des comportements pro.", completed: true },
      { id: "task2", title: "Job Shadowing", completed: false },
      { id: "task3", title: "Conduite d'un Projet à valeur ajoutée", completed: false },
      { id: "task4", title: "Edition Fiche de poste", completed: false }
    ]
  },
  {
    id: 4,
    firstName: "Sophie",
    lastName: "Martin",
    email: "sophie.martin@email.com",
    phone: "+241 XX XX XX XX",
    position: "Data Scientist Senior",
    appliedDate: "2024-01-12",
    status: "embauche",
    tasks: [
      { id: "task1", title: "Intégration & Formation", completed: true },
      { id: "task2", title: "Team Building", completed: false },
      { id: "task3", title: "Suivi Productivité & Performance", completed: false },
      { id: "task4", title: "Evaluation continue", completed: false }
    ]
  }
];

const phaseConfig = {
  candidature: { 
    label: "Candidature", 
    duration: "2 semaines",
    protocol: "Protocole 1",
    color: "bg-blue-50 border-blue-200", 
    count: 0 
  },
  preselection: { 
    label: "Pré-sélection", 
    duration: "1 semaine",
    protocol: "Protocole 2 : Coaching & Assessment",
    color: "bg-yellow-50 border-yellow-200", 
    count: 0 
  },
  selection: { 
    label: "Sélection", 
    duration: "12 semaines",
    protocol: "Protocole 3 : Mentoring & Engagement",
    color: "bg-purple-50 border-purple-200", 
    count: 0 
  },
  embauche: { 
    label: "Embauche", 
    duration: "n semaines",
    protocol: "Protocole 4 : Intégration & Performance",
    color: "bg-green-50 border-green-200", 
    count: 0 
  }
};

interface CandidateCardProps {
  candidate: Candidate;
  onStatusChange: (candidateId: number, newStatus: Candidate['status']) => void;
  onViewDetails: (candidate: Candidate) => void;
}

interface TunnelCandidateCardProps {
  candidate: Candidate;
  onTaskToggle: (candidateId: number, taskId: string) => void;
  onStatusChange: (candidateId: number, newStatus: Candidate['status']) => void;
  onViewDetails: (candidate: Candidate) => void;
}

function TunnelCandidateCard({ candidate, onTaskToggle, onStatusChange, onViewDetails }: TunnelCandidateCardProps) {
  const completedTasks = candidate.tasks.filter(task => task.completed).length;
  const totalTasks = candidate.tasks.length;
  const phaseData = phaseConfig[candidate.status];

  const getNextStatus = (currentStatus: Candidate['status']): Candidate['status'] | null => {
    const statusOrder: Candidate['status'][] = ['candidature', 'preselection', 'selection', 'embauche'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
  };

  const canAdvance = completedTasks === totalTasks && totalTasks > 0;
  const nextStatus = getNextStatus(candidate.status);

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4" 
          style={{ borderLeftColor: candidate.status === 'candidature' ? '#3B82F6' : 
                                    candidate.status === 'preselection' ? '#F59E0B' : 
                                    candidate.status === 'selection' ? '#8B5CF6' : '#10B981' }}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* En-tête candidat */}
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              {candidate.firstName} {candidate.lastName}
            </h4>
            <p className="text-xs text-muted-foreground font-medium">
              Poste : {candidate.position}
            </p>
          </div>

          {/* Protocole */}
          <div className="text-xs font-medium text-primary">
            {phaseData.protocol}
          </div>

          {/* Liste des tâches */}
          <div className="space-y-1.5">
            {candidate.tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onTaskToggle(candidate.id, task.id)}
                  className="h-3.5 w-3.5"
                />
                <span className={cn(
                  "text-xs flex-1",
                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {task.title}
                </span>
                {task.completed && <CheckCircle className="h-3 w-3 text-green-500" />}
              </div>
            ))}
          </div>

          {/* Progression */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">Progression :</span>
              <span className="text-xs font-bold">{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(candidate);
              }}
              className="text-xs px-2 py-1 h-6 flex-1"
            >
              Voir détails
            </Button>
            
            {canAdvance && nextStatus && (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(candidate.id, nextStatus);
                }}
                className="text-xs px-2 py-1 h-6 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Avancer
              </Button>
            )}
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
  const [dateFilter, setDateFilter] = useState<string>("");

  const handleStatusChange = (candidateId: number, newStatus: Candidate['status']) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, status: newStatus }
          : candidate
      )
    );
  };

  const handleTaskToggle = (candidateId: number, taskId: string) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? {
              ...candidate,
              tasks: candidate.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              )
            }
          : candidate
      )
    );
  };

  const getCandidatesByStatus = (status: Candidate['status']) => {
    return candidates.filter(candidate => candidate.status === status);
  };

  // Calcul des compteurs pour chaque phase
  Object.keys(phaseConfig).forEach(status => {
    phaseConfig[status as keyof typeof phaseConfig].count = getCandidatesByStatus(status as Candidate['status']).length;
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
              <h1 className="text-3xl font-bold text-foreground">Tunnel de Recrutement</h1>
              <p className="text-muted-foreground">
                Suivi des candidats en parcours d'évaluation avancé
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
                <option value="">Toutes les phases</option>
                <option value="candidature">Candidature</option>
                <option value="preselection">Pré-sélection</option>
                <option value="selection">Sélection</option>
                <option value="embauche">Embauche</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(phaseConfig).map(([status, config]) => (
            <Card key={status} className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{config.count}</div>
                <div className="text-sm text-muted-foreground">{config.label}</div>
                <div className="text-xs text-muted-foreground mt-1">({config.duration})</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto">
          {Object.entries(phaseConfig).map(([status, config]) => {
            const statusCandidates = getCandidatesByStatus(status as Candidate['status']);
            
            return (
              <div key={status} className="space-y-4 min-w-[280px]">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{config.label}</h3>
                    <Badge variant="outline" className="text-xs">{config.duration}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {statusCandidates.length} candidat{statusCandidates.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className={cn(
                  "space-y-3 min-h-[500px] rounded-lg p-3 border-2 border-dashed",
                  config.color
                )}>
                  {statusCandidates.map((candidate) => (
                    <TunnelCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onTaskToggle={handleTaskToggle}
                      onStatusChange={handleStatusChange}
                      onViewDetails={setSelectedCandidate}
                    />
                  ))}
                  
                  {statusCandidates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Aucun candidat dans cette phase
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
                      <Eye className="w-4 h-4" />
                      Envoyer un email
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Sélectionner candidat
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
    </RecruiterLayout>
  );
}