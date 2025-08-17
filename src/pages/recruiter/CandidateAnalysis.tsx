import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  FileText, 
  Star,
  CheckCircle,
  XCircle,
  MoveRight,
  Send
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";

// Mock data pour le candidat
const mockCandidate = {
  id: 1,
  firstName: "Marie",
  lastName: "Obame",
  email: "marie.obame@email.com",
  phone: "+241 XX XX XX XX",
  currentPosition: "Ingénieur Électrique",
  yearsExperience: 5,
  appliedDate: "2024-01-15",
  cv: "/cv-marie-obame.pdf",
  coverLetter: "Passionnée par l'innovation électrique...",
  notes: "Candidat très prometteur avec une solide expérience technique.",
  protocols: {
    protocol1: {
      documentsCheck: true,
      mtpMetier: 4,
      mtpTalent: 5,
      mtpParadigme: 4,
      score: 85
    },
    protocol2: {
      physicalVisit: false,
      interview: 0,
      rolePlay: 0,
      codirPlay: 0,
      functionSheet: false,
      competencyGap: 0,
      score: 0
    }
  }
};

const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (value: number) => void; readonly?: boolean }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 cursor-pointer transition-colors ${
            star <= value ? 'text-yellow-500 fill-current' : 'text-gray-300'
          }`}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  );
};

export default function CandidateAnalysis() {
  const { candidateId } = useParams();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job');
  
  const [candidate, setCandidate] = useState(mockCandidate);
  const [internalNotes, setInternalNotes] = useState(candidate.notes);

  const updateProtocol1 = (field: string, value: any) => {
    setCandidate(prev => ({
      ...prev,
      protocols: {
        ...prev.protocols,
        protocol1: {
          ...prev.protocols.protocol1,
          [field]: value,
          score: calculateProtocol1Score({
            ...prev.protocols.protocol1,
            [field]: value
          })
        }
      }
    }));
  };

  const updateProtocol2 = (field: string, value: any) => {
    setCandidate(prev => ({
      ...prev,
      protocols: {
        ...prev.protocols,
        protocol2: {
          ...prev.protocols.protocol2,
          [field]: value,
          score: calculateProtocol2Score({
            ...prev.protocols.protocol2,
            [field]: value
          })
        }
      }
    }));
  };

  const calculateProtocol1Score = (protocol: any) => {
    let score = 0;
    if (protocol.documentsCheck) score += 25;
    score += (protocol.mtpMetier * 5);
    score += (protocol.mtpTalent * 5);
    score += (protocol.mtpParadigme * 5);
    return Math.min(score, 100);
  };

  const calculateProtocol2Score = (protocol: any) => {
    let score = 0;
    if (protocol.physicalVisit) score += 20;
    score += (protocol.interview * 4);
    score += (protocol.rolePlay * 4);
    score += (protocol.codirPlay * 4);
    if (protocol.functionSheet) score += 20;
    score += (protocol.competencyGap * 4);
    return Math.min(score, 100);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleContact = () => {
    window.location.href = `mailto:${candidate.email}?subject=Candidature - Poste&body=Bonjour ${candidate.firstName},`;
  };

  const handleMoveToIncubation = () => {
    // Logique pour déplacer vers incubation
    console.log("Déplacer vers incubation");
  };

  const handleReject = () => {
    // Logique pour refuser le candidat
    console.log("Refuser le candidat");
  };

  const handleHire = () => {
    // Logique pour embaucher
    console.log("Embaucher le candidat");
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Analyse du Candidat</h1>
            <p className="text-muted-foreground">
              Évaluation complète et suivi du processus de recrutement
            </p>
          </div>
        </div>

        {/* En-tête candidat */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={`${candidate.firstName} ${candidate.lastName}`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {getInitials(candidate.firstName, candidate.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {candidate.firstName} {candidate.lastName}
                  </h2>
                  <p className="text-lg text-muted-foreground">{candidate.currentPosition}</p>
                  <p className="text-sm text-muted-foreground">
                    {candidate.yearsExperience} années d'ancienneté
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {candidate.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {candidate.phone}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleContact} className="gap-2">
                  <Send className="w-4 h-4" />
                  Contacter
                </Button>
                <Button variant="success" onClick={handleMoveToIncubation} className="gap-2">
                  <MoveRight className="w-4 h-4" />
                  Passer en Incubation
                </Button>
                <Button variant="destructive" onClick={handleReject} className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Refuser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil & Documents</TabsTrigger>
            <TabsTrigger value="protocol1">Protocole 1</TabsTrigger>
            <TabsTrigger value="protocol2" className="text-muted-foreground">Protocole 2</TabsTrigger>
          </TabsList>

          {/* Onglet Profil & Documents */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">CV</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">cv-marie-obame.pdf</span>
                        <Button variant="outline" size="sm">
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Lettre de motivation</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        {candidate.coverLetter}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes internes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Ajoutez des notes sur ce candidat..."
                    rows={8}
                    className="resize-none"
                  />
                  <Button className="mt-4" size="sm">
                    Sauvegarder les notes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Protocole 1 */}
          <TabsContent value="protocol1" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Protocole 1 : Admissibilité</CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {candidate.protocols.protocol1.score}/100
                    </div>
                    <div className="text-sm text-muted-foreground">Score global</div>
                  </div>
                </div>
                <Progress value={candidate.protocols.protocol1.score} className="w-full" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Vérification des documents</Label>
                      <p className="text-xs text-muted-foreground">Conformité des pièces justificatives</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={candidate.protocols.protocol1.documentsCheck}
                        onCheckedChange={(checked) => updateProtocol1('documentsCheck', checked)}
                      />
                      <Label className="text-sm">Conforme</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Adhérence MTP (Métier)</Label>
                    <StarRating
                      value={candidate.protocols.protocol1.mtpMetier}
                      onChange={(value) => updateProtocol1('mtpMetier', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Adhérence MTP (Talent)</Label>
                    <StarRating
                      value={candidate.protocols.protocol1.mtpTalent}
                      onChange={(value) => updateProtocol1('mtpTalent', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Adhérence MTP (Paradigme)</Label>
                    <StarRating
                      value={candidate.protocols.protocol1.mtpParadigme}
                      onChange={(value) => updateProtocol1('mtpParadigme', value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleMoveToIncubation} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Passer en Incubation
                  </Button>
                  <Button variant="destructive" onClick={handleReject} className="gap-2">
                    <XCircle className="w-4 h-4" />
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Protocole 2 */}
          <TabsContent value="protocol2" className="space-y-6">
            <Card className={candidate.protocols.protocol1.score < 70 ? "opacity-50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Protocole 2 : Assessment & Immersion</CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {candidate.protocols.protocol2.score}/100
                    </div>
                    <div className="text-sm text-muted-foreground">Score global</div>
                  </div>
                </div>
                <Progress value={candidate.protocols.protocol2.score} className="w-full" />
                {candidate.protocols.protocol1.score < 70 && (
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Disponible après validation du Protocole 1
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Visite physique</Label>
                      <p className="text-xs text-muted-foreground">Visite des installations</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={candidate.protocols.protocol2.physicalVisit}
                        onCheckedChange={(checked) => updateProtocol2('physicalVisit', checked)}
                        disabled={candidate.protocols.protocol1.score < 70}
                      />
                      <Label className="text-sm">Effectuée</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Entretien</Label>
                    <StarRating
                      value={candidate.protocols.protocol2.interview}
                      onChange={(value) => updateProtocol2('interview', value)}
                      readonly={candidate.protocols.protocol1.score < 70}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Jeux de rôle</Label>
                    <StarRating
                      value={candidate.protocols.protocol2.rolePlay}
                      onChange={(value) => updateProtocol2('rolePlay', value)}
                      readonly={candidate.protocols.protocol1.score < 70}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Jeux de CoDir</Label>
                    <StarRating
                      value={candidate.protocols.protocol2.codirPlay}
                      onChange={(value) => updateProtocol2('codirPlay', value)}
                      readonly={candidate.protocols.protocol1.score < 70}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Édition fiche de fonction</Label>
                      <p className="text-xs text-muted-foreground">Définition du poste</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={candidate.protocols.protocol2.functionSheet}
                        onCheckedChange={(checked) => updateProtocol2('functionSheet', checked)}
                        disabled={candidate.protocols.protocol1.score < 70}
                      />
                      <Label className="text-sm">Terminé</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Analyse Gap de compétences</Label>
                    <StarRating
                      value={candidate.protocols.protocol2.competencyGap}
                      onChange={(value) => updateProtocol2('competencyGap', value)}
                      readonly={candidate.protocols.protocol1.score < 70}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={handleHire} 
                    className="gap-2"
                    disabled={candidate.protocols.protocol1.score < 70}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Engager
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject} 
                    className="gap-2"
                    disabled={candidate.protocols.protocol1.score < 70}
                  >
                    <XCircle className="w-4 h-4" />
                    Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
}