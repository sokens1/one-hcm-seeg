import { JobCard } from "@/components/ui/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, Grid, List, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCandidateLayout } from "@/components/layout/CandidateLayout";
import { JobDetail } from "./JobDetail";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { useJobOffers } from "@/hooks/useJobOffers";

export function JobCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [locationFilter, setLocationFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { setCurrentView } = useCandidateLayout();
  const location = useLocation();

  const { data: jobs, isLoading, error } = useJobOffers();

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === "all" || job.location === locationFilter;
    const matchesContract = contractFilter === "all" || job.contract_type === contractFilter;
    
    return matchesSearch && matchesLocation && matchesContract;
  }) || [];

  const uniqueLocations = [...new Set(jobs?.map(job => job.location) || [])];
  const uniqueContracts = [...new Set(jobs?.map(job => job.contract_type) || [])];

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleApplyClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowApplicationForm(true);
  };

  const handleBackToCatalog = () => {
    setSelectedJobId(null);
    setShowApplicationForm(false);
  };

  const handleApplicationSubmit = () => {
    setShowApplicationForm(false);
    setSelectedJobId(null);
    // Ajouter la candidature aux candidatures
    setCurrentView("applications");
  };

  // Deep link handling: /candidate/dashboard?view=jobs&jobId=...&apply=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobIdParam = params.get("jobId");
    const applyParam = params.get("apply");
    if (jobIdParam) {
      setSelectedJobId(jobIdParam);
      if (applyParam === "1") {
        setShowApplicationForm(true);
      }
    }
    // Run only on search change
  }, [location.search]);

  // Si on affiche le formulaire de candidature
  if (showApplicationForm && selectedJobId) {
    const job = jobs?.find(j => j.id === selectedJobId);
    return (
      <ApplicationForm 
        jobTitle={job?.title || ""}
        jobId={selectedJobId}
        onBack={handleBackToCatalog}
        onSubmit={handleApplicationSubmit}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Chargement des offres...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Une erreur est survenue lors du chargement des offres.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  // Si on affiche le détail d'un job
  if (selectedJobId && !showApplicationForm) {
    return (
      <JobDetail 
        jobId={selectedJobId}
        onBack={handleBackToCatalog}
        onApply={() => handleApplyClick(selectedJobId)}
      />
    );
  }

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

      {/* Search Bar with Filters */}
      <div className="max-w-4xl mx-auto">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un poste, une ville ou une description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 gap-2">
                <Filter className="w-4 h-4" />
                Filtres
                {(locationFilter !== "all" || contractFilter !== "all") && (
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {(locationFilter !== "all" ? 1 : 0) + (contractFilter !== "all" ? 1 : 0)}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtres de recherche</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLocationFilter("all");
                      setContractFilter("all");
                    }}
                  >
                    Effacer tout
                  </Button>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Localisation</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les villes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les villes</SelectItem>
                      {uniqueLocations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type de contrat</label>
                  <Select value={contractFilter} onValueChange={setContractFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les contrats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les contrats</SelectItem>
                      {uniqueContracts.map(contract => (
                        <SelectItem key={contract} value={contract}>{contract}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Active Filters Display */}
        {(locationFilter !== "all" || contractFilter !== "all") && (
          <div className="flex gap-2 mt-3">
            {locationFilter !== "all" && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                <span>Lieu: {locationFilter}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setLocationFilter("all")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {contractFilter !== "all" && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                <span>Contrat: {contractFilter}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setContractFilter("all")}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}
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
                  contractType={job.contract_type}
                  description={job.description}
                  isPreview={true}
                  candidateCount={job.application_count}
                  onClick={() => handleJobClick(job.id)}
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
                <div className="text-muted-foreground">{job.contract_type}</div>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleJobClick(job.id)}
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
          <p className="text-muted-foreground">Aucune offre ne correspond à vos critères de recherche.</p>
          <div className="flex gap-2 justify-center mt-4">
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("all");
                setContractFilter("all");
              }}
            >
              Effacer tous les filtres
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}