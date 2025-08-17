import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, X, User, Calendar, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";

// Types pour le tunnel de recrutement
interface Task {
  id: string;
  name: string;
  completed: boolean;
}

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  phase: 'candidature' | 'preselection' | 'selection' | 'embauche';
  tasks: Task[];
  notes?: string;
  mentor?: string;
  contractType?: string;
}

// Configuration des phases
const phaseConfig = {
  candidature: {
    label: "Candidature",
    duration: "2 semaines",
    description: "Candidats ayant passé le premier filtre, profil activement analysé",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  preselection: {
    label: "Pré-sélection",
    duration: "1 semaine", 
    description: "Assessment Center virtuel, coaching commence",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  selection: {
    label: "Sélection",
    duration: "12 semaines",
    description: "Phase d'immersion et évaluation comportementale, mentoring au cœur du processus",
    color: "bg-purple-100 text-purple-800 border-purple-200"
  },
  embauche: {
    label: "Embauche",
    duration: "n semaines",
    description: "Candidat embauché (CDD/CDI), suivi de l'intégration (onboarding)",
    color: "bg-green-100 text-green-800 border-green-200"
  }
};

// Mock data avec exemples selon vos spécifications
const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    position: "Chef de Projet Innovation",
    phase: "candidature",
    tasks: [
      { id: "1", name: "Analyse des profils", completed: false }
    ]
  },
  {
    id: 2,
    firstName: "Aïssata",
    lastName: "Traoré",
    position: "Data Scientist Senior",
    phase: "preselection",
    tasks: [
      { id: "1", name: "Tests de personnalité", completed: true },
      { id: "2", name: "Tests de raisonnement", completed: true },
      { id: "3", name: "Evaluation du Gap de compétence", completed: false },
      { id: "4", name: "Entretien Face à Face", completed: false },
      { id: "5", name: "QCM / Jeux de rôle", completed: false }
    ]
  },
  {
    id: 3,
    firstName: "Marc",
    lastName: "Lemoine",
    position: "Développeur Backend",
    phase: "selection",
    tasks: [
      { id: "1", name: "Evaluation des comportements pro.", completed: true },
      { id: "2", name: "Job Shadowing", completed: false },
      { id: "3", name: "Conduite d'un Projet à valeur ajoutée", completed: false },
      { id: "4", name: "Edition Fiche de poste", completed: false }
    ],
    mentor: "Sarah Martin"
  },
  {
    id: 4,
    firstName: "Sophie",
    lastName: "Martin",
    position: "Data Scientist Senior",
    phase: "embauche",
    contractType: "CDI",
    tasks: [
      { id: "1", name: "Intégration & Formation", completed: true },
      { id: "2", name: "Team Building", completed: false },
      { id: "3", name: "Suivi Productivité & Performance", completed: false },
      { id: "4", name: "Evaluation continue", completed: false }
    ]
  }
];

interface CandidateCardProps {
  candidate: Candidate;
  onTaskToggle: (candidateId: number, taskId: string) => void;
  onViewDetails: (candidate: Candidate) => void;
  onPhaseChange: (candidateId: number, newPhase: Candidate['phase']) => void;
}

function CandidateCard({ candidate, onTaskToggle, onViewDetails, onPhaseChange }: CandidateCardProps) {
  const completedTasks = candidate.tasks.filter(task => task.completed).length;
  const totalTasks = candidate.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const getProtocoleName = () => {
    switch (candidate.phase) {
      case 'candidature': return 'Protocole 1';
      case 'preselection': return 'Protocole 2 : Coaching & Assessment';
      case 'selection': return 'Protocole 3 : Mentoring & Engagement';
      case 'embauche': return 'Protocole 4 : Intégration & Performance';
      default: return '';
    }
  };

  // Trouver la prochaine tâche à faire
  const nextTask = candidate.tasks.find(task => !task.completed);
  const canAdvance = completedTasks === totalTasks && totalTasks > 0;

  return (
    <Card className="cursor-pointer hover:shadow-medium transition-all group mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header candidat */}
          <div>
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {candidate.firstName} {candidate.lastName}
            </h4>
            <p className="text-sm text-muted-foreground">
              Poste : {candidate.position}
              {candidate.contractType && ` (${candidate.contractType})`}
            </p>
            {candidate.mentor && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                Mentor : {candidate.mentor}
              </p>
            )}
          </div>

          {/* Protocole */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              {getProtocoleName()}
            </p>
            
            {/* Prochaine tâche uniquement */}
            {nextTask && (
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`task-${candidate.id}-${nextTask.id}`}
                  checked={nextTask.completed}
                  onCheckedChange={() => onTaskToggle(candidate.id, nextTask.id)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`task-${candidate.id}-${nextTask.id}`}
                  className="text-sm cursor-pointer text-foreground"
                >
                  {nextTask.name}
                </label>
              </div>
            )}

            {/* Score seulement */}
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progression :</span>
              <span className="font-medium">{completedTasks}/{totalTasks}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(candidate);
              }}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Voir détails
            </Button>

            {/* Bouton d'avancement si toutes les tâches sont terminées */}
            {canAdvance && candidate.phase !== 'embauche' && (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextPhase = {
                    candidature: 'preselection',
                    preselection: 'selection',
                    selection: 'embauche'
                  }[candidate.phase] as Candidate['phase'];
                  onPhaseChange(candidate.id, nextPhase);
                }}
                className="text-xs bg-primary hover:bg-primary/90"
              >
                Faire avancer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecruiterPipeline() {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

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

  const handlePhaseChange = (candidateId: number, newPhase: Candidate['phase']) => {
    setCandidates(prev =>
      prev.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, phase: newPhase }
          : candidate
      )
    );
  };

  const getCandidatesByPhase = (phase: Candidate['phase']) => {
    return candidates.filter(candidate => candidate.phase === phase);
  };

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tunnel de Recrutement</h1>
          <p className="text-muted-foreground">
            Suivi des candidats en parcours d'évaluation avancé
          </p>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(phaseConfig).map(([phase, config]) => {
            const count = getCandidatesByPhase(phase as Candidate['phase']).length;
            return (
              <Card key={phase}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <div className="text-sm text-muted-foreground">{config.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tableau Kanban */}
        <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto">
          {Object.entries(phaseConfig).map(([phase, config]) => {
            const phaseCandidates = getCandidatesByPhase(phase as Candidate['phase']);
            
            return (
              <div key={phase} className="flex-1 min-w-[280px] max-w-none lg:max-w-[25%]">
                {/* Conteneur unifié avec header et candidats */}
                <Card className="h-full">
                  {/* Header de colonne - hauteur fixe pour alignement */}
                  <CardHeader className="pb-3 border-b h-[100px] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium leading-tight">{config.label}</CardTitle>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1" />
                        {config.duration}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
                  </CardHeader>
                  
                  {/* Zone des candidats avec scroll */}
                  <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                    {phaseCandidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        onTaskToggle={handleTaskToggle}
                        onViewDetails={setSelectedCandidate}
                        onPhaseChange={handlePhaseChange}
                      />
                    ))}
                    
                    {phaseCandidates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Aucun candidat dans cette phase
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de détails candidat */}
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
              <div>
                <Label className="text-sm text-muted-foreground">Poste</Label>
                <p className="font-medium">{selectedCandidate.position}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Phase actuelle</Label>
                <p className="font-medium">{phaseConfig[selectedCandidate.phase].label}</p>
              </div>

              {selectedCandidate.mentor && (
                <div>
                  <Label className="text-sm text-muted-foreground">Mentor assigné</Label>
                  <p className="font-medium">{selectedCandidate.mentor}</p>
                </div>
              )}

              <div>
                <Label className="text-sm text-muted-foreground">Tâches en cours</Label>
                <div className="mt-2 space-y-2">
                  {selectedCandidate.tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(selectedCandidate.id, task.id)}
                      />
                      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        {task.name}
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

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir CV
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Planifier entretien
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </RecruiterLayout>
  );
}