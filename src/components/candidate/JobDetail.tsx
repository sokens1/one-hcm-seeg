import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Briefcase, Send } from "lucide-react";

// Mock data identique à /jobs
const mockJobDetails = {
  1: {
    title: "Directeur des Ressources Humaines",
    location: "Libreville",
    contractType: "CDI",
    department: "Ressources Humaines",
    description: "La SEEG recherche un Directeur RH expérimenté pour piloter la stratégie des ressources humaines et accompagner le développement de nos équipes dans un contexte de transformation et de croissance.",
    missions: [
      "Définir et mettre en œuvre la stratégie RH en cohérence avec les objectifs de l'entreprise",
      "Piloter les processus de recrutement, formation et développement des compétences",
      "Gérer les relations sociales et le dialogue avec les représentants du personnel",
      "Superviser l'administration du personnel et la gestion de la paie",
      "Accompagner les managers dans la gestion de leurs équipes"
    ],
    competences: [
      "Master en Ressources Humaines ou équivalent",
      "Minimum 10 années d'expérience en direction RH",
      "Excellente connaissance du droit social gabonais",
      "Leadership et capacités managériales confirmées",
      "Maîtrise des outils SIRH et de gestion RH"
    ],
    conditions: [
      "Poste basé à Libreville",
      "Déplacements réguliers sur les sites de la SEEG",
      "Rémunération attractive selon profil",
      "Avantages sociaux (santé, transport, logement)",
      "Opportunités d'évolution au sein du groupe"
    ],
    datePublication: "12 Décembre 2024",
    dateEcheance: "15 Janvier 2025"
  }
};

interface JobDetailProps {
  jobId: number;
  onBack: () => void;
  onApply: () => void;
}

export function JobDetail({ jobId, onBack, onApply }: JobDetailProps) {
  const job = mockJobDetails[jobId as keyof typeof mockJobDetails] || mockJobDetails[1];

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>

      {/* En-tête du poste */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {job.contractType}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {job.department}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Publié le {job.datePublication}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="text-center">
                Candidatures ouvertes jusqu'au {job.dateEcheance}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description du poste */}
          <Card>
            <CardHeader>
              <CardTitle>Description du poste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Missions et responsabilités */}
          <Card>
            <CardHeader>
              <CardTitle>Missions et responsabilités</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.missions.map((mission, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-muted-foreground">{mission}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Compétences requises */}
          <Card>
            <CardHeader>
              <CardTitle>Compétences requises</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.competences.map((competence, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-muted-foreground">{competence}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.conditions.map((condition, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-muted-foreground">{condition}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action de candidature */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Candidature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={onApply}
                className="w-full gap-2"
                size="lg"
              >
                <Send className="w-4 h-4" />
                Postuler
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                En postulant, votre profil sera automatiquement transmis à l'équipe RH de la SEEG.
              </p>
            </CardContent>
          </Card>

          {/* Informations complémentaires */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">À propos de ce poste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">Lieu</div>
                <div className="text-sm text-muted-foreground">{job.location}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Type de contrat</div>
                <div className="text-sm text-muted-foreground">{job.contractType}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Département</div>
                <div className="text-sm text-muted-foreground">{job.department}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Date de publication</div>
                <div className="text-sm text-muted-foreground">{job.datePublication}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Date limite</div>
                <div className="text-sm text-muted-foreground">{job.dateEcheance}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}