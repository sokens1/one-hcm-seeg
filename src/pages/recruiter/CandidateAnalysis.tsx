import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Eye,
  Download
} from "lucide-react";

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  currentPosition: string;
  department: string;
  yearsExperience: number;
  appliedDate: string;
  status: "candidature" | "incubation" | "embauche" | "refuse";
  location: string;
  birthDate: string;
  documents: {
    cv: boolean;
    coverLetter: boolean;
    certificates: boolean;
    recommendations: boolean;
  };
  mtpAnswers: {
    passion: string;
    talent: string;
    paradigm: string;
  };
  protocols: {
    protocol1: {
      documentsReview: boolean;
      mtpAdherence: boolean;
      completed: boolean;
    };
    protocol2: {
      physicalVisit: boolean;
      interview: boolean;
      qcmRolePlay: boolean;
      completed: boolean;
    };
  };
}

const mockCandidate: Candidate = {
  id: 1,
  firstName: "Marie",
  lastName: "Dubois",
  email: "marie.dubois@email.com",
  phone: "+241 01 02 03 04",
  position: "Développeur React.js",
  currentPosition: "Développeur Frontend",
  department: "Informatique",
  yearsExperience: 3,
  appliedDate: "2024-01-15",
  status: "candidature",
  location: "Libreville",
  birthDate: "1990-05-15",
  documents: {
    cv: true,
    coverLetter: true,
    certificates: true,
    recommendations: false
  },
  mtpAnswers: {
    passion: "Ce qui me passionne le plus dans mon métier, c'est la possibilité de créer des solutions innovantes qui améliorent la vie des utilisateurs. Chaque ligne de code que j'écris contribue à construire des interfaces intuitives et performantes.",
    talent: "Mon talent unique réside dans ma capacité à traduire des besoins complexes en solutions techniques élégantes. Je combine créativité et rigueur technique pour livrer des applications robustes et évolutives.",
    paradigm: "Lors d'un projet critique, j'ai changé notre approche de développement monolithique vers une architecture microservices, ce qui a réduit les temps de déploiement de 80% et amélioré la maintenabilité."
  },
  protocols: {
    protocol1: {
      documentsReview: true,
      mtpAdherence: true,
      completed: true
    },
    protocol2: {
      physicalVisit: false,
      interview: false,
      qcmRolePlay: false,
      completed: false
    }
  }
};

export default function CandidateAnalysis() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate] = useState<Candidate>(mockCandidate);

  const handlePhaseChange = (newStatus: Candidate["status"]) => {
    // Logique pour changer le statut du candidat
    console.log(`Changement de statut vers: ${newStatus}`);
    navigate('/recruiter/candidates');
  };

  const getProgressValue = (protocol: any) => {
    const completedTasks = Object.values(protocol).filter(task => 
      typeof task === 'boolean' && task
    ).length;
    const totalTasks = Object.values(protocol).filter(task => 
      typeof task === 'boolean'
    ).length;
    return (completedTasks / totalTasks) * 100;
  };

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Analyse Détaillée - {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-muted-foreground">
              Candidature pour {candidate.position}
            </p>
          </div>

          <Badge className={
            candidate.status === "candidature" ? "bg-blue-100 text-blue-800" :
            candidate.status === "incubation" ? "bg-orange-100 text-orange-800" :
            candidate.status === "embauche" ? "bg-green-100 text-green-800" :
            "bg-red-100 text-red-800"
          }>
            {candidate.status === "candidature" ? "Candidature" :
             candidate.status === "incubation" ? "Incubation" :
             candidate.status === "embauche" ? "Embauché" : "Refusé"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section Détails du profil */}
          <div className="lg:col-span-1">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Détails du Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      Né(e) le {new Date(candidate.birthDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{candidate.currentPosition}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Documents soumis</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CV</span>
                      {candidate.documents.cv ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lettre de motivation</span>
                      {candidate.documents.coverLetter ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Certificats</span>
                      {candidate.documents.certificates ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recommandations</span>
                      {candidate.documents.recommendations ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section d'évaluation */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="protocol1" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="protocol1">Protocole 1</TabsTrigger>
                <TabsTrigger 
                  value="protocol2" 
                  disabled={!candidate.protocols.protocol1.completed}
                  className={!candidate.protocols.protocol1.completed ? "opacity-50" : ""}
                >
                  Protocole 2
                </TabsTrigger>
              </TabsList>

              <TabsContent value="protocol1">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Protocole 1 - Évaluation Documents & MTP
                      <Badge variant={candidate.protocols.protocol1.completed ? "default" : "secondary"}>
                        {candidate.protocols.protocol1.completed ? "Terminé" : "En cours"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Timeline */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Progression</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          {candidate.protocols.protocol1.documentsReview ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-500" />
                          )}
                          <span className="text-sm">Révision des documents</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {candidate.protocols.protocol1.mtpAdherence ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-500" />
                          )}
                          <span className="text-sm">Adhérence MTP évaluée</span>
                        </div>
                      </div>
                      <Progress value={getProgressValue(candidate.protocols.protocol1)} className="w-full" />
                    </div>

                    {/* Questionnaire MTP */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Réponses MTP</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Passion dans le métier</h5>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {candidate.mtpAnswers.passion}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">Talent unique</h5>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {candidate.mtpAnswers.talent}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">Changement de paradigme</h5>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {candidate.mtpAnswers.paradigm}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {candidate.status === "candidature" && (
                      <div className="flex gap-3 pt-4">
                        <Button 
                          variant="default" 
                          onClick={() => handlePhaseChange("incubation")}
                          className="gap-2"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Passer en Incubation
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handlePhaseChange("refuse")}
                          className="gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="protocol2">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Protocole 2 - Évaluation Avancée
                      <Badge variant={candidate.protocols.protocol2.completed ? "default" : "secondary"}>
                        {candidate.protocols.protocol2.completed ? "Terminé" : "En cours"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Timeline */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Progression</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          {candidate.protocols.protocol2.physicalVisit ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-500" />
                          )}
                          <span className="text-sm">Visite physique</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {candidate.protocols.protocol2.interview ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-500" />
                          )}
                          <span className="text-sm">Entretien</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {candidate.protocols.protocol2.qcmRolePlay ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-500" />
                          )}
                          <span className="text-sm">QCM / Jeux de rôle</span>
                        </div>
                      </div>
                      <Progress value={getProgressValue(candidate.protocols.protocol2)} className="w-full" />
                    </div>

                    {/* Actions */}
                    {candidate.status === "incubation" && (
                      <div className="flex gap-3 pt-4">
                        <Button 
                          variant="default" 
                          onClick={() => handlePhaseChange("embauche")}
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Engager
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handlePhaseChange("refuse")}
                          className="gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}