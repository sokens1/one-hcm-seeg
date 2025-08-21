import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, FileText, Download } from "lucide-react";
import { useApplication } from "@/hooks/useApplications";
import { useApplicationDocuments, getDocumentTypeLabel, formatFileSize } from "@/hooks/useDocuments";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  const queryClient = useQueryClient();
  const { data: documents = [] } = useApplicationDocuments(applicationId);

  // Temps réel: rafraîchir si le profil candidat (table users) ou la candidature change
  useEffect(() => {
    if (!applicationId || !isOpen) return;

    // On attend d'avoir l'application pour récupérer candidate_id
    const candidateId = (application as unknown as { candidate_id?: string })?.candidate_id;

    const channel = supabase
      .channel(`candidate-detail-${applicationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'applications',
        filter: `id=eq.${applicationId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      })
      .subscribe();

    let userChannel: ReturnType<typeof supabase.channel> | null = null;
    if (candidateId) {
      userChannel = supabase
        .channel(`candidate-user-${candidateId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${candidateId}`,
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
        })
        .subscribe();
    }

    // Documents realtime for this application
    const docsChannel = supabase
      .channel(`application-docs-${applicationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `application_id=eq.${applicationId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['documents', applicationId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (userChannel) supabase.removeChannel(userChannel);
      supabase.removeChannel(docsChannel);
    };
  }, [applicationId, isOpen, application, queryClient]);

  if (!isOpen) return null;

  const candidate = application?.users;
  const jobOffer = application?.job_offers;
  const statusConfig = getStatusConfig(application?.status || '');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
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
          <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Infos candidat */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="w-4 h-4" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm">Nom complet :</span>
                      </div>
                      <span className="text-xs sm:text-sm">{candidate.first_name} {candidate.last_name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm">Email :</span>
                      </div>
                      <span className="text-xs sm:text-sm break-all">{candidate.email}</span>
                    </div>
                    {candidate.phone && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-xs sm:text-sm">Téléphone :</span>
                        </div>
                        <span className="text-xs sm:text-sm">{candidate.phone}</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm">Candidature soumise :</span>
                      </div>
                      <span className="text-xs sm:text-sm">{formatDistanceToNow(new Date(application.created_at), { addSuffix: true, locale: fr })}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium text-xs sm:text-sm">Statut :</span>
                      <Badge variant={statusConfig.variant} className="text-xs w-fit">{statusConfig.label}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Infos offre */}
            {jobOffer && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="w-4 h-4" />
                    Offre d'emploi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <span className="font-medium text-xs sm:text-sm">Poste :</span>
                      <span className="text-xs sm:text-sm">{jobOffer.title}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <span className="font-medium text-xs sm:text-sm">Localisation :</span>
                      <span className="text-xs sm:text-sm">{jobOffer.location}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <span className="font-medium text-xs sm:text-sm">Type de contrat :</span>
                      <span className="text-xs sm:text-sm">{jobOffer.contract_type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Documents de la candidature */}
          <Card className="mt-4 sm:mt-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Documents de la candidature</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
              {documents.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">Aucun document fourni.</p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-md p-3 gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm">{getDocumentTypeLabel(doc.document_type)}</div>
                      <div className="text-xs text-muted-foreground truncate">{doc.file_name} · {formatFileSize(doc.file_size)}</div>
                    </div>
                    <a href={doc.file_path} target="_blank" rel="noreferrer" className="flex-shrink-0">
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Télécharger
                      </Button>
                    </a>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Détails de la candidature */}
          <Card className="mt-4 sm:mt-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Détails de la candidature</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              {application.cover_letter && (
                <div>
                  <span className="font-medium text-xs sm:text-sm">Lettre de motivation :</span>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{application.cover_letter}</p>
                  </div>
                </div>
              )}
              
              {application.motivation && (
                <div>
                  <span className="font-medium text-xs sm:text-sm">Motivation :</span>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{application.motivation}</p>
                  </div>
                </div>
              )}

              {application.availability_start && (
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <span className="font-medium text-xs sm:text-sm">Disponibilité :</span>
                  <span className="text-xs sm:text-sm">{new Date(application.availability_start).toLocaleDateString('fr-FR')}</span>
                </div>
              )}

              {application.reference_contacts && (
                <div>
                  <span className="font-medium text-xs sm:text-sm">Contacts de référence :</span>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{application.reference_contacts}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm">
              Fermer
            </Button>
            <Button variant="default" className="text-xs sm:text-sm">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Contacter
            </Button>
          </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune donnée disponible pour ce candidat.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
