/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useApplication, useRecruiterApplications, Application } from "@/hooks/useApplications";
import { useApplicationDocuments, getDocumentTypeLabel, formatFileSize } from "@/hooks/useDocuments";
import { getMetierQuestionsForTitle } from "@/data/metierQuestions";
import { supabase } from "@/integrations/supabase/client";
import { ObserverLayout } from "@/components/layout/ObserverLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Briefcase, Info, FileText, Eye, Download, Users, X, Archive, ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Link as RouterLink } from "react-router-dom";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { downloadCandidateDocumentsAsZip } from "../../utils/downloadUtils";

const getBadgeVariant = (status: Application['status']) => {
  switch (status) {
    case 'candidature':
      return 'default';
    case 'incubation':
      return 'secondary';
    case 'embauche':
      return 'success';
    case 'refuse':
      return 'destructive';
    default:
      return 'default';
  }
};

const InfoRow = ({ icon: Icon, label, value, isLink = false }: { icon: any, label: string, value?: string | null, isLink?: boolean }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">{label}:</span>
        {isLink ? (
          <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="block text-xs sm:text-sm text-blue-600 hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="text-xs sm:text-sm text-foreground break-words">{value}</p>
        )}
      </div>
    </div>
  );
};

const ProfileTab = ({ application }: { application: Application }) => {
  const user = application?.users;
  // Utiliser le profil inclus via la RPC pour éviter les problèmes RLS
  const profile = (application?.users as any)?.candidate_profiles || null;
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><User className="w-4 h-4 sm:w-5 sm:h-5" /> Informations Personnelles</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Layout horizontal avec grid responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            <InfoRow icon={User} label="Prénom" value={user?.first_name} />
            <InfoRow icon={User} label="Nom" value={user?.last_name} />
            <InfoRow icon={Mail} label="Email" value={user?.email} />
            <InfoRow icon={User} label="Matricule" value={(user as any)?.matricule} />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <InfoRow icon={Phone} label="Téléphone" value={user?.phone as string | undefined} />
            <InfoRow icon={Calendar} label="Date de naissance" value={profile?.birth_date ? format(new Date(profile.birth_date), 'PPP', { locale: fr }) : undefined} />
            <InfoRow icon={Info} label="Sexe" value={profile?.gender || (user as any)?.sexe || (user as any)?.gender} />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <InfoRow icon={Briefcase} label="Poste actuel" value={profile?.current_position} />
            <InfoRow icon={Briefcase} label="Années d'expérience" value={profile?.years_experience !== undefined ? String(profile.years_experience) : undefined} />
            <InfoRow icon={MapPin} label="Adresse" value={profile?.address} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReferencesTab = ({ application }: { application: Application }) => {
  // Fonction pour nettoyer le texte corrompu
  const cleanCorruptedText = (text: string | null | undefined): string => {
    if (!text) return '';
    try {
      return text
        .replace(/â€™/g, "'")
        .replace(/Ã©/g, "é")
        .replace(/Ã¨/g, "è")
        .replace(/Ãª/g, "ê")
        .replace(/Ã /g, "à")
        .replace(/Ã§/g, "ç")
        .replace(/Ã´/g, "ô")
        .replace(/Ã®/g, "î")
        .replace(/Ã»/g, "û")
        .replace(/Ã«/g, "ë")
        .replace(/Ã¯/g, "ï")
        .replace(/â€"/g, "—")
        .replace(/â€"/g, "–")
        .replace(/â€œ/g, '"')
        .replace(/â€/g, '"')
        .replace(/Ã‰/g, "É")
        .replace(/Ãˆ/g, "È")
        .replace(/ÃŠ/g, "Ê")
        .replace(/Ã‡/g, "Ç")
        .replace(/Ã"/g, "Ô");
    } catch (error) {
      console.error('Erreur nettoyage texte:', error);
      return text;
    }
  };

  const isExternalOffer = application.job_offers?.status_offerts === 'externe';
  
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" /> 
          {isExternalOffer ? 'Références de Recommandation' : 'Expérience Professionnelle'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isExternalOffer ? (
          // Section Références pour les offres externes - Afficher toutes les recommandations
          (() => {
            try {
              // Reconstruire les recommandations depuis les listes ordonnées
              const parseField = (field: any): string[] => {
                if (!field) return [];
                if (Array.isArray(field)) return field;
                if (typeof field === 'string') {
                  try {
                    const parsed = JSON.parse(field);
                    return Array.isArray(parsed) ? parsed : [field];
                  } catch {
                    return [field];
                  }
                }
                return [];
              };

              const names = parseField(application.reference_full_name);
              const emails = parseField(application.reference_email);
              const contacts = parseField(application.reference_contact);
              const companies = parseField(application.reference_company);

              const maxLength = Math.max(names.length, emails.length, contacts.length, companies.length);
              const hasReferences = maxLength > 0 && (names.some(n => n) || emails.some(e => e) || contacts.some(c => c) || companies.some(co => co));

              if (!hasReferences) {
                return (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground mb-4">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Aucune référence</h3>
                      <p className="text-sm">Aucune référence de recommandation fournie.</p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {Array.from({ length: maxLength }, (_, i) => {
                    const hasData = names[i] || emails[i] || contacts[i] || companies[i];
                    if (!hasData) return null;
                    
                    return (
                      <div key={i} className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <div className="font-semibold text-sm text-primary flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Recommandation {i + 1}
                        </div>
                        <div className="text-xs sm:text-sm space-y-2 ml-6">
                          {names[i] && (
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium">Nom et prénom:</span> {cleanCorruptedText(names[i])}
                              </div>
                            </div>
                          )}
                          {companies[i] && (
                            <div className="flex items-start gap-2">
                              <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium">Administration / Entreprise / Organisation:</span> {cleanCorruptedText(companies[i])}
                              </div>
                            </div>
                          )}
                          {emails[i] && (
                            <div className="flex items-start gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium">Email:</span> {cleanCorruptedText(emails[i])}
                              </div>
                            </div>
                          )}
                          {contacts[i] && (
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium">Contact:</span> {cleanCorruptedText(contacts[i])}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            } catch (error) {
              console.error('Erreur reconstruction recommandations:', error);
              return (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-4">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Erreur</h3>
                    <p className="text-sm">Erreur lors du chargement des références.</p>
                  </div>
                </div>
              );
            }
          })()
        ) : (
          // Section Expérience Professionnelle pour les offres internes
          <div className="text-xs sm:text-sm space-y-3">
            <div>
              <p className="font-medium mb-2">Avez vous déjà eu, pour ce métier, l'une des expériences suivantes :</p>
              <ul className="space-y-1 ml-4 text-muted-foreground">
                <li>• Chef de service ;</li>
                <li>• Chef de département ;</li>
                <li>• Directeur ;</li>
                <li>• Senior/Expert avec au moins 5 ans d'expérience ?</li>
              </ul>
            </div>
            <div className="pt-2 border-t">
              <span className="font-medium">Réponse: </span>
              {application.has_been_manager === true ? (
                <span className="text-green-600 font-semibold">Oui</span>
              ) : application.has_been_manager === false ? (
                <span className="text-orange-600 font-semibold">Non</span>
              ) : (
                <span className="text-muted-foreground">Non renseigné</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DocumentsTab = ({ application }: { application: Application }) => {
  const { data: documents, isLoading, error } = useApplicationDocuments(application.id);
  const { toast } = useToast();

  const toUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('application-documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleDownloadAll = async () => {
    try {
      if (documents && documents.length > 0) {
        await downloadCandidateDocumentsAsZip(documents as any, `${application.users?.first_name}_${application.users?.last_name}_documents.zip`);
        toast({
          title: "Téléchargement réussi",
          description: "Tous les documents ont été téléchargés en ZIP",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger les documents",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Documents de Candidature
          </CardTitle>
          {documents && documents.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDownloadAll}>
              <Download className="w-4 h-4 mr-2" />
              Télécharger tout
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Erreur lors du chargement des documents</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 truncate" title={doc.file_name}>
                      {doc.file_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {getDocumentTypeLabel(doc.document_type)} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(toUrl(doc.file_name), '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                                          onClick={() => {
                        const link = document.createElement('a');
                        link.href = toUrl(doc.file_name);
                        link.download = doc.file_name;
                        link.click();
                      }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Aucun document disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EvaluationTab = ({ application }: { application: Application }) => {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Archive className="w-4 h-4 sm:w-5 sm:h-5" /> Évaluations et Commentaires
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Évaluations</h3>
            <p className="text-sm">
              Consultez les évaluations et commentaires des candidats.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProtocolsTab = ({ application }: { application: Application }) => {
  const [protocol1Data, setProtocol1Data] = useState<any>(null);
  const [protocol2Data, setProtocol2Data] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        // Récupérer les données du protocole 1
        const { data: protocol1 } = await supabase
          .from('protocol1_evaluations')
          .select('*')
          .eq('application_id', application.id)
          .single();

        // Récupérer les données du protocole 2
        const { data: protocol2 } = await supabase
          .from('protocol2_evaluations')
          .select('*')
          .eq('application_id', application.id)
          .single();

        setProtocol1Data(protocol1);
        setProtocol2Data(protocol2);
      } catch (error) {
        console.error('Erreur lors de la récupération des protocoles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProtocols();
  }, [application.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">En cours</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Protocole 1 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Protocole 1 - Évaluation Initiale
          </CardTitle>
        </CardHeader>
        <CardContent>
          {protocol1Data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Documents vérifiés</span>
                    {protocol1Data.documents_verified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Adhérence métier</span>
                    {protocol1Data.adherence_metier ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Adhérence talent</span>
                    {protocol1Data.adherence_talent ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Adhérence paradigme</span>
                    {protocol1Data.adherence_paradigme ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score global</span>
                    <Badge variant="outline">{protocol1Data.overall_score}/100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Statut</span>
                    {getStatusBadge(protocol1Data.completed ? 'completed' : 'in_progress')}
                  </div>
                </div>
              </div>
              
              {protocol1Data.metier_notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes métier</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {protocol1Data.metier_notes}
                  </p>
                </div>
              )}
              
              {protocol1Data.talent_notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes talent</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {protocol1Data.talent_notes}
                  </p>
                </div>
              )}
              
              {protocol1Data.paradigme_notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes paradigme</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {protocol1Data.paradigme_notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune évaluation du protocole 1 disponible</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Protocole 2 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Protocole 2 - Évaluation Approfondie
          </CardTitle>
        </CardHeader>
        <CardContent>
          {protocol2Data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Visite physique</span>
                    {protocol2Data.physical_visit ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Entretien terminé</span>
                    {protocol2Data.interview_completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">QCM rôle terminé</span>
                    {protocol2Data.qcm_role_completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">QCM codir terminé</span>
                    {protocol2Data.qcm_codir_completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fiche de poste créée</span>
                    {protocol2Data.job_sheet_created ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Écart de compétences évalué</span>
                    {protocol2Data.skills_gap_assessed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score global</span>
                    <Badge variant="outline">{protocol2Data.overall_score}/100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Statut</span>
                    {getStatusBadge(protocol2Data.completed ? 'completed' : 'in_progress')}
                  </div>
                </div>
              </div>
              
              {protocol2Data.qcm_role_score !== null && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Score QCM Rôle</h4>
                    <Badge variant="outline">{protocol2Data.qcm_role_score}/100</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Score QCM Codir</h4>
                    <Badge variant="outline">{protocol2Data.qcm_codir_score}/100</Badge>
                  </div>
                </div>
              )}
              
              {protocol2Data.interview_notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes d'entretien</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {protocol2Data.interview_notes}
                  </p>
                </div>
              )}
              
              {protocol2Data.visit_notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes de visite</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {protocol2Data.visit_notes}
                  </p>
                </div>
              )}
              
              {protocol2Data.skills_gap_notes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes sur l'écart de compétences</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {protocol2Data.skills_gap_notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune évaluation du protocole 2 disponible</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function ObserverCandidateAnalysis() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: application, isLoading, error } = useApplication(applicationId!);
  const [activeTab, setActiveTab] = useState("profile");

  // Rediriger si pas d'ID
  useEffect(() => {
    if (!applicationId) {
      navigate('/observer/candidates');
    }
  }, [applicationId, navigate]);

  if (isLoading) {
    return (
      <ObserverLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </ObserverLayout>
    );
  }

  if (error || !application) {
    return (
      <ObserverLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              {typeof error === 'string' ? error : "Candidature non trouvée"}
            </p>
            <Button variant="outline" onClick={() => navigate('/observer/candidates')}>
              Retour aux candidats
            </Button>
          </div>
        </div>
      </ObserverLayout>
    );
  }

  const user = application.users;
  const jobTitle = application.job_offers?.title || 'Poste non spécifié';

  return (
    <ObserverLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header avec navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/observer/candidates')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux candidats
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-muted-foreground">
                Candidature pour <span className="font-medium">{jobTitle}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={getBadgeVariant(application.status)} className="text-sm">
                {application.status === 'candidature' && 'Candidature'}
                {application.status === 'incubation' && 'En incubation'}
                {application.status === 'embauche' && 'Embauché'}
                {application.status === 'refuse' && 'Refusé'}
              </Badge>
              
              <Badge variant="secondary" className="text-sm">
                Mode Observateur
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations rapides */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>
              
              {user?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="text-sm font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date de candidature</p>
                  <p className="text-sm font-medium">
                    {format(new Date(application.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Poste candidaté</p>
                  <p className="text-sm font-medium">{jobTitle}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="references">Références</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="protocols">Protocoles</TabsTrigger>
            <TabsTrigger value="evaluation">Évaluations</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab application={application} />
          </TabsContent>

          <TabsContent value="references">
            <ReferencesTab application={application} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsTab application={application} />
          </TabsContent>

          <TabsContent value="protocols">
            <ProtocolsTab application={application} />
          </TabsContent>

          <TabsContent value="evaluation">
            <EvaluationTab application={application} />
          </TabsContent>
        </Tabs>


      </div>
    </ObserverLayout>
  );
}
