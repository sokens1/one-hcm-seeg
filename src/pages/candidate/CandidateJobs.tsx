import { Layout } from "@/components/layout/Layout";
import { JobCard } from "@/components/ui/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid, List, Building } from "lucide-react";
import { useState } from "react";

// Mock data - Postes de direction SEEG
const mockJobs = [
  {
    id: 1,
    title: "Directeur des Ressources Humaines",
    location: "Libreville",
    contractType: "CDI",
    description: "La SEEG recherche un Directeur RH expérimenté pour piloter la stratégie des ressources humaines et accompagner le développement de nos équipes."
  },
  {
    id: 2,
    title: "Directeur des Systèmes d'Information",
    location: "Libreville",
    contractType: "CDI",
    description: "Poste de Directeur SI pour superviser l'évolution technologique et la transformation digitale de la SEEG. Leadership technique requis."
  },
  {
    id: 3,
    title: "Directeur Financier",
    location: "Libreville",
    contractType: "CDI",
    description: "Rejoignez la direction générale de la SEEG en tant que Directeur Financier pour piloter la stratégie financière et les investissements."
  },
  {
    id: 4,
    title: "Directeur Commercial",
    location: "Port-Gentil",
    contractType: "CDI",
    description: "Développez et pilotez la stratégie commerciale de la SEEG pour renforcer notre position sur le marché de l'énergie et de l'eau au Gabon."
  },
  {
    id: 5,
    title: "Directeur Technique",
    location: "Franceville",
    contractType: "CDI",
    description: "Supervision des opérations techniques et maintenance des infrastructures énergétiques et hydrauliques de la SEEG."
  },
  {
    id: 6,
    title: "Directeur de la Communication",
    location: "Libreville",
    contractType: "CDI",
    description: "Pilotage de la stratégie de communication institutionnelle et développement de l'image de marque de la SEEG."
  }
];

export default function CandidateJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout showFooter={true}>
      {/* Hero Section with enhanced design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-36 -translate-y-36"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-6">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium animate-fade-in">
              Société d'Énergie et d'Eau du Gabon
            </div>
            <h1 className="text-5xl md:text-6xl font-bold animate-fade-in delay-100">
              Nos 19 postes à pourvoir
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold opacity-90 animate-fade-in delay-150">
              au sein du comité de direction
            </h2>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto animate-fade-in delay-200">
              Rejoignez l'équipe dirigeante de la SEEG et participez au développement énergétique du Gabon
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6 animate-fade-in delay-300">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm">🏢 Secteur Public</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm">⚡ Énergie & Eau</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm">🇬🇦 Gabon</span>
              </div>
            </div>
            <div className="pt-6 animate-fade-in delay-400">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => document.getElementById('job-list')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Postuler maintenant
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8" id="job-list">
        {/* Sélecteur de vue */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="gap-2"
            >
              <Grid className="w-4 h-4" />
              Vue Cartes
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              Vue Liste
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 animate-fade-in delay-200">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un poste ou une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center mb-8">
          <div className="bg-card rounded-lg border p-4 shadow-soft">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">{filteredJobs.length}</span> offres disponibles
            </p>
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-7xl mx-auto mb-12">
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${300 + index * 100}ms` }}>
                  <JobCard
                    title={job.title}
                    location={job.location}
                    contractType={job.contractType}
                    description={job.description}
                    isPreview={true}
                    onClick={() => {
                      window.location.href = `/jobs/${job.id}`;
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm">
                <div>Titre du poste</div>
                <div>Lieu</div>
                <div>Type de contrat</div>
                <div>Action</div>
              </div>
              {filteredJobs.map((job, index) => (
                <div key={job.id} className="grid grid-cols-4 gap-4 p-4 border-b hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${300 + index * 50}ms` }}>
                  <div className="font-medium">{job.title}</div>
                  <div className="text-muted-foreground">{job.location}</div>
                  <div className="text-muted-foreground">{job.contractType}</div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/jobs/${job.id}`}
                    >
                      Voir l'offre
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Contexte */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">
                  À propos de l'entreprise : Contexte du recrutement
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  Découvrez la vision et les ambitions derrière cette campagne de recrutement 
                  exceptionnelle pour la renaissance de la SEEG.
                </p>
                <Button variant="secondary" size="lg" asChild>
                  <a href="/company-context">
                    En savoir plus →
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune offre ne correspond à votre recherche.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchTerm("")}
            >
              Voir toutes les offres
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center py-16 mt-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Équipe RH SEEG ?
            </h2>
            <p className="text-muted-foreground mb-6">
              Accédez à l'interface de gestion des candidatures et du processus de recrutement.
            </p>
            <Button variant="recruiter" size="lg" asChild>
              <a href="/recruiter">
                Accéder à l'espace RH
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}