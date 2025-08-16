import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, X, CheckCircle, Filter, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Types pour le tunnel de recrutement
interface Task {
  id: string;
  label: string;
  completed: boolean;
}

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  phase: 'candidature' | 'preselection' | 'selection' | 'embauche';
  protocol: string;
  tasks: Task[];
  notes?: string;
}

// Mock data
const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    position: "Chef de Projet Innovation",
    email: "jean.dupont@email.com",
    phone: "+241 XX XX XX XX",
    phase: "candidature",
    protocol: "Protocole 1",
    tasks: [
      { id: "1", label: "Analyse des profils", completed: false }
    ]
  },
  {
    id: 2,
    firstName: "Aïssata",
    lastName: "Traoré",
    position: "Data Scientist Senior",
    email: "aissata.traore@email.com",
    phone: "+241 XX XX XX XX",
    phase: "preselection",
    protocol: "Protocole 2 : Coaching & Assessment",
    tasks: [
      { id: "1", label: "Tests de personnalité", completed: true },
      { id: "2", label: "Tests de raisonnement", completed: true },
      { id: "3", label: "Evaluation du Gap de compétence", completed: false },
      { id: "4", label: "Entretien Face à Face", completed: false },
      { id: "5", label: "QCM / Jeux de rôle", completed: false }
    ]
  },
  {
    id: 3,
    firstName: "Marc",
    lastName: "Lemoine",
    position: "Développeur Backend",
    email: "marc.lemoine@email.com",
    phone: "+241 XX XX XX XX",
    phase: "selection",
    protocol: "Protocole 3 : Mentoring & Engagement",
    tasks: [
      { id: "1", label: "Evaluation des comportements pro.", completed: true },
      { id: "2", label: "Job Shadowing", completed: false },
      { id: "3", label: "Conduite d'un Projet à valeur ajoutée", completed: false },
      { id: "4", label: "Edition Fiche de poste", completed: false }
    ]
  },
  {
    id: 4,
    firstName: "Sophie",
    lastName: "Martin",
    position: "Data Scientist Senior",
    email: "sophie.martin@email.com",
    phone: "+241 XX XX XX XX",
    phase: "embauche",
    protocol: "Protocole 4 : Intégration & Performance",
    tasks: [
      { id: "1", label: "Intégration & Formation", completed: true },
      { id: "2", label: "Team Building", completed: false },
      { id: "3", label: "Suivi Productivité & Performance", completed: false },
      { id: "4", label: "Evaluation continue", completed: false }
    ]
  }
];

const phaseConfig = {
  candidature: { 
    label: "Candidature", 
    duration: "2 semaines",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    count: 0 
  },
  preselection: { 
    label: "Pré-sélection", 
    duration: "1 semaine",
    color: "bg-green-100 text-green-800 border-green-200",
    count: 0 
  },
  selection: { 
    label: "Sélection", 
    duration: "12 semaines",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    count: 0 
  },
  embauche: { 
    label: "Embauche", 
    duration: "n semaines",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    count: 0 
  }
};

interface CandidateCardProps {
  candidate: Candidate;
  onPhaseChange: (candidateId: number, newPhase: Candidate['phase']) => void;
  onTaskToggle: (candidateId: number, taskId: string) => void;
  onViewDetails: (candidate: Candidate) => void;
}

function CandidateCard({ candidate, onPhaseChange, onTaskToggle, onViewDetails }: CandidateCardProps) {
  const completedTasks = candidate.tasks.filter(task => task.completed).length;
  const totalTasks = candidate.tasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const canMoveToNext = completedTasks === totalTasks && totalTasks > 0;
  
  const getNextPhase = (currentPhase: Candidate['phase']): Candidate['phase'] | null => {
    const phases: Candidate['phase'][] = ['candidature', 'preselection', 'selection', 'embauche'];
    const currentIndex = phases.indexOf(currentPhase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  };

  return (
    <Card className="cursor-pointer hover:shadow-medium transition-all group">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* En-tête candidat */}
          <div>
            <h4 className="font-medium text-foreground group-hover:text-primary-dark transition-colors">
              {candidate.firstName} {candidate.lastName}
            </h4>
            <p className="text-sm text-muted-foreground font-medium">{candidate.position}</p>
            <p className="text-xs text-muted-foreground">{candidate.protocol}</p>
          </div>

          {/* Checklist des tâches */}
          <div className="space-y-2">
            {candidate.tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskToggle(candidate.id, task.id);
                  }}
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center text-xs",
                    task.completed 
                      ? "bg-green-500 border-green-500 text-white" 
                      : "border-muted-foreground hover:border-primary"
                  )}
                >
                  {task.completed && "✓"}
                </button>
                <span className={cn(
                  "text-xs",
                  task.completed 
                    ? "line-through text-muted-foreground" 
                    : "text-foreground"
                )}>
                  {task.label}
                </span>
              </div>
            ))}
          </div>

          {/* Barre de progression */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progression :</span>
              <span className="font-medium">{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary-dark h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-1 mt-3">
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
              Voir détails
            </Button>
            
            {canMoveToNext && getNextPhase(candidate.phase) && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextPhase = getNextPhase(candidate.phase);
                  if (nextPhase) {
                    onPhaseChange(candidate.id, nextPhase);
                  }
                }}
                className="text-xs px-2 py-1 h-7 text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Passer à l'étape suivante
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecruiterTunnel() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filterPhase, setFilterPhase] = useState<string>("");

  const handlePhaseChange = (candidateId: number, newPhase: Candidate['phase']) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, phase: newPhase }
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
                task.id === taskId 
                  ? { ...task, completed: !task.completed }
                  : task
              )
            }
          : candidate
      )
    );
  };

  const getCandidatesByPhase = (phase: Candidate['phase']) => {
    return candidates.filter(candidate => 
      candidate.phase === phase && 
      (filterPhase === "" || candidate.phase === filterPhase)
    );
  };

  // Calcul des compteurs
  Object.keys(phaseConfig).forEach(phase => {
    phaseConfig[phase as keyof typeof phaseConfig].count = getCandidatesByPhase(phase as Candidate['phase']).length;
  });

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tunnel de Recrutement</h1>
            <p className="text-muted-foreground">
              Suivi des candidats en parcours d'évaluation avancé
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={filterPhase}
                onChange={(e) => setFilterPhase(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Toutes les phases</option>
                {Object.entries(phaseConfig).map(([phase, config]) => (
                  <option key={phase} value={phase}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(phaseConfig).map(([phase, config]) => (
            <Card key={phase} className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{config.count}</div>
                <div className="text-sm text-muted-foreground">{config.label}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{config.duration}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Object.entries(phaseConfig).map(([phase, config]) => {
            const phaseCandidates = getCandidatesByPhase(phase as Candidate['phase']);
            
            return (
              <div key={phase} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{config.label}</h3>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{config.duration}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {config.count}
                  </Badge>
                </div>
                
                <div className="space-y-3 min-h-[400px] lg:min-h-[500px] bg-muted/30 rounded-lg p-2 lg:p-3">
                  {phaseCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onPhaseChange={handlePhaseChange}
                      onTaskToggle={handleTaskToggle}
                      onViewDetails={setSelectedCandidate}
                    />
                  ))}
                  
                  {phaseCandidates.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Aucun candidat
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Candidate Detail Modal */}
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
                    <Label className="text-sm text-muted-foreground">Poste</Label>
                    <p className="font-medium">{selectedCandidate.position}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Phase actuelle</Label>
                    <p className="font-medium">{phaseConfig[selectedCandidate.phase].label}</p>
                  </div>
                </div>
                
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
                  <Label className="text-sm text-muted-foreground">Protocole</Label>
                  <p className="font-medium">{selectedCandidate.protocol}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Progression des tâches</Label>
                  <div className="mt-2 space-y-2">
                    {selectedCandidate.tasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center text-xs",
                          task.completed 
                            ? "bg-green-500 border-green-500 text-white" 
                            : "border-muted-foreground"
                        )}>
                          {task.completed && "✓"}
                        </div>
                        <span className={cn(
                          "text-sm",
                          task.completed 
                            ? "line-through text-muted-foreground" 
                            : "text-foreground"
                        )}>
                          {task.label}
                        </span>
                      </div>
                    ))}
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