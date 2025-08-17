import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  FileText,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react";

// Mock data pour le candidat
const mockCandidate = {
  id: 1,
  name: "Marie Dubois",
  email: "marie.dubois@email.com",
  phone: "+241 01 23 45 67",
  currentPosition: "Développeur Frontend",
  department: "Informatique",
  experienceYears: 3,
  location: "Libreville",
  birthDate: "1995-03-15",
  status: "candidature",
  appliedDate: "2024-01-15",
  appliedJob: "Développeur React.js Senior",
  
  // Documents et informations de candidature
  documents: {
    cv: { uploaded: true, name: "CV_Marie_Dubois.pdf" },
    coverLetter: { uploaded: true, content: "Motivée par les défis techniques..." },
    certificates: [
      { name: "React Advanced Certification", file: "react_cert.pdf" },
      { name: "AWS Cloud Practitioner", file: "aws_cert.pdf" }
    ],
    recommendations: [
      { name: "Recommandation_Chef_Projet.pdf", from: "Jean Martin - Chef de Projet" }
    ],
    references: "Marie Koumba - Senior Developer (+241 06 12 34 56)\nPierre Nzé - Team Lead (+241 07 89 01 23)"
  },
  
  // Réponses MTP
  mtpAnswers: {
    passion: "Ce qui me passionne le plus dans mon métier, c'est la capacité de créer des solutions innovantes qui impactent directement l'expérience utilisateur. J'aime transformer des idées complexes en interfaces intuitives et performantes.",
    talent: "Mon talent unique réside dans ma capacité à allier créativité et rigueur technique. Je sais traduire les besoins métier en solutions techniques élégantes, tout en maintenant un code maintenable et scalable.",
    paradigm: "Lors d'un projet récent, nous faisions face à des problèmes de performance sur une application critique. Au lieu de chercher des optimisations mineures, j'ai proposé de repenser entièrement l'architecture en adoptant une approche micro-frontend, ce qui a résolu les problèmes de fond."
  },
  
  // Évaluations
  evaluation: {
    protocol1: {
      documentsReview: { completed: true, score: 85, notes: "CV bien structuré, expérience pertinente" },
      mtpAdherence: { completed: true, score: 90, notes: "Réponses très alignées avec nos valeurs" },
      overall: 87.5
    },
    protocol2: {
      physicalVisit: { completed: false, score: null, notes: "" },
      interview: { completed: false, score: null, notes: "" },
      assessment: { completed: false, score: null, notes: "" },
      overall: null
    }
  }
};

export default function CandidateAnalysis() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [activeProtocol, setActiveProtocol] = useState<1 | 2>(1);

  const candidate = mockCandidate; // En réalité, on fetcherait avec candidateId

  const handleStatusChange = (newStatus: string) => {
    // Ici on mettrait à jour le statut du candidat
    console.log(`Changement de statut vers: ${newStatus}`);
    navigate(-1); // Retour à la page précédente
  };

  const TimelineItem = ({ 
    title, 
    completed, 
    score, 
    notes, 
    icon: Icon 
  }: { 
    title: string; 
    completed: boolean; 
    score: number | null; 
    notes: string; 
    icon: any 
  }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg border">
      <div className={`p-2 rounded-full ${completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">{title}</h4>
          {completed && score && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {score}/100
            </Badge>
          )}
        </div>
        {notes && <p className="text-sm text-muted-foreground">{notes}</p>}
        {!completed && (
          <p className="text-sm text-muted-foreground italic">En attente d'évaluation</p>
        )}
      </div>
    </div>
  );

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analyse du Candidat</h1>
              <p className="text-muted-foreground">
                Évaluation détaillée de {candidate.name}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {candidate.status === "candidature" ? "En Candidature" : candidate.status}
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
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">Candidat</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{candidate.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{candidate.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{candidate.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{candidate.currentPosition}</p>
                      <p className="text-xs text-muted-foreground">
                        {candidate.experienceYears} ans d'expérience
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Candidature: {candidate.appliedDate}</p>
                      <p className="text-xs text-muted-foreground">
                        Pour: {candidate.appliedJob}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CV</span>
                      {candidate.documents.cv.uploaded ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lettre de motivation</span>
                      {candidate.documents.coverLetter.uploaded ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Certificats ({candidate.documents.certificates.length})</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section d'évaluation */}
          <div className="lg:col-span-2">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Évaluation</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={activeProtocol === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveProtocol(1)}
                    >
                      Protocole 1
                    </Button>
                    <Button
                      variant={activeProtocol === 2 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveProtocol(2)}
                      disabled={!candidate.evaluation.protocol1.overall}
                      className={!candidate.evaluation.protocol1.overall ? "opacity-50" : ""}
                    >
                      Protocole 2
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeProtocol === 1 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">PROTOCOLE 1</h3>
                        {candidate.evaluation.protocol1.overall && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {candidate.evaluation.protocol1.overall}%
                            </div>
                            <div className="text-sm text-muted-foreground">Score global</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <TimelineItem
                          title="Révision des documents"
                          completed={candidate.evaluation.protocol1.documentsReview.completed}
                          score={candidate.evaluation.protocol1.documentsReview.score}
                          notes={candidate.evaluation.protocol1.documentsReview.notes}
                          icon={FileText}
                        />
                        
                        <TimelineItem
                          title="Adhérence MTP"
                          completed={candidate.evaluation.protocol1.mtpAdherence.completed}
                          score={candidate.evaluation.protocol1.mtpAdherence.score}
                          notes={candidate.evaluation.protocol1.mtpAdherence.notes}
                          icon={Award}
                        />
                      </div>

                      {candidate.evaluation.protocol1.overall && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="flex gap-3">
                            <Button 
                              variant="hero" 
                              className="gap-2"
                              onClick={() => handleStatusChange("incubation")}
                            >
                              <TrendingUp className="w-4 h-4" />
                              Passer en Incubation
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="gap-2"
                              onClick={() => handleStatusChange("refuse")}
                            >
                              <XCircle className="w-4 h-4" />
                              Refuser
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeProtocol === 2 && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">PROTOCOLE 2</h3>
                        {candidate.evaluation.protocol2.overall ? (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {candidate.evaluation.protocol2.overall}%
                            </div>
                            <div className="text-sm text-muted-foreground">Score global</div>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100">
                            En attente
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <TimelineItem
                          title="Visite physique"
                          completed={candidate.evaluation.protocol2.physicalVisit.completed}
                          score={candidate.evaluation.protocol2.physicalVisit.score}
                          notes={candidate.evaluation.protocol2.physicalVisit.notes}
                          icon={MapPin}
                        />
                        
                        <TimelineItem
                          title="Entretien"
                          completed={candidate.evaluation.protocol2.interview.completed}
                          score={candidate.evaluation.protocol2.interview.score}
                          notes={candidate.evaluation.protocol2.interview.notes}
                          icon={User}
                        />

                        <TimelineItem
                          title="QCM / Jeux de rôle"
                          completed={candidate.evaluation.protocol2.assessment.completed}
                          score={candidate.evaluation.protocol2.assessment.score}
                          notes={candidate.evaluation.protocol2.assessment.notes}
                          icon={Award}
                        />
                      </div>

                      {candidate.evaluation.protocol2.overall && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="flex gap-3">
                            <Button 
                              variant="hero" 
                              className="gap-2"
                              onClick={() => handleStatusChange("embauche")}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Engager
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="gap-2"
                              onClick={() => handleStatusChange("refuse")}
                            >
                              <XCircle className="w-4 h-4" />
                              Refuser
                            </Button>
                          </div>
                        </div>
                      )}

                      {!candidate.evaluation.protocol2.overall && (
                        <div className="mt-6 pt-6 border-t bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              Le protocole 2 sera débloqué une fois le protocole 1 terminé et validé
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section MTP Responses */}
            <Card className="shadow-soft mt-6">
              <CardHeader>
                <CardTitle>Réponses MTP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Ce qui vous passionne le plus dans votre métier :</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                    {candidate.mtpAnswers.passion}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Talent unique pour la SEEG :</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                    {candidate.mtpAnswers.talent}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Exemple de changement de paradigme :</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                    {candidate.mtpAnswers.paradigm}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}