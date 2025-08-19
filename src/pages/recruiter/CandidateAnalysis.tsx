import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useApplication } from "@/hooks/useApplications";
import { useApplicationDocuments, getDocumentTypeLabel, formatFileSize } from "@/hooks/useDocuments";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Eye, FileText, Calendar, Users2, UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";

// Types
interface Protocol {
  id: string;
  name: string;
  tasks: Task[];
  completed: boolean;
  score: number;
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
  notes?: string;
}

interface CandidateData {
  id: number;
  name: string;
  email: string;
  phone: string;
  currentPosition: string;
  currentDepartment: string;
  experience: string;
  education: string;
  skills: string[];
  motivation: string;
  availability: string;
  expectedSalary: string;
  documents: {
    cv: string;
    coverLetter: string;
    diploma: string;
    recommendations: string[];
  };
  applicationDate: string;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse';
}

const initialProtocols: Protocol[] = [
  {
    id: "protocol1",
    name: "PROTOCOLE 1",
    tasks: [
      { id: "docs", name: "Vérification des documents", completed: false },
      { id: "mtp_m", name: "Adhérence Métier", completed: false, notes: "" },
      { id: "mtp_t", name: "Adhérence Talent", completed: false, notes: "" },
      { id: "mtp_p", name: "Adhérence Paradigme", completed: false, notes: "" }
    ],
    completed: false,
    score: 0
  },
  {
    id: "protocol2",
    name: "PROTOCOLE 2",
    tasks: [
      { id: "visit", name: "Visite physique", completed: false },
      { id: "interview", name: "Entretien", completed: false },
      { id: "qcm_role", name: "QCM / Jeux de rôle", completed: false },
      { id: "qcm_codir", name: "QCM / Jeux de CODIR", completed: false },
      { id: "job_sheet", name: "Édition fiche de fonction", completed: false },
      { id: "skills_gap", name: "Gap de compétence", completed: false }
    ],
    completed: false,
    score: 0
  }
];

export default function CandidateAnalysis() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: application, isLoading, error } = useApplication(id);
  const { data: documents = [], isLoading: documentsLoading } = useApplicationDocuments(id);
  const [protocols, setProtocols] = useState<Protocol[]>(initialProtocols);
  const [activeTab, setActiveTab] = useState("protocol1");

  // Determine jobId for navigation back to the correct pipeline
  const jobIdFromQuery = searchParams.get('jobId') || undefined;
  const jobId = jobIdFromQuery || application?.job_offers?.id || undefined;

  // Transform application data to candidate format
  const candidate: CandidateData | null = application ? {
    id: parseInt(application.id),
    name: `${application.users?.first_name || ''} ${application.users?.last_name || ''}`.trim(),
    email: application.users?.email || '',
    phone: application.users?.phone || 'Non fourni',
    currentPosition: 'Non spécifié', // Placeholder
    currentDepartment: 'Non spécifié', // Placeholder
    experience: 'Non spécifié', // Placeholder
    education: 'Non spécifié', // Placeholder
    skills: [], // Placeholder
    motivation: application.motivation || application.cover_letter || 'Non fournie',
    availability: application.availability_start || 'Non spécifiée',
    expectedSalary: 'Non spécifié', // Placeholder
    documents: {
      cv: '/documents/placeholder.pdf',
      coverLetter: '/documents/placeholder.pdf',
      diploma: '/documents/placeholder.pdf',
      recommendations: []
    },
    applicationDate: new Date(application.created_at).toLocaleDateString('fr-FR'),
    status: application.status
  } : null;

  if (isLoading) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Chargement des données du candidat...</span>
            </div>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  if (error || !candidate) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Erreur lors du chargement des données du candidat.</p>
            <Button onClick={() => navigate(-1)}>Retour</Button>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  const updateTaskCompletion = (protocolId: string, taskId: string, completed: boolean) => {
    setProtocols(prev => prev.map(protocol => {
      if (protocol.id === protocolId) {
        const updatedTasks = protocol.tasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        );
        const completedTasks = updatedTasks.filter(task => task.completed).length;
        const score = Math.round((completedTasks / updatedTasks.length) * 100);
        const protocolCompleted = completedTasks === updatedTasks.length;
        
        return {
          ...protocol,
          tasks: updatedTasks,
          score,
          completed: protocolCompleted
        };
      }
      return protocol;
    }));
  };

  const updateTaskNotes = (protocolId: string, taskId: string, notes: string) => {
    setProtocols(prev => prev.map(protocol => {
      if (protocol.id === protocolId) {
        const updatedTasks = protocol.tasks.map(task => 
          task.id === taskId ? { ...task, notes } : task
        );
        return { ...protocol, tasks: updatedTasks };
      }
      return protocol;
    }));
  };

  const protocol1 = protocols.find(p => p.id === "protocol1")!;
  const protocol2 = protocols.find(p => p.id === "protocol2")!;
  const isProtocol2Enabled = protocol1.completed;

  const handleStatusChange = (newStatus: CandidateData['status']) => {
    // Ici vous pourriez mettre à jour le statut du candidat
    console.log(`Changement de statut vers: ${newStatus}`);
    if (jobId) {
      navigate(`/recruiter/jobs/${jobId}/pipeline`);
    } else {
      navigate(-1);
    }
  };

  const downloadDocument = (documentPath: string) => {
    // Simulation du téléchargement
    console.log(`Téléchargement de: ${documentPath}`);
  };

  const viewDocument = (documentPath: string) => {
    // Simulation de la visualisation
    console.log(`Visualisation de: ${documentPath}`);
    window.open(documentPath, '_blank');
  };

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to={jobId ? `/recruiter/jobs/${jobId}/pipeline` : "#"} onClick={(e) => { if (!jobId) { e.preventDefault(); navigate(-1); } }}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au pipeline
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Évaluation Détaillée du Candidat
          </h1>
          <p className="text-muted-foreground">
            Évaluation structurée et collaborative pour {candidate.name}
          </p>
        </div>

        {/* Layout en 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Profil du Candidat */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Profil du Candidat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Nom complet</Label>
                    <p className="font-medium">{candidate.name}</p>
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
                    <Label className="text-sm text-muted-foreground">Date de candidature</Label>
                    <p className="font-medium">{candidate.applicationDate}</p>
                  </div>
                </div>

                {/* Expérience professionnelle */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Expérience Professionnelle</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Poste actuel</Label>
                      <p className="font-medium">{candidate.currentPosition}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Département</Label>
                      <p className="font-medium">{candidate.currentDepartment}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Expérience</Label>
                      <p className="font-medium">{candidate.experience}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Disponibilité</Label>
                      <p className="font-medium">{candidate.availability}</p>
                    </div>
                  </div>
                </div>

                {/* Formation */}
                <div>
                  <Label className="text-sm text-muted-foreground">Formation</Label>
                  <p className="font-medium">{candidate.education}</p>
                </div>

                {/* Compétences */}
                <div>
                  <Label className="text-sm text-muted-foreground">Compétences</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Motivation */}
                <div>
                  <Label className="text-sm text-muted-foreground">Motivation</Label>
                  <p className="text-sm mt-1">{candidate.motivation}</p>
                </div>

                {/* Salaire attendu */}
                <div>
                  <Label className="text-sm text-muted-foreground">Salaire attendu</Label>
                  <p className="font-medium">{candidate.expectedSalary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents du Candidat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {documentsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm text-muted-foreground">Chargement des documents...</span>
                  </div>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{getDocumentTypeLabel(doc.document_type)}</p>
                          <p className="text-sm text-muted-foreground">{doc.file_name} - {formatFileSize(doc.file_size)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => viewDocument(doc.file_path)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadDocument(doc.file_path)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun document téléchargé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Zone d'Évaluation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Zone d'Évaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="protocol1" className="text-sm">
                      PROTOCOLE 1
                    </TabsTrigger>
                    <TabsTrigger 
                      value="protocol2" 
                      className="text-sm"
                      disabled={!isProtocol2Enabled}
                    >
                      PROTOCOLE 2
                    </TabsTrigger>
                  </TabsList>

                  {/* PROTOCOLE 1 */}
                  <TabsContent value="protocol1" className="space-y-6 mt-6">
                    {/* Score visuel */}
                    <div className="text-center p-6 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {protocol1.score}/100
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Score Protocole 1</p>
                      <Progress value={protocol1.score} className="h-3" />
                    </div>

                    {/* Checklist des tâches */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Checklist des Tâches d'Évaluation</h3>
                      
                      {protocol1.tasks.map((task) => (
                        <div key={task.id} className="space-y-3 p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={task.id}
                              checked={task.completed}
                              onCheckedChange={(checked) => 
                                updateTaskCompletion("protocol1", task.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={task.id} className="font-medium cursor-pointer">
                              {task.name}
                            </Label>
                          </div>
                          
                          {task.id.startsWith('mtp_') && (
                            <div className="ml-6">
                              <Label className="text-sm text-muted-foreground">Notes d'évaluation</Label>
                              <Textarea
                                placeholder={`Évaluez ${task.name.split(' ')[1]}...`}
                                value={task.notes || ''}
                                onChange={(e) => updateTaskNotes("protocol1", task.id, e.target.value)}
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* PROTOCOLE 2 */}
                  <TabsContent value="protocol2" className="space-y-6 mt-6">
                    {!isProtocol2Enabled ? (
                      <div className="text-center p-8 text-muted-foreground">
                        <Users2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium mb-2">Protocole 2 non disponible</p>
                        <p className="text-sm">Veuillez d'abord valider le Protocole 1</p>
                      </div>
                    ) : (
                      <>
                        {/* Score visuel */}
                        <div className="text-center p-6 bg-muted/30 rounded-lg">
                          <div className="text-3xl font-bold text-primary mb-2">
                            {protocol2.score}/100
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">Score Protocole 2</p>
                          <Progress value={protocol2.score} className="h-3" />
                        </div>

                        {/* Checklist des tâches */}
                        <div className="space-y-4">
                          <h3 className="font-semibold">Checklist des Tâches d'Évaluation</h3>
                          
                          {protocol2.tasks.map((task) => (
                            <div key={task.id} className="space-y-3 p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id={task.id}
                                  checked={task.completed}
                                  onCheckedChange={(checked) => 
                                    updateTaskCompletion("protocol2", task.id, checked as boolean)
                                  }
                                />
                                <Label htmlFor={task.id} className="font-medium cursor-pointer">
                                  {task.name}
                                </Label>
                              </div>
                              
                              <div className="ml-6">
                                <Label className="text-sm text-muted-foreground">Notes d'évaluation</Label>
                                <Textarea
                                  placeholder={`Notes pour ${task.name}...`}
                                  value={task.notes || ''}
                                  onChange={(e) => updateTaskNotes("protocol2", task.id, e.target.value)}
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Actions principales */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Actions</h3>
                  
                  {candidate.status === 'candidature' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button 
                        variant="default" 
                        className="gap-2"
                        onClick={() => handleStatusChange('incubation')}
                        disabled={!protocol1.completed}
                      >
                        <Users2 className="w-4 h-4" />
                        Déplacer en Incubation
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="gap-2"
                        onClick={() => handleStatusChange('refuse')}
                      >
                        <UserX className="w-4 h-4" />
                        Refuser
                      </Button>
                    </div>
                  )}

                  {candidate.status === 'incubation' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button 
                        variant="default" 
                        className="gap-2"
                        onClick={() => handleStatusChange('embauche')}
                        disabled={!protocol2.completed}
                      >
                        <UserCheck className="w-4 h-4" />
                        Engager
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="gap-2"
                        onClick={() => handleStatusChange('refuse')}
                      >
                        <UserX className="w-4 h-4" />
                        Refuser
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => {
                        // Générer rapport de protocole
                        console.log("Génération du rapport de protocole");
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      Rapport du Protocole
                    </Button>
                  </div>

                  <Button 
                    variant="secondary" 
                    className="w-full gap-2"
                    onClick={() => {
                      // Planifier étape suivante
                      console.log("Planification de l'étape suivante");
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    Planifier l'Étape Suivante
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}