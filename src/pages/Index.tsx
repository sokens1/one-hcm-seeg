/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useJobOffers, type JobOffer } from "@/hooks/useJobOffers";
import { Layout } from "@/components/layout/Layout";
import { JobCard } from "@/components/ui/job-card";
import { ApplicationDeadlineCounter } from "@/components/ApplicationDeadlineCounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Chatbot } from "@/components/ui/Chatbot";
import { Search, Filter, Grid, List, Building, Loader2, Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { isPreLaunch } from "@/utils/launchGate";
import { isApplicationClosed } from "@/utils/applicationUtils";
import { toast } from "sonner";
import { useMaintenance } from "@/hooks/useMaintenance";
import { supabase } from "@/integrations/supabase/client";

// Les offres sont désormais chargées dynamiquement depuis Supabase

const Index = () => {
  const navigate = useNavigate();
  const { user, isCandidate, isRecruiter, isAdmin, isObserver, isLoading: isAuthLoading, isRoleLoading } = useAuth();
  const preLaunch = isPreLaunch();
  const applicationsClosed = isApplicationClosed();
  const preLaunchToast = () => toast.info("Les inscriptions seront disponibles à partir du lundi 25 août 2025.");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [locationFilter, setLocationFilter] = useState("all");
  const [contractFilter, setContractFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour le test d'email
  const [testEmail, setTestEmail] = useState("");
  const [testFirstName, setTestFirstName] = useState("Test");
  const [testJobTitle, setTestJobTitle] = useState("Développeur Full Stack");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  const { data, isLoading, error } = useJobOffers();
  const jobOffers: JobOffer[] = Array.isArray(data) ? data : [];

  // Helper to normalize location which can be string | string[] from the API
  const normalizeLocation = (loc: string | string[]) => Array.isArray(loc) ? loc.join(", ") : loc;

  // Create unique location and contract options for filters
  const uniqueLocations = [
    ...new Set(
      jobOffers
        .flatMap(job => (Array.isArray(job.location) ? job.location : [job.location]))
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    ),
  ];

  const uniqueContracts = [...new Set(jobOffers.map(job => job.contract_type) || [])];

  useEffect(() => {
    if (!user || isAuthLoading || isRoleLoading) return;
    
    // Only redirect if user is actually on the home page (not from a page reload)
    const currentPath = window.location.pathname;
    if (currentPath !== "/" && currentPath !== "/index") return;
    
    // Add a small delay to ensure the user state is properly set after login
    const timeoutId = setTimeout(() => {
      // Double check that user is still logged in after timeout
      if (!user) return;
    
      // Use normalized role flags from useAuth to avoid FR/EN mismatch
      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else if (isRecruiter || isObserver) {
        // Recruteurs et observateurs: accès au dashboard recruteur
        navigate("/recruiter/dashboard", { replace: true });
      } else if (isCandidate) {
        navigate("/candidate/dashboard?view=dashboard", { replace: true });
      }
    }, 100); // Small delay to ensure state is stable
    
    return () => clearTimeout(timeoutId);
  }, [user, isAdmin, isRecruiter, isObserver, isCandidate, isAuthLoading, isRoleLoading, navigate]);

  // Ne pas afficher la page d'accueil si l'utilisateur est connecté ET qu'il est vraiment sur la home
  const currentPath = window.location.pathname;
  if (user && (currentPath === "/" || currentPath === "/index")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Redirection en cours...</span>
        </div>
      </div>
    );
  }

  const filteredJobs = jobOffers.filter(job => {
    const hayTitle = (job.title || "").toLowerCase();
    const hayLoc = normalizeLocation(job.location).toLowerCase();
    const needle = (searchTerm || "").toLowerCase();
    const matchesSearch = hayTitle.includes(needle) || hayLoc.includes(needle);
    
    const matchesLocation =
      locationFilter === "all" ||
      (Array.isArray(job.location)
        ? job.location.includes(locationFilter)
        : job.location === locationFilter);
        
    const matchesContract = contractFilter === "all" || job.contract_type === contractFilter;
    
    return matchesSearch && matchesLocation && matchesContract;
  });

  // Fonction de test d'email
  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error("Veuillez saisir un email de destination");
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const result = await supabase.functions.invoke('send_application_confirmation', {
        body: {
          to: testEmail.trim(),
          firstName: testFirstName.trim(),
          jobTitle: testJobTitle.trim(),
          applicationId: 'TEST-' + Date.now(),
        },
      });

      if (result.error) {
        setTestResult({
          success: false,
          message: "Erreur lors de l'envoi",
          details: result.error
        });
        toast.error("Test d'email échoué");
      } else {
        setTestResult({
          success: true,
          message: "Email de test envoyé avec succès !",
          details: result.data
        });
        toast.success("Email de test envoyé ! Vérifiez votre boîte de réception");
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Erreur inattendue",
        details: error
      });
      toast.error("Erreur lors du test d'email");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Layout showFooter={true}>
      {/* Hero Section with enhanced design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-36 -translate-y-36"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
        </div>
        <div className="relative container mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4 animate-fade-in">
              <div className="bg-white rounded-full p-2 sm:p-3 shadow-lg">
                <img 
                  src="/logo-SEEG.png" 
                  alt="Logo SEEG" 
                  className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                />
              </div>
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-medium">
                Société d'Énergie et d'Eau du Gabon
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold animate-fade-in delay-100 px-2 leading-tight">
            Rejoignez l'équipe dirigeante de la SEEG
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold opacity-90 animate-fade-in delay-150 px-4 leading-relaxed">
              et participez au développement énergétique du Gabon
            </h2>
            <div className="pt-4 sm:pt-6 animate-fade-in delay-400">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-white bg-transparent text-white w-full sm:w-auto"
                  onClick={() => navigate('/company-context')}
                >
                  Contexte de recrutement
                </Button>
                            <Button
              size="lg"
              className="bg-white text-blue-700 font-semibold w-full sm:w-auto opacity-50 cursor-not-allowed pointer-events-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (preLaunch) {
                  preLaunchToast();
                } else if (applicationsClosed) {
                  toast.info("Les candidatures sont désormais closes.");
                }
              }}
              disabled={true}
              title={applicationsClosed ? "Les candidatures sont closes" : preLaunch ? "Candidatures indisponibles jusqu'au 25 août 2025" : ""}
            >
              Candidatures closes
            </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {jobOffers.length > 0 && (
        <ApplicationDeadlineCounter jobOffers={jobOffers} />
      )}
      
      <div className="container mx-auto px-4 py-8" id="job-list">
        {/* Sélecteur de vue */}
        <div className="flex justify-center mb-4 sm:mb-6 px-4">
          <div className="bg-white rounded-lg p-1 shadow-sm border w-full sm:w-auto">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Vue </span>Cartes
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Vue </span>Liste
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4 animate-fade-in delay-200">
          <div className="relative flex gap-2" role="search" aria-label="Recherche d'offres">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un poste ou une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
                aria-label="Rechercher un poste ou une ville"
                type="search"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 sm:h-12 gap-1 sm:gap-2 w-10 sm:w-auto justify-center text-xs sm:text-sm">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Filtres</span>
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
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center mb-6 sm:mb-8 px-4">
          <div className="bg-card rounded-lg border p-3 sm:p-4 shadow-soft">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              <span className="font-semibold text-primary">{filteredJobs.length}</span> offres disponibles
            </p>
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
          {isLoading ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 py-8 sm:py-12">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
              <span className="text-sm sm:text-base text-muted-foreground">Chargement des offres...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8 sm:py-12 px-4">
              <p className="text-sm sm:text-base">Une erreur est survenue lors du chargement des offres d'emploi.</p>
              <p className="text-xs sm:text-sm">Veuillez réessayer plus tard.</p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredJobs.map((job, index) => (
                <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${300 + index * 100}ms` }}>
                  <JobCard
                    title={job.title}
                    location={normalizeLocation(job.location)}
                    contractType={job.contract_type}
                    description={job.description}
                    isPreview={true}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    locked={preLaunch}
                    onLockedClick={() => toast.info("Les appels à candidature seront disponibles à partir du lundi 25 août 2025.")}
                    // candidateCount={isApplicationClosed() ? 0 : undefined} // Forcer la désactivation si les candidatures sont closes
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden mx-4">
              {/* Header pour desktop seulement */}
              <div
                className={`hidden sm:grid ${
                  preLaunch
                    ? "[grid-template-columns:1fr_auto]"
                    : "[grid-template-columns:2fr_minmax(160px,1fr)_minmax(180px,1fr)_auto]"
                } items-center gap-4 p-4 bg-gray-50 border-b font-semibold text-sm`}
              >
                <div>Titre du poste</div>
                {!preLaunch && <div>Lieu</div>}
                {!preLaunch && <div>Type de contrat</div>}
                <div className="text-center">Action</div>
              </div>
              {filteredJobs.map((job, index) => (
                <div key={job.id} className="border-b hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${300 + index * 50}ms` }}>
                  {/* Version mobile - empilée */}
                  <div className="sm:hidden p-4 space-y-3">
                    <div className="font-medium text-base sm:text-lg">{job.title}</div>
                    {!preLaunch && (
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="bg-gray-100 px-2 py-1 rounded">{normalizeLocation(job.location)}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">{job.contract_type}</span>
                      </div>
                    )}
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() =>
                        preLaunch
                          ? toast.info("Les appels à candidature seront disponibles à partir du  lundi 25 août 2025.")
                          : navigate(`/jobs/${job.id}`)
                      }
                      className={"w-full text-xs sm:text-sm h-8 md:h-9"}
                    >
                      Voir l'offre
                    </Button>
                  </div>
                  {/* Version desktop - grille */}
                  <div
                    className={`hidden sm:grid ${
                      preLaunch
                        ? "[grid-template-columns:1fr_auto]"
                        : "[grid-template-columns:2fr_minmax(160px,1fr)_minmax(180px,1fr)_auto]"
                    } items-center gap-4 p-4`}
                  >
                    <div className="font-medium">{job.title}</div>
                    {!preLaunch && <div className="text-muted-foreground">{normalizeLocation(job.location)}</div>}
                    {!preLaunch && <div className="text-muted-foreground">{job.contract_type}</div>}
                    <div className="flex justify-center">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() =>
                          preLaunch
                            ? toast.info("Les appels à candidature seront disponibles à partir du  lundi 25 août 2025.")
                            : navigate(`/jobs/${job.id}`)
                        }
                        className={"w-full md:w-auto text-xs sm:text-sm h-8 md:h-9"}
                      >
                        Voir l'offre
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Contexte */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                  À propos de l'entreprise : Contexte du recrutement
                </h2>
                <p className="text-sm sm:text-base md:text-lg opacity-90 mb-4 sm:mb-6 leading-relaxed">
                  Explorez la vision stratégique et les ambitions portées
                  par cette campagne de recrutement inédite pour
                  impulser une nouvelle ère à la SEEG
                </p>
                <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
                  <a href="/company-context">
                    En savoir plus →
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <p className="text-muted-foreground text-sm sm:text-base mb-4">Aucune offre ne correspond à votre recherche.</p>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => setSearchTerm("")}
            >
              Voir toutes les offres
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center py-12 sm:py-16 mt-8 sm:mt-16 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Espace recruteurs
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Accédez à l'interface de gestion des candidatures et du processus de recrutement.
            </p>
            <Button variant="recruiter" size="lg" asChild className="w-full sm:w-auto">
              <a href="/auth">
                Accéder à l'espace RH
              </a>
            </Button>
          </div>
        </div>

      </div>
      
      {/* Chatbot */}
      <Chatbot />
    </Layout>
  );
};

export default Index;
