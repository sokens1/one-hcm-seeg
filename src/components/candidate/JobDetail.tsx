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
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>

      {/* En-tête du poste */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">{jobOffer.title}</CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {jobOffer.location}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {jobOffer.contract_type}
                </div>
                {jobOffer.department && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {jobOffer.department}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {publishedAt ? `Publié le ${publishedAt}` : ""}
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
            <div className="flex flex-col gap-2">
              {deadline && (
                <Badge variant="secondary" className="text-center">
                  Candidatures ouvertes jusqu'au {deadline}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description du poste */}
          <Card>
            <CardHeader>
              <CardTitle>Description du poste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {jobOffer.description}
              </p>
            </CardContent>
          </Card>

          {/* Profil recherché / Exigences */}
          {((jobOffer.requirements && jobOffer.requirements.length > 0) || jobOffer.profile) && (
            <Card>
              <CardHeader>
                <CardTitle>Profil recherché</CardTitle>
              </CardHeader>
              <CardContent>
                {jobOffer.requirements && jobOffer.requirements.length > 0 ? (
                  <ul className="space-y-2">
                    {jobOffer.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="whitespace-pre-wrap text-foreground">{jobOffer.profile}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Avantages */}
          {jobOffer.benefits && jobOffer.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Avantages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {jobOffer.benefits.map((benefit, idx) => (
                    <Badge key={idx} variant="outline">{benefit}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action de candidature */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Candidature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={onApply}
                className="w-full gap-2"
                size="lg"
              >
                <Send className="w-4 h-4" />
                Postuler
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                En postulant, votre profil sera automatiquement transmis à l'équipe RH de la SEEG.
              </p>
            </CardContent>
          </Card>

          {/* Informations complémentaires */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">À propos de ce poste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">Lieu</div>
                <div className="text-sm text-muted-foreground">{jobOffer.location}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Type de contrat</div>
                <div className="text-sm text-muted-foreground">{jobOffer.contract_type}</div>
              </div>
              {jobOffer.department && (
                <div>
                  <div className="text-sm font-medium">Département</div>
                  <div className="text-sm text-muted-foreground">{jobOffer.department}</div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium">Date de publication</div>
                <div className="text-sm text-muted-foreground">{publishedAt || ""}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Date limite</div>
                <div className="text-sm text-muted-foreground">{deadline || ""}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}