import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Briefcase, Building, Share2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { ApplicationFormAdvanced } from "@/components/forms/ApplicationFormAdvanced";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";

// Mock data pour SEEG - Postes de direction
const mockJobDetail = {
  id: 1,
  title: "Directeur des Ressources Humaines",
  location: "Libreville",
  contractType: "CDI",
  company: "SEEG",
  publishedDate: "Il y a 3 jours",
  description: `
La SEEG recherche un Directeur des Ressources Humaines expérimenté pour piloter la stratégie des ressources humaines et accompagner le développement de nos équipes dans le cadre de notre transformation.

**Vos missions principales :**
• Définir et mettre en œuvre la stratégie RH en cohérence avec les objectifs de l'entreprise
• Piloter la gestion des talents, du recrutement au développement des compétences
• Accompagner les transformations organisationnelles et la conduite du changement
• Développer la politique de rémunération et les avantages sociaux
• Assurer la conformité réglementaire et les relations sociales
• Manager une équipe RH de 15 personnes

**Enjeux stratégiques :**
Dans le cadre de la renaissance de la SEEG, ce poste est crucial pour accompagner la modernisation de nos pratiques RH et attirer les meilleurs talents.
  `,
  profile: `
**Profil recherché :**
• Formation supérieure en RH, Droit social ou Management (Bac+5)
• 10+ années d'expérience en direction des RH, idéalement dans le secteur de l'énergie
• Expertise en transformation RH et conduite du changement
• Maîtrise des outils SIRH et des nouvelles technologies RH
• Leadership avéré et capacité à fédérer les équipes
• Connaissance du contexte gabonais et des enjeux sectoriels

**Ce que nous offrons :**
• Poste de Direction au sein du Comité Exécutif
• Rémunération attractive avec avantages
• Opportunité de contribuer à la transformation d'une entreprise stratégique
• Environnement de travail stimulant et projets d'envergure
• Formation continue et développement personnel
  `
};

export default function JobDetail() {
  const { id } = useParams();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const { isAuthenticated } = useCandidateAuth();

  const handleApply = () => {
    if (!isAuthenticated) {
      window.location.href = "/candidate/signup";
      return;
    }
    setShowApplicationForm(true);
  };

  if (showApplicationForm) {
    return <ApplicationFormAdvanced jobTitle={mockJobDetail.title} onBack={() => setShowApplicationForm(false)} />;
  }

  return (
    <Layout showFooter={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card className="shadow-soft">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <CardTitle className="text-3xl text-foreground">{mockJobDetail.title}</CardTitle>
                      
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {mockJobDetail.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {mockJobDetail.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {mockJobDetail.contractType}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{mockJobDetail.contractType}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {mockJobDetail.publishedDate}
                        </div>
                      </div>
                    </div>

                  </div>
                </CardHeader>
              </Card>

              {/* Job Description */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Description du poste</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    {mockJobDetail.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-foreground whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Requirements */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Profil recherché</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    {mockJobDetail.profile.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-foreground whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="shadow-lg border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-lg font-semibold text-primary">
                        Rejoignez le comité de direction de la SEEG et contribuer à sa renaissance
                      </p>
                    </div>
                    <h3 className="text-2xl font-bold text-primary">Prêt à Postuler ?</h3>
                    <p className="text-muted-foreground">
                      {!isAuthenticated 
                        ? "Créez votre compte candidat pour postuler à ce poste de direction."
                        : "Soumettez votre candidature pour ce poste de direction."
                      }
                    </p>
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8"
                      onClick={handleApply}
                    >
                      {!isAuthenticated ? "Créer mon compte et postuler" : "Postuler"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Processus simple en 4 étapes • 10 minutes maximum
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">À propos de la SEEG</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Société d'Énergie et d'Eau du Gabon</h4>
                    <p className="text-sm text-muted-foreground">
                      Acteur majeur du secteur énergétique gabonais, la SEEG s'engage dans une transformation 
                      ambitieuse pour devenir le leader des services énergétiques et hydriques en Afrique centrale.
                    </p>
                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">Énergie & Eau • 1000+ employés</Badge>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href="/company-context">En savoir plus sur la SEEG</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}