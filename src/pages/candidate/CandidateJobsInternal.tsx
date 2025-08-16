import { JobCard } from "@/components/ui/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid, List, Building } from "lucide-react";
import { useState } from "react";
import { CandidateLayout } from "@/components/layout/CandidateLayout";

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

export default function CandidateJobsInternal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CandidateLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Offres d'emploi disponibles
          </h1>
          <p className="text-muted-foreground">
            Découvrez les 19 postes de direction disponibles au sein de la SEEG
          </p>
        </div>

        {/* Sélecteur de vue */}
        <div className="flex justify-between items-center mb-6">
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

          {/* Stats */}
          <div className="bg-card rounded-lg border p-3 shadow-soft">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">{filteredJobs.length}</span> offres disponibles
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mb-8">
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

        {/* Job Listings */}
        <div className="mb-12">
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <JobCard
                    title={job.title}
                    location={job.location}
                    contractType={job.contractType}
                    description={job.description}
                    isPreview={true}
                    onClick={() => {
                      window.location.href = `/candidate/jobs/${job.id}`;
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
                <div key={job.id} className="grid grid-cols-4 gap-4 p-4 border-b hover:bg-gray-50 transition-colors">
                  <div className="font-medium">{job.title}</div>
                  <div className="text-muted-foreground">{job.location}</div>
                  <div className="text-muted-foreground">{job.contractType}</div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/candidate/jobs/${job.id}`}
                    >
                      Voir l'offre
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

        {/* Section Contexte */}
        <div className="max-w-4xl mx-auto mt-12">
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
      </div>
    </CandidateLayout>
  );
}