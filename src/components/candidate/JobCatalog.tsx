import { JobCard } from "@/components/ui/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid, List } from "lucide-react";
import { useState } from "react";

// Données identiques à la page /jobs
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
  },
  {
    id: 7,
    title: "Directeur Général",
    location: "Libreville",
    contractType: "CDI",
    description: "Assurer la direction stratégique et opérationnelle de l'entreprise"
  },
  {
    id: 8,
    title: "Chef de Projet Digital",
    location: "Libreville",
    contractType: "CDI",
    description: "Piloter les projets de transformation digitale"
  },
  {
    id: 9,
    title: "Responsable Qualité",
    location: "Port-Gentil",
    contractType: "CDI",
    description: "Assurer le contrôle qualité et l'amélioration continue"
  },
  {
    id: 10,
    title: "Manager HSE",
    location: "Libreville",
    contractType: "CDI",
    description: "Gérer la politique Hygiène, Sécurité et Environnement"
  },
  {
    id: 11,
    title: "Analyste Financier Senior",
    location: "Libreville",
    contractType: "CDI",
    description: "Analyser les performances financières et préparer les budgets"
  },
  {
    id: 12,
    title: "Gestionnaire de Paie",
    location: "Libreville",
    contractType: "CDI",
    description: "Gérer la paie et les déclarations sociales"
  },
  {
    id: 13,
    title: "Ingénieur Maintenance",
    location: "Port-Gentil",
    contractType: "CDI",
    description: "Assurer la maintenance préventive et corrective"
  },
  {
    id: 14,
    title: "Responsable Achats",
    location: "Libreville",
    contractType: "CDI",
    description: "Optimiser les achats et négocier avec les fournisseurs"
  },
  {
    id: 15,
    title: "Chef Comptable",
    location: "Libreville",
    contractType: "CDI",
    description: "Superviser la comptabilité générale et analytique"
  },
  {
    id: 16,
    title: "Responsable Communication",
    location: "Libreville",
    contractType: "CDI",
    description: "Développer la stratégie de communication interne et externe"
  },
  {
    id: 17,
    title: "Juriste d'Entreprise",
    location: "Libreville",
    contractType: "CDI",
    description: "Conseiller sur les aspects juridiques et gérer les contrats"
  },
  {
    id: 18,
    title: "Data Analyst",
    location: "Libreville",
    contractType: "CDI",
    description: "Analyser les données et produire des reportings"
  },
  {
    id: 19,
    title: "Responsable Logistique",
    location: "Port-Gentil",
    contractType: "CDI",
    description: "Organiser et optimiser la chaîne logistique"
  }
];

export function JobCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Catalogue des offres</h2>
        <p className="text-lg text-muted-foreground">
          Découvrez toutes les opportunités disponibles au sein du comité de direction
        </p>
      </div>

      {/* Sélecteur de vue */}
      <div className="flex justify-center">
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
      <div className="max-w-2xl mx-auto">
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
      <div className="flex justify-center">
        <div className="bg-card rounded-lg border p-4 shadow-soft">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{filteredJobs.length}</span> offres disponibles
          </p>
        </div>
      </div>

      {/* Job Listings - Présentation identique à /jobs */}
      <div className="max-w-7xl mx-auto">
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
                    window.location.href = `/candidate/job/${job.id}`;
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
                    onClick={() => window.location.href = `/candidate/job/${job.id}`}
                  >
                    Voir détails
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
    </div>
  );
}