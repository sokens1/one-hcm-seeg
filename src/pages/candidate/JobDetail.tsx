import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Building2, Users, DollarSign, Clock, Loader2 } from "lucide-react";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { useJobOffer } from "@/hooks/useJobOffers";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const { jobOffer, isLoading, error } = useJobOffer(id || "");

  const handleBackToJobs = () => {
    navigate("/jobs");
  };

  const handleApply = () => {
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = () => {
    setShowApplicationForm(false);
    navigate("/jobs");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
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
              {error || "Cette offre d'emploi n'existe pas ou n'est plus disponible."}
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

  const formatSalary = (min: number | null, max: number | null) => {
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToJobs}
              className="mb-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux offres
            </Button>
            
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5" />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {jobOffer.department || "SEEG"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{jobOffer.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {jobOffer.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {jobOffer.contract_type}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {formatSalary(jobOffer.salary_min, jobOffer.salary_max)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Description du poste</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {jobOffer.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              {jobOffer.requirements && jobOffer.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Profil recherché</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {jobOffer.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-muted-foreground">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {jobOffer.benefits && jobOffer.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Avantages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {jobOffer.benefits.map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="justify-start p-3">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Card */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl">Postuler maintenant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {jobOffer.application_deadline 
                        ? `Date limite: ${new Date(jobOffer.application_deadline).toLocaleDateString('fr-FR')}`
                        : "Candidatures ouvertes"
                      }
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Publié le {new Date(jobOffer.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleApply} 
                    className="w-full"
                    size="lg"
                  >
                    Postuler à cette offre
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Processus de candidature en ligne sécurisé
                  </p>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">À propos de SEEG</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    La Société d'Énergie et d'Eau du Gabon (SEEG) est l'opérateur historique 
                    des services publics d'électricité et d'eau potable au Gabon.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                    <a href="/company-context">
                      En savoir plus
                    </a>
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