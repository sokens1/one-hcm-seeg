import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, FileText, Download } from "lucide-react";
import { useApplication } from "@/hooks/useApplications";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CandidateDetailModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'candidature': return { label: 'Candidature', variant: 'secondary' as const };
    case 'incubation': return { label: 'Incubation', variant: 'default' as const };
    case 'embauche': return { label: 'Embauché', variant: 'secondary' as const };
    case 'refuse': return { label: 'Refusé', variant: 'destructive' as const };
    default: return { label: status, variant: 'outline' as const };
  }
};

export function CandidateDetailModal({ applicationId, isOpen, onClose }: CandidateDetailModalProps) {
  const { data: application, isLoading, error } = useApplication(applicationId);

  if (!isOpen) return null;

  const candidate = application?.users;
  const jobOffer = application?.job_offers;
  const statusConfig = getStatusConfig(application?.status || '');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Détails du candidat
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Chargement des détails...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>Erreur lors du chargement des détails du candidat.</p>
          </div>
        ) : application && candidate ? (
          <div className="space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Nom complet :</span>
                      <span>{candidate.first_name} {candidate.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Email :</span>
                      <span>{candidate.email}</span>
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Téléphone :</span>
                        <span>{candidate.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Candidature soumise :</span>
                      <span>{formatDistanceToNow(new Date(application.created_at), { addSuffix: true, locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Statut :</span>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Détails de l'offre */}
            {jobOffer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Offre d'emploi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div><span className="font-medium">Poste :</span> {jobOffer.title}</div>
                    <div><span className="font-medium">Localisation :</span> {jobOffer.location}</div>
                    <div><span className="font-medium">Type de contrat :</span> {jobOffer.contract_type}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Détails de la candidature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Détails de la candidature
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.cover_letter && (
                  <div>
                    <span className="font-medium">Lettre de motivation :</span>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
                    </div>
                  </div>
                )}
                
                {application.motivation && (
                  <div>
                    <span className="font-medium">Motivation :</span>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{application.motivation}</p>
                    </div>
                  </div>
                )}

                {application.availability_start && (
                  <div>
                    <span className="font-medium">Disponibilité :</span>
                    <span className="ml-2">{new Date(application.availability_start).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}

                {application.reference_contacts && (
                  <div>
                    <span className="font-medium">Contacts de référence :</span>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{application.reference_contacts}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button variant="default">
                <Mail className="w-4 h-4 mr-2" />
                Contacter
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune donnée disponible pour ce candidat.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
