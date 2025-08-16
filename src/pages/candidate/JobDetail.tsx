import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Briefcase, Building, Share2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { ApplicationForm } from "@/components/forms/ApplicationForm";

// Mock data - à remplacer par les vraies données
const mockJobDetail = {
  id: 1,
  title: "Développeur React.js",
  location: "Libreville",
  contractType: "CDI",
  company: "TechGabon Solutions",
  publishedDate: "Il y a 2 jours",
  description: `
Nous recherchons un développeur React.js passionné pour rejoindre notre équipe dynamique et participer au développement d'applications web modernes qui transforment le paysage technologique gabonais.

**Vos missions principales :**
• Développer des interfaces utilisateur modernes avec React.js
• Collaborer avec l'équipe de design pour créer des expériences utilisateur exceptionnelles
• Optimiser les performances des applications web
• Participer aux code reviews et au mentoring des développeurs junior
• Contribuer à l'architecture technique des projets

**Technologies utilisées :**
React.js, TypeScript, Tailwind CSS, Node.js, MongoDB
  `,
  profile: `
**Profil recherché :**
• 3+ années d'expérience en développement React.js
• Maîtrise de JavaScript/TypeScript
• Expérience avec les outils modernes (Webpack, Vite, etc.)
• Connaissance des bonnes pratiques de développement
• Esprit d'équipe et passion pour l'innovation

**Ce que nous offrons :**
• Salaire compétitif avec avantages
• Formation continue et certifications
• Environnement de travail moderne à Libreville
• Projets stimulants avec impact local
• Équipe jeune et dynamique
  `
};

export default function JobDetail() {
  const { id } = useParams();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  if (showApplicationForm) {
    return <ApplicationForm jobTitle={mockJobDetail.title} onBack={() => setShowApplicationForm(false)} />;
  }

  return (
    <Layout>
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
              <Card className="shadow-medium border-primary/20">
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Prêt à postuler ?</h3>
                  <p className="text-muted-foreground text-sm">
                    Rejoignez {mockJobDetail.company} et contribuez à l'innovation technologique au Gabon.
                  </p>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={() => setShowApplicationForm(true)}
                  >
                    Postuler maintenant
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Processus simple en 3 étapes • 5 minutes maximum
                  </p>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">À propos de l'entreprise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">{mockJobDetail.company}</h4>
                    <p className="text-sm text-muted-foreground">
                      Leader du développement logiciel au Gabon, nous créons des solutions innovantes 
                      pour les entreprises locales et internationales.
                    </p>
                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">Tech • 50-100 employés</Badge>
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