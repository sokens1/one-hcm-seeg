import { Layout } from "@/components/layout/Layout";
import { JobCard } from "@/components/ui/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
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

  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-12 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Postes de{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Direction
            </span>
            {" "}à la SEEG
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in delay-100">
            Rejoignez l'équipe dirigeante de la Société d'Energie et d'eau du Gabon et participez au développement énergétique du pays.
          </p>
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

        {/* Job Listings - Card Grid Layout */}
        <div className="max-w-7xl mx-auto">
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
                    // Navigation vers la page de détail de l'offre
                    window.location.href = `/jobs/${job.id}`;
                  }}
                />
              </div>
            ))}
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