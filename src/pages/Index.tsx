import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useJobOffers, type JobOffer } from "@/hooks/useJobOffers";
import { Layout } from "@/components/layout/Layout";
import { JobCard } from "@/components/ui/job-card";
import { ApplicationDeadlineCounter } from "@/components/ApplicationDeadlineCounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Grid, List, Building, Loader2 } from "lucide-react";
import { useState } from "react";

// Les offres sont désormais chargées dynamiquement depuis Supabase

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const { data, isLoading, error } = useJobOffers();
  const jobOffers: JobOffer[] = data ?? [];

  useEffect(() => {
    if (user) {
      const role = user.user_metadata?.role;
      if (role === 'candidate') {
        navigate("/candidate/dashboard");
      } else if (role === 'recruiter') {
        navigate("/recruiter/dashboard");
      }
    }
  }, [user, navigate]);

  // Ne pas afficher la page d'accueil si l'utilisateur est connecté
  if (user) {
    return null;
  }

  const filteredJobs = jobOffers.filter(job => 
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
                  className="border-2 border-white bg-transparent hover:bg-white/10 text-white w-full sm:w-auto"
                  onClick={() => navigate('/company-context')}
                >
                  Contexte de recrutement
                </Button>
                <Button 
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-gray-200 font-semibold w-full sm:w-auto"
                  onClick={() => document.getElementById('job-list')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Postuler
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
            <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12">
              <Filter className="w-4 h-4" />
            </Button>
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
                    location={job.location}
                    contractType={job.contract_type}
                    description={job.description}
                    isPreview={true}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden mx-4">
              {/* Header pour desktop seulement */}
              <div className="hidden sm:grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm">
                <div>Titre du poste</div>
                <div>Lieu</div>
                <div>Type de contrat</div>
                <div>Action</div>
              </div>
              {filteredJobs.map((job, index) => (
                <div key={job.id} className="border-b hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${300 + index * 50}ms` }}>
                  {/* Version mobile - empilée */}
                  <div className="sm:hidden p-4 space-y-3">
                    <div className="font-medium text-base sm:text-lg">{job.title}</div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="bg-gray-100 px-2 py-1 rounded">{job.location}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{job.contract_type}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="w-full"
                    >
                      Voir l'offre
                    </Button>
                  </div>
                  {/* Version desktop - grille */}
                  <div className="hidden sm:grid grid-cols-4 gap-4 p-4">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-muted-foreground">{job.location}</div>
                    <div className="text-muted-foreground">{job.contract_type}</div>
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}`)}
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
                  Explorez la vision stratégique et les ambitieux portées
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
              Équipe RH SEEG ?
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
    </Layout>
  );
};

export default Index;
