import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Phone, Download, Calendar, CheckCircle, X, User } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";

interface ProtocolItem {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  notes: string;
}

const mockCandidate = {
  id: 1,
  firstName: "Sarah",
  lastName: "Mba",
  email: "sarah.mba@email.com",
  phone: "+241 XX XX XX XX",
  currentPosition: "Chef de Service Clientèle",
  department: "Service Client",
  yearsExperience: 8,
  appliedDate: "2024-01-13",
  status: "incubation" as 'candidature' | 'incubation' | 'embauche' | 'refuse',
};

export default function CandidateAnalysis() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job');

  // États pour les protocoles
  const [protocol1Items, setProtocol1Items] = useState<ProtocolItem[]>([
    { id: "docs", label: "Validation des documents requis", points: 10, completed: true, notes: "Tous les documents fournis et conformes" },
    { id: "metier", label: "Adhérence MTP (Métier)", points: 20, completed: true, notes: "Excellente maîtrise du secteur électricité" },
    { id: "talent", label: "Adhérence MTP (Talent)", points: 20, completed: false, notes: "" },
    { id: "paradigme", label: "Adhérence MTP (Paradigme)", points: 20, completed: false, notes: "" },
  ]);

  const [protocol2Items, setProtocol2Items] = useState<ProtocolItem[]>([
    { id: "visite", label: "Visite physique", points: 5, completed: true, notes: "Visite effectuée le 15/01/2024" },
    { id: "entretien", label: "Entretien", points: 15, completed: false, notes: "" },
    { id: "jeux_role", label: "Jeux de rôle", points: 10, completed: false, notes: "" },
    { id: "jeux_codir", label: "Jeux de CoDir", points: 10, completed: false, notes: "" },
    { id: "fiche_fonction", label: "Édition fiche de fonction", points: 5, completed: false, notes: "" },
    { id: "gap_competences", label: "Gap de compétences validé", points: 10, completed: false, notes: "" },
  ]);

  const [globalNotes, setGlobalNotes] = useState("");

  // Calcul des scores
  const calculateScore = (items: ProtocolItem[]) => {
    const completedPoints = items.filter(item => item.completed).reduce((sum, item) => sum + item.points, 0);
    const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
    return { completedPoints, totalPoints, percentage: (completedPoints / totalPoints) * 100 };
  };

  const protocol1Score = calculateScore(protocol1Items);
  const protocol2Score = calculateScore(protocol2Items);

  const updateProtocolItem = (protocol: 1 | 2, itemId: string, field: 'completed' | 'notes', value: boolean | string) => {
    const setter = protocol === 1 ? setProtocol1Items : setProtocol2Items;
    setter(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const isProtocol2Enabled = mockCandidate.status === 'incubation' || mockCandidate.status === 'embauche';

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={`/recruiter/jobs/${jobId}/pipeline`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analyse du Candidat</h1>
            <p className="text-muted-foreground">Évaluation complète et prise de décision</p>
          </div>
        </div>

        {/* Layout en trois parties */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Partie Gauche - Informations candidat et documents */}
          <div className="lg:col-span-3 space-y-4">
            {/* Informations candidat */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{mockCandidate.firstName} {mockCandidate.lastName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{mockCandidate.currentPosition}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">{mockCandidate.department}</p>
                  <p className="text-xs text-muted-foreground">{mockCandidate.yearsExperience} années d'ancienneté</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{mockCandidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{mockCandidate.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Télécharger le CV
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Télécharger la lettre
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Autres documents
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Partie Centrale - Onglets d'évaluation */}
          <div className="lg:col-span-6">
            <Tabs defaultValue="protocol1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history">Historique & Notes</TabsTrigger>
                <TabsTrigger value="protocol1">Protocole 1</TabsTrigger>
                <TabsTrigger 
                  value="protocol2" 
                  disabled={!isProtocol2Enabled}
                  className={!isProtocol2Enabled ? "opacity-50 cursor-not-allowed" : ""}
                >
                  Protocole 2
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notes et Historique</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Ajoutez vos notes globales sur ce candidat..."
                      value={globalNotes}
                      onChange={(e) => setGlobalNotes(e.target.value)}
                      rows={10}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="protocol1" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Protocole 1 : Évaluation Initiale</CardTitle>
                    <p className="text-sm text-muted-foreground">Critères de recrutement</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {protocol1Items.map((item) => (
                      <div key={item.id} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={(checked) => 
                              updateProtocolItem(1, item.id, 'completed', Boolean(checked))
                            }
                          />
                          <span className="font-medium">{item.label}</span>
                          <span className="text-sm text-muted-foreground">({item.points} pts)</span>
                        </div>
                        <Textarea
                          placeholder="Commentaires..."
                          value={item.notes}
                          onChange={(e) => updateProtocolItem(1, item.id, 'notes', e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="protocol2" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Protocole 2 : Évaluation Approfondie</CardTitle>
                    <p className="text-sm text-muted-foreground">Assessment & Immersion</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {protocol2Items.map((item) => (
                      <div key={item.id} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={(checked) => 
                              updateProtocolItem(2, item.id, 'completed', Boolean(checked))
                            }
                            disabled={!isProtocol2Enabled}
                          />
                          <span className="font-medium">{item.label}</span>
                          <span className="text-sm text-muted-foreground">({item.points} pts)</span>
                        </div>
                        <Textarea
                          placeholder="Commentaires..."
                          value={item.notes}
                          onChange={(e) => updateProtocolItem(2, item.id, 'notes', e.target.value)}
                          rows={2}
                          className="text-sm"
                          disabled={!isProtocol2Enabled}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Partie Droite - Score et Actions */}
          <div className="lg:col-span-3 space-y-4">
            {/* Score en temps réel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Global</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Protocole 1</span>
                    <span className="text-sm">{protocol1Score.completedPoints}/{protocol1Score.totalPoints}</span>
                  </div>
                  <Progress value={protocol1Score.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(protocol1Score.percentage)}%</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Protocole 2</span>
                    <span className="text-sm">{protocol2Score.completedPoints}/{protocol2Score.totalPoints}</span>
                  </div>
                  <Progress value={protocol2Score.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(protocol2Score.percentage)}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="w-4 h-4" />
                  Contacter le candidat
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Calendar className="w-4 h-4" />
                  Planifier un entretien
                </Button>
                
                <div className="border-t pt-3 mt-4">
                  <p className="text-sm font-medium mb-3">Décision</p>
                  <div className="space-y-2">
                    {mockCandidate.status === 'candidature' && (
                      <Button className="w-full gap-2" variant="default">
                        <CheckCircle className="w-4 h-4" />
                        Passer en Incubation
                      </Button>
                    )}
                    {mockCandidate.status === 'incubation' && (
                      <Button className="w-full gap-2" variant="default">
                        <CheckCircle className="w-4 h-4" />
                        Embaucher
                      </Button>
                    )}
                    <Button variant="destructive" className="w-full gap-2">
                      <X className="w-4 h-4" />
                      Refuser le candidat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}