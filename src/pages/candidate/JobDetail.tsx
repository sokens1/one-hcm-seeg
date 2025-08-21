/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Building2, Users, DollarSign, Clock, Loader2 } from "lucide-react";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { useJobOffer } from "@/hooks/useJobOffers";
import { useAuth } from "@/hooks/useAuth";
import { useApplicationStatus } from "@/hooks/useApplications";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const { data: jobOffer, isLoading, error } = useJobOffer(id || "");
  const { user } = useAuth();
  const { data: applicationStatus, isLoading: isLoadingApplication } = useApplicationStatus(id || "");

  const handleBackToJobs = () => {
    navigate("/");
  };

  const handleApply = () => {
    const target = `/candidate/dashboard?view=jobs&jobId=${id}&apply=1`;
    if (!user) {
      // Redirect to auth and then into candidate dashboard at the same job
      const redirect = encodeURIComponent(target);
      navigate(`/auth?redirect=${redirect}`);
      return;
    }
    // If already authenticated, go to candidate dashboard at the job detail
    navigate(target);
  };

  const handleApplicationSubmit = () => {
    setShowApplicationForm(false);
    navigate("/");
  };

  if (isLoading || isLoadingApplication) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8" aria-live="polite">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Chargement de l'offre...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !jobOffer) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Offre non trouvée</h1>
            <p className="text-muted-foreground mb-6">
              {error?.message ?? "Cette offre d'emploi n'existe pas ou n'est plus disponible."}
            </p>
            <Button variant="outline" onClick={handleBackToJobs}>
              Retour aux offres
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (showApplicationForm) {
    return (
      <ApplicationForm
        jobTitle={jobOffer.title}
        jobId={jobOffer.id}
        onBack={() => setShowApplicationForm(false)}
        onSubmit={handleApplicationSubmit}
      />
    );
  }

  // Normalize category label from possible shapes (string or object)
  const categoryLabel = (() => {
    const cat: unknown = (jobOffer as any).categorie_metier;
    if (!cat) return null;
    if (typeof cat === 'string') return cat.trim();
    if (typeof cat === 'object') {
      const obj = cat as Record<string, unknown>;
      const candidate = (obj.label || obj.name || obj.title || obj.categorie || obj.category) as string | undefined;
      return candidate?.trim() || null;
    }
    return null;
  })();

  const formatSalary = (min: number | null | undefined, max: number | null | undefined) => {
    if (!min && !max) return "Salaire à négocier";
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} FCFA`;
    if (min) return `À partir de ${min.toLocaleString()} FCFA`;
    if (max) return `Jusqu'à ${max.toLocaleString()} FCFA`;
    return "Salaire à négocier";
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 sm:py-8">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToJobs}
              className="mb-3 sm:mb-4 text-white hover:bg-white/10 text-sm sm:text-base"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Retour aux offres</span>
              <span className="sm:hidden">Retour</span>
            </Button>
            
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm bg-white/20 px-2 sm:px-3 py-1 rounded-full">
                  {jobOffer.department || "SEEG"}
                </span>
              </div>
              {categoryLabel && (
                <div className="mb-2 sm:mb-3">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                    {categoryLabel}
                  </Badge>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 break-words">{jobOffer.title}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base lg:text-lg">
                <div className="flex items-center gap-1 sm:gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>{jobOffer.location}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>{jobOffer.contract_type}</span>
                </div>
                {jobOffer.salary_note && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">{jobOffer.salary_note}</span>
                  </div>
                )}
                {jobOffer.reporting_line && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">{jobOffer.reporting_line}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Missions principales */}
              {jobOffer.responsibilities && jobOffer.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">MISSIONS PRINCIPALES</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 sm:space-y-3">
                      {jobOffer.responsibilities.map((mission, index) => (
                        <li key={index} className="flex items-start gap-2 sm:gap-3">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">{mission}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Connaissances savoir et requis */}
              {((jobOffer.requirements && jobOffer.requirements.length > 0) || jobOffer.profile) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">CONNAISSANCE SAVOIR ET REQUIS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {jobOffer.requirements && jobOffer.requirements.length > 0 ? (
                      <ul className="space-y-2 sm:space-y-3">
                        {jobOffer.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start gap-2 sm:gap-3">
                            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm sm:text-base text-foreground">
                        {jobOffer.profile}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {jobOffer.benefits && jobOffer.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Avantages</CardTitle>
                    <CardTitle className="text-lg sm:text-xl">Avantages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-2 sm:gap-3">
                      {jobOffer.benefits.map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="justify-start p-2 sm:p-3 text-xs sm:text-sm">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Application Card */}
              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Postuler maintenant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    {jobOffer.start_date && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>Date d'embauche: {new Date(jobOffer.start_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>
                        {jobOffer.date_limite 
                          ? `Date limite: ${new Date(jobOffer.date_limite).toLocaleDateString('fr-FR')}`
                          : "Candidatures ouvertes"
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Publié le {new Date(jobOffer.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  {applicationStatus ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs sm:text-sm">
                            {applicationStatus.status === 'candidature' && 'Candidature envoyée'}
                            {applicationStatus.status === 'incubation' && 'En cours d\'évaluation'}
                            {applicationStatus.status === 'embauche' && 'Candidature retenue'}
                            {applicationStatus.status === 'refuse' && 'Candidature non retenue'}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-green-700 mt-2">
                          Candidature envoyée le {new Date(applicationStatus.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full text-sm sm:text-base"
                        size="lg"
                        onClick={() => navigate('/candidate/dashboard?view=applications')}
                      >
                        Voir ma candidature
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button 
                        onClick={handleApply} 
                        className="w-full text-sm sm:text-base"
                        size="lg"
                      >
                        <span className="hidden sm:inline">{user ? "Postuler à cette offre" : "Se connecter pour postuler"}</span>
                        <span className="sm:hidden">{user ? "Postuler" : "Se connecter"}</span>
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center leading-relaxed">
                        Processus de candidature en ligne sécurisé
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">À propos de SEEG</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    La Société d'Énergie et d'Eau du Gabon (SEEG) est l'opérateur historique 
                    des services publics d'électricité et d'eau potable au Gabon.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 sm:mt-4 w-full text-xs sm:text-sm" asChild>
                    <Link to="/company-context">
                      En savoir plus
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}