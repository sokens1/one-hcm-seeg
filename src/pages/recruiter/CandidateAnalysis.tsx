import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Calendar, CheckCircle, XCircle, FileText, Eye } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Types pour l'évaluation
interface EvaluationTask {
  id: string;
  name: string;
  points: number;
  completed: boolean;
  notes: string;
}

interface CandidateDetails {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentPosition: string;
  currentDepartment: string;
  yearsExperience: number;
  applicationDate: string;
  cv: string;
  coverLetter: string;
  otherDocuments: string[];
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
  
  // Informations du formulaire de candidature
  motivation: string;
  availability: string;
  salary: string;
  skills: string[];
  education: string;
  languages: string[];
}

// Mock data pour le candidat
const mockCandidate: CandidateDetails = {
  id: 1,
  firstName: "Marie",
  lastName: "Obame",
  email: "marie.obame@email.com",
  phone: "+241 XX XX XX XX",
  currentPosition: "Développeuse Frontend",
  currentDepartment: "IT",
  yearsExperience: 3,
  applicationDate: "2024-01-15",
  cv: "cv-marie-obame.pdf",
  coverLetter: "lettre-motivation-marie.pdf",
  otherDocuments: ["portfolio.pdf", "certificats.pdf"],
  status: "candidature",
  motivation: "Je souhaite rejoindre votre équipe pour contribuer à des projets innovants et développer mes compétences en React.",
  availability: "Immédiate",
  salary: "800 000 FCFA",
  skills: ["React", "TypeScript", "Node.js", "Git"],
  education: "Master en Informatique - Université Omar Bongo",
  languages: ["Français", "Anglais", "Fang"]
};

export default function CandidateAnalysis() {
  const { jobId, candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate] = useState<CandidateDetails>(mockCandidate);
  const [activeTab, setActiveTab] = useState(candidate.status === 'incubation' ? "protocole2" : "protocole1");

  // État pour le Protocole 1
  const [protocol1Tasks, setProtocol1Tasks] = useState<EvaluationTask[]>([
    { id: "doc", name: "Vérification des documents", points: 10, completed: false, notes: "" },
    { id: "mtp-metier", name: "Adhérence MTP (Métier)", points: 20, completed: false, notes: "" },
    { id: "mtp-talent", name: "Adhérence MTP (Talent)", points: 20, completed: false, notes: "" },
    { id: "mtp-paradigme", name: "Adhérence MTP (Paradigme)", points: 20, completed: false, notes: "" }
  ]);

  // État pour le Protocole 2
  const [protocol2Tasks, setProtocol2Tasks] = useState<EvaluationTask[]>([
    { id: "visite", name: "Visite physique", points: 5, completed: false, notes: "" },
    { id: "entretien", name: "Entretien", points: 15, completed: false, notes: "" },
    { id: "jeux-role", name: "Jeux de rôle", points: 10, completed: false, notes: "" },
    { id: "jeux-codir", name: "Jeux de CODIR", points: 10, completed: false, notes: "" },
    { id: "fiche-fonction", name: "Édition fiche de fonction", points: 5, completed: false, notes: "" },
    { id: "gap-competence", name: "Gap de compétence", points: 10, completed: false, notes: "" }
  ]);

  // Calculs des scores
  const protocol1Score = protocol1Tasks.reduce((total, task) => 
    total + (task.completed ? task.points : 0), 0
  );
  const protocol1Total = protocol1Tasks.reduce((total, task) => total + task.points, 0);
  const protocol1Completed = protocol1Tasks.every(task => task.completed);

  const protocol2Score = protocol2Tasks.reduce((total, task) => 
    total + (task.completed ? task.points : 0), 0
  );
  const protocol2Total = protocol2Tasks.reduce((total, task) => total + task.points, 0);

  const handleTaskToggle = (
    taskId: string, 
    isProtocol1: boolean, 
    setter: React.Dispatch<React.SetStateAction<EvaluationTask[]>>
  ) => {
    setter(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleNotesChange = (
    taskId: string, 
    notes: string, 
    setter: React.Dispatch<React.SetStateAction<EvaluationTask[]>>
  ) => {
    setter(prev => prev.map(task => 
      task.id === taskId ? { ...task, notes } : task
    ));
  };

  const handleIncuber = () => {
    toast.success("Candidat déplacé en incubation");
    navigate(`/recruiter/jobs/${jobId}/pipeline`);
  };

  const handleRefuser = () => {
    toast.error("Candidat refusé");
    navigate(`/recruiter/jobs/${jobId}/pipeline`);
  };

  const handleEngager = () => {
    toast.success("Candidat embauché");
    navigate(`/recruiter/jobs/${jobId}/pipeline`);
  };

  const handleGenerateReport = () => {
    const activeProtocol = candidate.status === 'incubation' ? 'Protocole 2' : 'Protocole 1';
    toast.success(`Rapport du ${activeProtocol} généré et envoyé au candidat`);
  };

  const handleScheduleNext = () => {
    toast.success("Invitation à l'étape suivante envoyée au candidat");
  };

  const handleViewDocument = (docName: string) => {
    toast.info(`Ouverture du document: ${docName}`);
  };

  const handleDownloadDocument = (docName: string) => {
    toast.success(`Téléchargement de ${docName} en cours`);
  };

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
              Évaluation : {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-muted-foreground">
              Analyse détaillée et évaluation du candidat
            </p>
          </div>
        </div>

        {/* Layout en 2 parties */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne du haut - Profil du Candidat */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Profil du Candidat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Informations personnelles</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nom :</span>
                        <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email :</span>
                        <p className="font-medium">{candidate.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Téléphone :</span>
                        <p className="font-medium">{candidate.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expérience professionnelle */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Expérience</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Poste actuel :</span>
                        <p className="font-medium">{candidate.currentPosition}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Département :</span>
                        <p className="font-medium">{candidate.currentDepartment}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ancienneté :</span>
                        <p className="font-medium">{candidate.yearsExperience} années</p>
                      </div>
                    </div>
                  </div>

                  {/* Informations de candidature */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Candidature</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Motivation :</span>
                        <p className="font-medium text-xs">{candidate.motivation}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Disponibilité :</span>
                        <p className="font-medium">{candidate.availability}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prétention :</span>
                        <p className="font-medium">{candidate.salary}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents et compétences */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Documents</h4>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => handleViewDocument(candidate.cv)}
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => handleDownloadDocument(candidate.cv)}
                        >
                          <Download className="w-4 h-4" />
                          {candidate.cv}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => handleViewDocument(candidate.coverLetter)}
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-2"
                          onClick={() => handleDownloadDocument(candidate.coverLetter)}
                        >
                          <Download className="w-4 h-4" />
                          {candidate.coverLetter}
                        </Button>
                      </div>
                      {candidate.otherDocuments.map((doc, index) => (
                        <div key={index} className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 gap-2"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 gap-2"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="w-4 h-4" />
                            {doc}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne du bas - Zone d'Évaluation */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {candidate.status !== 'incubation' ? (
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="protocole1">
                    PROTOCOLE 1
                  </TabsTrigger>
                  <TabsTrigger 
                    value="protocole2" 
                    disabled={true}
                    className="opacity-50"
                  >
                    PROTOCOLE 2
                  </TabsTrigger>
                </TabsList>
              ) : (
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="protocole2">
                    PROTOCOLE 2
                  </TabsTrigger>
                </TabsList>
              )}

              {/* Protocole 1 - Seulement visible si pas en incubation */}
              {candidate.status !== 'incubation' && (
                <TabsContent value="protocole1" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Protocole 1 : Évaluation Initiale</CardTitle>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {protocol1Score} / {protocol1Total}
                          </div>
                          <div className="text-sm text-muted-foreground">Score en temps réel</div>
                        </div>
                      </div>
                      <Progress value={(protocol1Score / protocol1Total) * 100} className="h-3" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <h4 className="font-semibold">Critères de recrutement</h4>
                      
                      {protocol1Tasks.map((task) => (
                        <div key={task.id} className="space-y-3 p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => handleTaskToggle(task.id, true, setProtocol1Tasks)}
                            />
                            <span className="font-medium">{task.name}</span>
                            <Badge variant="outline">+{task.points} pts</Badge>
                          </div>
                          <Textarea
                            placeholder={`Commentaires sur ${task.name.toLowerCase()}...`}
                            value={task.notes}
                            onChange={(e) => handleNotesChange(task.id, e.target.value, setProtocol1Tasks)}
                            rows={2}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Protocole 2 */}
              <TabsContent value="protocole2" className="space-y-6">
                {candidate.status !== 'incubation' ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-muted-foreground">
                        <XCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Protocole 2 indisponible</h3>
                        <p>Disponible après passage en incubation</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Protocole 2 : Évaluation Approfondie</CardTitle>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {protocol2Score} / {protocol2Total}
                          </div>
                          <div className="text-sm text-muted-foreground">Score en temps réel</div>
                        </div>
                      </div>
                      <Progress value={(protocol2Score / protocol2Total) * 100} className="h-3" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {protocol2Tasks.map((task) => (
                        <div key={task.id} className="space-y-3 p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => handleTaskToggle(task.id, false, setProtocol2Tasks)}
                            />
                            <span className="font-medium">{task.name}</span>
                            <Badge variant="outline">+{task.points} pts</Badge>
                          </div>
                          <Textarea
                            placeholder={`Commentaires sur ${task.name.toLowerCase()}...`}
                            value={task.notes}
                            onChange={(e) => handleNotesChange(task.id, e.target.value, setProtocol2Tasks)}
                            rows={2}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Barre d'Actions Principales */}
        <div className="mt-8 space-y-4">
          {/* Actions selon le statut */}
          <div className="p-6 bg-muted/30 rounded-lg">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleScheduleNext}
              >
                <Calendar className="w-4 h-4" />
                Planifier l'étape suivante
              </Button>
              
              {candidate.status === 'candidature' && (
                <>
                  <Button 
                    variant="default" 
                    className="gap-2 bg-yellow-600 hover:bg-yellow-700"
                    onClick={handleIncuber}
                    disabled={!protocol1Completed}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Incuber
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="gap-2"
                    onClick={handleRefuser}
                  >
                    <XCircle className="w-4 h-4" />
                    Refuser
                  </Button>
                </>
              )}
              
              {candidate.status === 'incubation' && (
                <>
                  <Button 
                    variant="default" 
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={handleEngager}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Engager
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="gap-2"
                    onClick={handleRefuser}
                  >
                    <XCircle className="w-4 h-4" />
                    Refuser
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Bouton rapport du protocole */}
          <div className="text-center">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleGenerateReport}
            >
              <FileText className="w-4 h-4" />
              Rapport du protocole
            </Button>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}