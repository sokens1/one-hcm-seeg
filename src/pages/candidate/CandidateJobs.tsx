import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { JobCard } from "@/components/ui/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid, List, Building } from "lucide-react";
import { useJobOffers } from "@/hooks/useJobOffers";
import { useJobOfferNotifications } from "@/hooks/useJobOfferNotifications";
import { isPreLaunch } from "@/utils/launchGate";
import { toast } from "sonner";
import { ContentSpinner } from "@/components/ui/spinner";
import { isApplicationClosed } from "@/utils/applicationUtils";
import { CampaignEligibilityAlert } from "@/components/ui/CampaignEligibilityAlert";
import { useCampaignEligibility } from "@/hooks/useCampaignEligibility";

export default function CandidateJobs() {
  useJobOfferNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [statusFilter, setStatusFilter] = useState<"all" | "interne" | "externe">("all");
  const { data, isLoading, error } = useJobOffers();
  const jobOffers = data ?? [];
  const preLaunch = isPreLaunch();
  const applicationsClosed = isApplicationClosed();
  const preLaunchToast = () => toast.info("Les candidatures seront disponibles à partir du lundi 25 août 2025.");
  const { isEligible } = useCampaignEligibility();

  // Handle jobId parameter to open specific job application
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId && jobOffers.length > 0) {
      const job = jobOffers.find(j => j.id === jobId);
      if (job) {
        // Navigate to the specific job detail page
        navigate(`/jobs/${jobId}`);
      }
    }
  }, [searchParams, jobOffers, navigate]);

  // Helper to normalize location which can be string | string[] from the API
  const normalizeLocation = (loc: string | string[] | null | undefined): string => {
    if (Array.isArray(loc)) return loc.filter(Boolean).join(", ");
    return loc || "";
  };

  const filteredJobs = jobOffers.filter(job => {
    // Filtre par recherche texte
    const hayTitle = (job.title || "").toLowerCase();
    const hayLoc = (normalizeLocation(job.location) || "").toLowerCase();
    const needle = (searchTerm || "").toLowerCase();
    const matchesSearch = hayTitle.includes(needle) || hayLoc.includes(needle);
    
    // Filtre par statut interne/externe
    const matchesStatus = statusFilter === "all" || 
      (job.status_offerts || 'externe') === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <Layout showFooter={true}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500">Erreur lors du chargement des offres: {error.message}</p>
            <Button variant="outline" onClick={() => {
              if (typeof window !== 'undefined' && window.location?.reload) {
                window.location.reload();
              }
            }}>
              Réessayer
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={true}>
      {/* Hero Section with enhanced design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-36 -translate-y-36"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
        </div>
        <div className="relative container mx-auto px-4 py-12 sm:py-20">
          <div className="text-center space-y-6">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium animate-fade-in">
              Société d'Énergie et d'Eau du Gabon
            </div>
            <h1 className="text-5xl md:text-6xl font-bold animate-fade-in delay-100">
              Nos {filteredJobs.length} poste{filteredJobs.length > 1 ? 's' : ''} à pourvoir
            </h1>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold opacity-90 animate-fade-in delay-150">
              au sein du comité de direction
            </h2>
            <p className="text-base sm:text-lg md:text-2xl opacity-90 max-w-3xl mx-auto animate-fade-in delay-200">
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
                className="bg-white/20 text-white border-white/30"
                onClick={() => navigate('/auth')}
              >
                Postuler
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
        <div className="max-w-2xl mx-auto mb-6 animate-fade-in delay-200">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un poste ou une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 sm:h-12"
              />
            </div>
          </div>
        </div>

        {/* Filtres par statut */}
        <div className="max-w-2xl mx-auto mb-8 animate-fade-in delay-250">
          <div className="flex justify-center gap-2 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="gap-2"
            >
              Toutes les offres
            </Button>
            <Button
              variant={statusFilter === "interne" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("interne")}
              className="gap-2"
            >
              🏢 Offres internes
            </Button>
            <Button
              variant={statusFilter === "externe" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("externe")}
              className="gap-2"
            >
              🌍 Offres externes
            </Button>
          </div>
        </div>

        {/* Campaign Eligibility Alert */}
        {!isEligible && (
          <div className="max-w-7xl mx-auto mb-6 px-4">
            <CampaignEligibilityAlert />
          </div>
        )}

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
          {isLoading ? (
            <ContentSpinner text="Chargement des offres..." />
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    onLockedClick={() => {
                      if (preLaunch) {
                        toast.info("Les appels à candidature seront disponibles à partir du lundi 25 août 2025.");
                      }
                    }}
                    statusOfferts={(job as any).status_offerts || null}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
              <div
                className={`grid ${
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
                <div
                  key={job.id}
                  className={`grid ${
                    preLaunch
                      ? "[grid-template-columns:1fr_auto]"
                      : "[grid-template-columns:2fr_minmax(160px,1fr)_minmax(180px,1fr)_auto]"
                  } items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors animate-fade-in`}
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <div className="font-medium">{job.title}</div>
                  {!preLaunch && <div className="text-muted-foreground">{normalizeLocation(job.location)}</div>}
                  {!preLaunch && <div className="text-muted-foreground">{job.contract_type}</div>}
                  <div className="flex justify-center">
                    <Button 
                      variant="hero" 
                      size="sm"
                      onClick={() =>
                        preLaunch
                          ? toast.info("Les appels à candidature seront disponibles à partir du lundi 25 août 2025.")
                          : navigate(`/jobs/${job.id}`)
                      }
                      className={"w-full md:w-auto text-xs sm:text-sm h-8 md:h-9 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"}
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
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-3">
                  À propos de l'entreprise : Contexte du recrutement
                </h2>
                <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-6">
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
        <div className="text-center py-12 sm:py-16 mt-12 sm:mt-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Équipe RH SEEG ?
            </h2>
            <p className="text-muted-foreground mb-6">
              Accédez à l'interface de gestion des candidatures et du processus de recrutement.
            </p>
            <Button variant="recruiter" size="lg" asChild>
              <a href="/auth">
                Accéder à l'espace RH
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}