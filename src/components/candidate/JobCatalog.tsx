import { JobCard } from "@/components/ui/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, Grid, List, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCandidateLayout } from "@/components/layout/CandidateLayout";
import { JobDetail } from "./JobDetail";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { useJobOffers } from "@/hooks/useJobOffers";
import { isPreLaunch } from "@/utils/launchGate";
import { isApplicationClosed } from "@/utils/applicationUtils";
import { toast } from "sonner";
// import { CampaignEligibilityAlert } from "@/components/ui/CampaignEligibilityAlert";
import { useCampaignEligibility } from "@/hooks/useCampaignEligibility";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: jobs, isLoading, error } = useJobOffers();
  const preLaunch = isPreLaunch();
  const applicationsClosed = isApplicationClosed();
  const { isEligible } = useCampaignEligibility();
  const preLaunchToast = () => toast.info("Les candidatures seront disponibles à partir du lundi 25 août 2025.");

  // Helper to normalize fields that can be string or string[]
  const toText = (val?: string | string[] | null) =>
    Array.isArray(val) ? val.filter(Boolean).join(", ") : (val ?? "");

  const filteredJobs = jobs?.filter(job => {
    const locationText = toText(job.location);
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         locationText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "all" ||
      (Array.isArray(job.location)
        ? job.location.includes(locationFilter)
        : job.location === locationFilter);
    const matchesContract = contractFilter === "all" || job.contract_type === contractFilter;
    
    return matchesSearch && matchesLocation && matchesContract;
  }) || [];

  const uniqueLocations = [
    ...new Set(
      (jobs || [])
        .flatMap(job => (Array.isArray(job.location) ? job.location : [job.location]))
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    ),
  ];

  const uniqueContracts = [...new Set(jobs?.map(job => job.contract_type) || [])];

  // Handle jobId parameter to open specific job detail
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId && jobs && jobs.length > 0) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        console.log('JobCatalog: jobId detected, opening job detail for:', jobId);
        setSelectedJobId(jobId);
      }
    }
  }, [searchParams, jobs]);

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    // Mettre à jour l'URL pour permettre le rafraîchissement sans perdre l'état
    const params = new URLSearchParams(location.search);
    params.set("view", "jobs");
    params.set("jobId", jobId);
    params.delete("apply");
    navigate(`/candidate/dashboard?${params.toString()}`);
  };

  const handleApplyClick = (jobId: string) => {
    if (preLaunch) {
      preLaunchToast();
      return;
    } else if (applicationsClosed) {
      toast.info("Les candidatures sont désormais closes.");
      return;
    } else if (!isEligible) {
      toast.error("Période de candidatures close");
      return;
    }
    // Ouvrir le formulaire de candidature
    setShowApplicationForm(true);
    // Mettre à jour l'URL pour permettre le rafraîchissement sans perdre l'état
    const params = new URLSearchParams(location.search);
    params.set("view", "jobs");
    params.set("jobId", jobId);
    params.set("apply", "1");
    navigate(`/candidate/dashboard?${params.toString()}`);
  };

  const handleBackToCatalog = () => {
    // Préserver les paramètres actuels sauf ceux spécifiques à l'application
    const params = new URLSearchParams(location.search);
    params.delete("jobId");
    params.delete("apply");
    setSelectedJobId(null);
    setShowApplicationForm(false);
    // Forcer la vue jobs pour revenir au catalogue
    params.set("view", "jobs");
    navigate(`/candidate/dashboard?${params.toString()}`);
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
      <div className="flex flex-col sm:flex-row justify-center items-center h-48 sm:h-64 gap-2 sm:gap-4">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
        <p className="text-sm sm:text-base lg:text-lg">Chargement des offres...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 text-red-600 px-4">
        <p className="text-sm sm:text-base">Une erreur est survenue lors du chargement des offres.</p>
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* En-tête */}
      <div className="text-center px-3 sm:px-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Catalogue des offres</h2>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Découvrez toutes les opportunités disponibles au sein du comité de direction.
        </p>
      </div>
  
      {/* Sélecteur de vue */}
      <div className="flex justify-center px-3 sm:px-4">
        <div className="bg-white rounded-lg p-1 shadow-sm border w-full sm:w-auto">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
          >
            <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Vue </span>Cartes
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
          >
            <List className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Vue </span>Liste
          </Button>
        </div>
      </div>
  
      {/* Search Bar with Filters */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="relative flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un poste, une ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 sm:h-12 gap-1 sm:gap-2 w-full sm:w-auto justify-center text-xs sm:text-sm">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Filtres</span>
                <span className="sm:hidden">Filtres</span>
                {(locationFilter !== "all" || contractFilter !== "all") && (
                  <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 sm:w-5 sm:h-5 text-xs flex items-center justify-center">
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
          <div className="flex flex-wrap gap-2 mt-3">
            {locationFilter !== "all" && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                <span>Lieu: {locationFilter}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 sm:h-4 sm:w-4 p-0 hover:bg-transparent"
                  onClick={() => setLocationFilter("all")}
                >
                  <X className="w-2 h-2 sm:w-3 sm:h-3" />
                </Button>
              </div>
            )}
            {contractFilter !== "all" && (
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                <span>Contrat: {contractFilter}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 sm:h-4 sm:w-4 p-0 hover:bg-transparent"
                  onClick={() => setContractFilter("all")}
                >
                  <X className="w-2 h-2 sm:w-3 sm:h-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex justify-center px-4">
        <div className="bg-card rounded-lg border p-3 sm:p-4 shadow-soft">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{filteredJobs.length}</span> offres disponibles
          </p>
        </div>
      </div>

      {/* Job Listings - Présentation identique à /jobs */}
      <div className="max-w-7xl mx-auto px-4">
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredJobs.map((job, index) => (
              <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${300 + index * 100}ms` }}>
                <JobCard
                  title={job.title}
                  location={toText(job.location)}
                  contractType={job.contract_type}
                  description={job.description}
                  isPreview={true}
                  candidateCount={job.candidate_count}
                  onClick={() => handleJobClick(job.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Header - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:grid bg-gray-50 border-b font-semibold text-sm" style={{ gridTemplateColumns: '2fr 1fr 1fr 120px' }}>
              <div className="px-6 py-4">Titre du poste</div>
              <div className="px-6 py-4">Lieu</div>
              <div className="px-6 py-4">Type de contrat</div>
              <div className="px-6 py-4 text-center">Action</div>
            </div>

            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className="md:grid border-b hover:bg-gray-50 transition-colors animate-fade-in flex flex-col md:flex-none space-y-2 md:space-y-0"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 120px', animationDelay: `${300 + index * 50}ms` }}
              >
                <div className="font-medium text-sm md:text-base px-6 py-4">{job.title}</div>
                <div className="text-muted-foreground text-xs md:text-sm px-6 py-4">{toText(job.location)}</div>
                <div className="text-muted-foreground text-xs md:text-sm px-6 py-4">{job.contract_type}</div>
                <div className="flex justify-start md:justify-center px-6 py-4">
                  <Button 
                    variant="hero" 
                    size="sm"
                    className="w-full md:w-auto text-xs md:text-sm h-8 md:h-9"
                    onClick={() => handleJobClick(job.id)}
                  >
                    Voir l'offre
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
}