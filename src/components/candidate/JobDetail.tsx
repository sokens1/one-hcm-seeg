import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Briefcase, MapPin, CheckCircle, Send, Building, Clock, Calendar } from "lucide-react";

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
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au catalogue
        </Button>
      </div>

      {/* Hero Section - Matching /jobs style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white rounded-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-24 translate-y-24"></div>
        </div>
        <div className="relative p-8">
          <div className="space-y-4">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              Société d'Énergie et d'Eau du Gabon
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {job.department}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {job.type}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Publié récemment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description du poste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>

          {/* Missions */}
          {job.missions && (
            <Card>
              <CardHeader>
                <CardTitle>Missions principales</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.missions.map((mission, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{mission}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Compétences */}
          {job.competences && (
            <Card>
              <CardHeader>
                <CardTitle>Compétences requises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.competences.map((competence, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {competence}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profil recherché */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Profil recherché</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{job.requirements}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Application Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Conditions d'emploi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {job.conditions || "CDI, salaire selon expérience, avantages sociaux"}
              </p>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Date limite : 31 Décembre 2024</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>Prise de poste : Janvier 2025</span>
                </div>
              </div>
              <Button onClick={onApply} size="lg" className="w-full">
                Postuler maintenant
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Votre candidature sera étudiée dans les plus brefs délais
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}