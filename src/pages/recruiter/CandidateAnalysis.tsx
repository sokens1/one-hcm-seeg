import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Download, Calendar, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Types pour l'évaluation
interface ProtocolTask {
  id: string;
  name: string;
  completed: boolean;
  notes?: string;
}

interface CandidateData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentPosition: string;
  department: string;
  experience: string;
  appliedDate: string;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  documents: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  // Données du formulaire de candidature
  motivation?: string;
  availability?: string;
  salary?: string;
  skills?: string[];
}

// Configuration des protocoles
const protocolConfig = {
  1: {
    name: "PROTOCOLE 1",
    tasks: [
      { id: "doc_verification", name: "Vérification des documents", completed: false },
      { id: "mtp_adherence", name: "Adhérence MTP (Métier, Talent, Paradigme)", completed: false }
    ]
  },
  2: {
    name: "PROTOCOLE 2", 
    tasks: [
      { id: "physical_visit", name: "Visite physique", completed: false },
      { id: "interview", name: "Entretien", completed: false },
      { id: "role_play", name: "QCM / Jeux de rôle", completed: false },
      { id: "codir_games", name: "QCM / Jeux de CODIR", completed: false },
      { id: "job_sheet", name: "Édition fiche de fonction", completed: false },
      { id: "skill_gap", name: "Gap de compétence", completed: false }
    ]
  }
};

// Mock data pour le candidat
const mockCandidate: CandidateData = {
  id: 1,
  firstName: "Marie",
  lastName: "Obame",
  email: "marie.obame@email.com",
  phone: "+241 XX XX XX XX",
  currentPosition: "Développeuse Frontend",
  department: "IT",
  experience: "3 ans",
  appliedDate: "2024-01-15",
  status: "candidature",
  documents: [
    { name: "CV_Marie_Obame.pdf", type: "CV", url: "#" },
    { name: "Lettre_Motivation.pdf", type: "Lettre de motivation", url: "#" },
    { name: "Diplome_Master.pdf", type: "Diplôme", url: "#" }
  ],
  motivation: "Passionnée par le développement frontend et désireuse de contribuer à des projets innovants dans une entreprise en croissance.",
  availability: "Disponible immédiatement",
  salary: "800 000 FCFA",
  skills: ["React", "TypeScript", "CSS/SASS", "Git", "Figma"]
};

export default function CandidateAnalysis() {
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');
  
  const [candidate, setCandidate] = useState<CandidateData>(mockCandidate);
  const [activeProtocol, setActiveProtocol] = useState<1 | 2>(1);
  const [protocol1Tasks, setProtocol1Tasks] = useState<ProtocolTask[]>(protocolConfig[1].tasks);
  const [protocol2Tasks, setProtocol2Tasks] = useState<ProtocolTask[]>(protocolConfig[2].tasks);
  const [protocol1Score, setProtocol1Score] = useState(0);
  const [protocol2Score, setProtocol2Score] = useState(0);

  // Calcul du score en temps réel
  useEffect(() => {
    const completed1 = protocol1Tasks.filter(task => task.completed).length;
    const total1 = protocol1Tasks.length;
    setProtocol1Score(total1 > 0 ? Math.round((completed1 / total1) * 100) : 0);
  }, [protocol1Tasks]);

  useEffect(() => {
    const completed2 = protocol2Tasks.filter(task => task.completed).length;
    const total2 = protocol2Tasks.length;
    setProtocol2Score(total2 > 0 ? Math.round((completed2 / total2) * 100) : 0);
  }, [protocol2Tasks]);

  // Vérification si protocole 1 est terminé
  const protocol1Completed = protocol1Tasks.every(task => task.completed);

  const handleTaskToggle = (protocolNum: 1 | 2, taskId: string) => {
    if (protocolNum === 1) {
      setProtocol1Tasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    } else {
      setProtocol2Tasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    }
  };

  const handleStatusChange = (newStatus: CandidateData['status']) => {
    setCandidate(prev => ({ ...prev, status: newStatus }));
    // Redirection vers le pipeline avec le nouveau statut
    navigate(`/recruiter/jobs/${jobId}/pipeline`);
  };

  const handleScheduleNext = () => {
    // Logique pour planifier l'étape suivante
    console.log("Planifier l'étape suivante");
  };

  const handleGenerateReport = () => {
    // Logique pour générer le rapport du protocole
    console.log("Générer rapport du protocole", activeProtocol);
  };

  const renderActionButtons = () => {
    if (candidate.status === 'candidature') {
      return (
        <>
          <Button 
            variant="outline" 
            onClick={() => handleStatusChange('incubation')}
            disabled={!protocol1Completed}
            className="flex-1"
          >
            Déplacer en Incubation
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleStatusChange('refuse')}
            className="flex-1"
          >
            Refuser
          </Button>
        </>
      );
    } else if (candidate.status === 'incubation') {
      return (
        <>
          <Button 
            variant="hero" 
            onClick={() => handleStatusChange('embauche')}
            className="flex-1"
          >
            Engager
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleStatusChange('refuse')}
            className="flex-1"
          >
            Refuser
          </Button>
        </>
      );
    }
    return null;
  };

  // Déterminer les protocoles disponibles selon le statut
  const availableProtocols = candidate.status === 'incubation' ? [2] : [1, 2];

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/recruiter/jobs/${jobId}/pipeline`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Évaluation Détaillée - {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-muted-foreground">
              Évaluation structurée, scorée et collaborative du candidat
            </p>
          </div>
        </div>

        {/* Layout en 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne Profil du Candidat */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profil du Candidat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Nom complet</Label>
                    <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-medium">{candidate.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Téléphone</Label>
                    <p className="font-medium">{candidate.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Poste actuel</Label>
                    <p className="font-medium">{candidate.currentPosition}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Département</Label>
                    <p className="font-medium">{candidate.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Ancienneté</Label>
                    <p className="font-medium">{candidate.experience}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Date de candidature</Label>
                  <p className="font-medium">
                    {new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Statut actuel</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">{candidate.status}</Badge>
                  </div>
                </div>

                {candidate.motivation && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Motivation</Label>
                    <p className="text-sm">{candidate.motivation}</p>
                  </div>
                )}

                {candidate.skills && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Compétences</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {candidate.availability && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Disponibilité</Label>
                    <p className="text-sm">{candidate.availability}</p>
                  </div>
                )}

                {candidate.salary && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Prétention salariale</Label>
                    <p className="text-sm">{candidate.salary}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidate.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}>
                          <FileText className="w-3 h-3 mr-1" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne Zone d'Évaluation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zone d'Évaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeProtocol.toString()} onValueChange={(value) => setActiveProtocol(parseInt(value) as 1 | 2)}>
                  <TabsList className="grid w-full grid-cols-2">
                    {availableProtocols.includes(1) && (
                      <TabsTrigger value="1" disabled={candidate.status === 'incubation'}>
                        PROTOCOLE 1
                      </TabsTrigger>
                    )}
                    <TabsTrigger 
                      value="2" 
                      disabled={!protocol1Completed && candidate.status === 'candidature'}
                      className={!protocol1Completed && candidate.status === 'candidature' ? 'opacity-50' : ''}
                    >
                      PROTOCOLE 2
                    </TabsTrigger>
                  </TabsList>

                  {/* Protocole 1 */}
                  {candidate.status !== 'incubation' && (
                    <TabsContent value="1" className="space-y-6">
                      {/* Score Protocole 1 */}
                      <div className="text-center space-y-4">
                        <div className="text-2xl font-bold text-foreground">
                          Score Protocole 1 : {protocol1Score} / 100
                        </div>
                        <Progress value={protocol1Score} className="h-3" />
                      </div>

                      {/* Checklist Protocole 1 */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Checklist des Tâches d'Évaluation</h4>
                        {protocol1Tasks.map((task) => (
                          <div key={task.id} className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={task.id}
                                checked={task.completed}
                                onCheckedChange={() => handleTaskToggle(1, task.id)}
                              />
                              <Label htmlFor={task.id} className="cursor-pointer">
                                {task.name}
                              </Label>
                            </div>
                            {task.id === 'mtp_adherence' && (
                              <div className="ml-6 space-y-2">
                                <Textarea
                                  placeholder="Notes sur Métier, Talent, Paradigme..."
                                  rows={2}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {!protocol1Completed && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            Complétez toutes les tâches du Protocole 1 pour débloquer le Protocole 2.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  )}

                  {/* Protocole 2 */}
                  <TabsContent value="2" className="space-y-6">
                    {/* Score Protocole 2 */}
                    <div className="text-center space-y-4">
                      <div className="text-2xl font-bold text-foreground">
                        Score Protocole 2 : {protocol2Score} / 100
                      </div>
                      <Progress value={protocol2Score} className="h-3" />
                    </div>

                    {/* Checklist Protocole 2 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Checklist des Tâches d'Évaluation</h4>
                      {protocol2Tasks.map((task) => (
                        <div key={task.id} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={task.id}
                              checked={task.completed}
                              onCheckedChange={() => handleTaskToggle(2, task.id)}
                            />
                            <Label htmlFor={task.id} className="cursor-pointer">
                              {task.name}
                            </Label>
                          </div>
                          <div className="ml-6">
                            <Textarea
                              placeholder={`Notes pour ${task.name}...`}
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {candidate.status === 'candidature' && !protocol1Completed && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Disponible après validation du Protocole 1
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Actions auxiliaires */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button variant="outline" className="w-full gap-2" onClick={handleScheduleNext}>
                  <Calendar className="w-4 h-4" />
                  Planifier l'étape suivante
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={handleGenerateReport}>
                  <FileCheck className="w-4 h-4" />
                  Rapport du protocole
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Barre d'Actions Principales */}
        <div className="mt-8 flex gap-4">
          {renderActionButtons()}
        </div>
      </div>
    </RecruiterLayout>
  );
}