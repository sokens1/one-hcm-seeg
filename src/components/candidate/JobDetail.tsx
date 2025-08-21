import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Users, Briefcase, Send } from "lucide-react";
import { useJobOffer } from "@/hooks/useJobOffers";

interface JobDetailProps {
  jobId: string;
  onBack: () => void;
  onApply: () => void;
}

export function JobDetail({ jobId, onBack, onApply }: JobDetailProps) {
  const { data: jobOffer, isLoading, error } = useJobOffer(jobId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
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

  return (
    <div className="space-y-6 sm:space-y-8 px-3 sm:px-0">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Retour</span>
        </Button>
      </div>

      {/* En-tête du poste */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl mb-3 leading-tight">{jobOffer.title}</CardTitle>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{jobOffer.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{jobOffer.contract_type}</span>
                </div>
                {jobOffer.department && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{jobOffer.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{publishedAt ? `Publié le ${publishedAt}` : ""}</span>
                </div>
              </div>
              {jobOffer.categorie_metier && (
                <div className="mb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {jobOffer.categorie_metier === 'metier_eau' && 'Métiers de l\'eau et assainissement'}
                    {jobOffer.categorie_metier === 'metier_electricite' && 'Métiers de l\'électricité et énergie'}
                    {jobOffer.categorie_metier === 'metier_clientele' && 'Métiers de la relation clientèle'}
                    {jobOffer.categorie_metier === 'metier_support' && 'Métiers du support et maintenance'}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-4 sm:mt-0">
              {deadline && (
                <Badge variant="secondary" className="text-center text-xs sm:text-sm">
                  Candidatures ouvertes jusqu'au {deadline}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Description du poste */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Description du poste</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {jobOffer.description}
              </p>
            </CardContent>
          </Card>

          {/* Missions principales */}
          {jobOffer.responsibilities && jobOffer.responsibilities.length > 0 && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Missions principales</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ul className="space-y-2 sm:space-y-3">
                  {jobOffer.responsibilities.map((mission, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-muted-foreground text-sm sm:text-base leading-relaxed">{mission}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Profil recherché / Exigences */}
          {((jobOffer.requirements && jobOffer.requirements.length > 0) || jobOffer.profile) && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Profil recherché</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {jobOffer.requirements && jobOffer.requirements.length > 0 ? (
                  <ul className="space-y-2 sm:space-y-3">
                    {jobOffer.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground text-sm sm:text-base leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="whitespace-pre-wrap text-foreground text-sm sm:text-base leading-relaxed">{jobOffer.profile}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Avantages */}
          {jobOffer.benefits && jobOffer.benefits.length > 0 && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Avantages</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-wrap gap-2">
                  {jobOffer.benefits.map((benefit, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs sm:text-sm">{benefit}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Action de candidature */}
          <Card className="lg:sticky lg:top-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Candidature</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <Button 
                onClick={onApply}
                className="w-full gap-2 text-sm sm:text-base"
                size="lg"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                Postuler
              </Button>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                En postulant, votre profil sera automatiquement transmis à l'équipe RH de la SEEG.
              </p>
            </CardContent>
          </Card>

          {/* Informations complémentaires */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">À propos de ce poste</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
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
  );
}