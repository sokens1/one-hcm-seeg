import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, MapPin, CheckCircle, Send } from "lucide-react";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements?: string;
  missions?: string[];
  competences?: string[];
  conditions?: string;
}

interface JobDetailProps {
  job: Job;
  onBack: () => void;
  onApply: () => void;
}

export function JobDetail({ job, onBack, onApply }: JobDetailProps) {
  return (
    <div className="space-y-6">
      {/* En-tête avec retour */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {job.department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <Badge variant="secondary">{job.type}</Badge>
          </div>
        </div>
        <Button onClick={onApply} className="gap-2">
          <Send className="w-4 h-4" />
          Postuler
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
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
          {job.missions && (
            <Card>
              <CardHeader>
                <CardTitle>Missions et responsabilités</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.missions.map((mission, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{mission}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Compétences requises */}
          {job.competences && (
            <Card>
              <CardHeader>
                <CardTitle>Compétences requises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.competences.map((competence, index) => (
                    <Badge key={index} variant="outline">
                      {competence}
                    </Badge>
                  ))}
                </div>
                {job.requirements && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {job.requirements}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {job.conditions || "Conditions attractives selon profil et expérience"}
              </p>
            </CardContent>
          </Card>

          {/* Action de candidature */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Postuler maintenant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Cette offre correspond à votre profil ? N'hésitez pas à postuler !
              </p>
              <Button onClick={onApply} className="w-full gap-2">
                <Send className="w-4 h-4" />
                Envoyer ma candidature
              </Button>
            </CardContent>
          </Card>

          {/* Informations complémentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Département</p>
                <p className="text-sm text-muted-foreground">{job.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Localisation</p>
                <p className="text-sm text-muted-foreground">{job.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Type de contrat</p>
                <p className="text-sm text-muted-foreground">{job.type}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}