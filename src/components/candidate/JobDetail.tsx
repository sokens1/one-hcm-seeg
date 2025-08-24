/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Briefcase, Send, Building2, Banknote, Clock } from "lucide-react";
import { useJobOffer } from "@/hooks/useJobOffers";
import { ContentSpinner } from "@/components/ui/spinner";

interface JobDetailProps {
  jobId: string;
  onBack: () => void;
  onApply: () => void;
}

export function JobDetail({ jobId, onBack, onApply }: JobDetailProps) {
  const { data: jobOffer, isLoading, error } = useJobOffer(jobId);

  if (isLoading) {
    return <ContentSpinner text="Chargement de l'offre d'emploi..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Une erreur est survenue lors du chargement de l'offre.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (!jobOffer) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Offre introuvable ou non disponible.
      </div>
    );
  }

  const publishedAt = jobOffer.created_at ? new Date(jobOffer.created_at).toLocaleDateString() : undefined;
  const deadline = jobOffer.date_limite ? new Date(jobOffer.date_limite).toLocaleDateString() : 
                   jobOffer.application_deadline ? new Date(jobOffer.application_deadline).toLocaleDateString() : undefined;

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
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      {/* Header avec gradient comme la vue publique */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-3 sm:mb-4 text-blue-600 bg-white text-sm sm:text-base"
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
                  <Banknote className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
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
                  <div className="space-y-2 sm:space-y-3">
                    {jobOffer.responsibilities.map((mission, index) => (
                      <div key={index} className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {mission}
                      </div>
                    ))}
                  </div>
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
                    <div className="space-y-2 sm:space-y-3">
                      {jobOffer.requirements.map((requirement, index) => (
                        <div key={index} className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {requirement}
                        </div>
                      ))}
                    </div>
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
                      <span>Date d'embauche : {new Date(jobOffer.start_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>
                      {jobOffer.date_limite 
                        ? `Date limite : ${new Date(jobOffer.date_limite).toLocaleDateString('fr-FR')}`
                        : "Candidatures ouvertes"
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Publié le {new Date(jobOffer.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={onApply} 
                  className="w-full text-sm sm:text-base"
                  size="lg"
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Postuler à cette offre
                </Button>
                
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Processus de candidature en ligne sécurisé
                </p>
              </CardContent>
            </Card>

            {/* À propos de ce poste - conservé comme demandé */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">À propos de ce poste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <div className="text-xs sm:text-sm font-medium">Lieu</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{jobOffer.location}</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium">Type de contrat</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{jobOffer.contract_type}</div>
                </div>
                {jobOffer.department && (
                  <div>
                    <div className="text-xs sm:text-sm font-medium">Département</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{jobOffer.department}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs sm:text-sm font-medium">Date de publication</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{publishedAt || ""}</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-medium">Date limite</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{deadline || ""}</div>
                </div>
                {jobOffer.start_date && (
                  <div>
                    <div className="text-xs sm:text-sm font-medium">Date d'entrée souhaitée</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{new Date(jobOffer.start_date).toLocaleDateString('fr-FR')}</div>
                  </div>
                )}
                {jobOffer.reporting_line && (
                  <div>
                    <div className="text-xs sm:text-sm font-medium">Ligne hiérarchique</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{jobOffer.reporting_line}</div>
                  </div>
                )}
                {jobOffer.job_grade && (
                  <div>
                    <div className="text-xs sm:text-sm font-medium">Catégorie / Niveau</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{jobOffer.job_grade}</div>
                  </div>
                )}
                {jobOffer.salary_note && (
                  <div>
                    <div className="text-xs sm:text-sm font-medium">Rémunération / Avantages (note)</div>
                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{jobOffer.salary_note}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}