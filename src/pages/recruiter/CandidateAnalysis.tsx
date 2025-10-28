/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useApplication, useRecruiterApplications, Application } from "@/hooks/useApplications";
import { useApplicationDocuments, getDocumentTypeLabel, formatFileSize } from "@/hooks/useDocuments";
import { getMetierQuestionsForTitle, getMTPQuestionsFromJobOffer } from "@/data/metierQuestions";
import { cleanCorruptedText } from "@/utils/textCleaner";
import { supabase } from "@/integrations/supabase/client";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Briefcase, Info, FileText, Eye, Download, Users, X, Archive, AlertCircle } from "lucide-react";
import { EvaluationDashboard } from "@/components/evaluation/EvaluationDashboard";
import { Protocol2Dashboard } from "@/components/evaluation/Protocol2Dashboard";
import { SynthesisDashboard } from "@/components/evaluation/SynthesisDashboard";
import { useSynthesisData } from "@/hooks/useSynthesisData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Link as RouterLink } from "react-router-dom";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PreviousApplicationAlert } from "@/components/recruiter/PreviousApplicationAlert";

// Fonction helper pour formater les dates de manière sécurisée
const formatDate = (dateValue: any, formatString: string = 'PPP'): string => {
  if (!dateValue) return 'Non définie';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    return format(date, formatString, { locale: fr });
  } catch (error) {
    console.warn('Erreur de formatage de date:', error);
    return 'Date invalide';
  }
};
import { downloadCandidateDocumentsAsZip } from "../../utils/downloadUtils";
import { ErrorFallback } from "@/components/ui/ErrorFallback";

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
    
    // Récupérer le statut du candidat
    const candidateStatus = (user as any)?.candidate_status;
    console.log('🔍 [ProfileTab] Statut du candidat:', { candidateStatus, user });
    const statusLabel = candidateStatus === 'interne' ? 'Interne' : candidateStatus === 'externe' ? 'Externe' : 'Non défini';
    const statusColor = candidateStatus === 'interne' ? 'bg-blue-100 text-blue-700' : candidateStatus === 'externe' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
    
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5" /> 
            Informations Personnelles
            {candidateStatus && (
              <Badge className={`${statusColor} ml-2 text-xs`}>
                {statusLabel}
              </Badge>
            )}
          </CardTitle>
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
            <InfoRow icon={Calendar} label="Date de naissance" value={formatDate(profile?.birth_date)} />
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
  // Déterminer le type d'offre
  const offerStatus = application.job_offers?.status_offerts;
  const isExternalOffer = offerStatus === 'externe';
  const isInternalOffer = offerStatus === 'interne';
  
  // Déterminer le titre et l'icône selon le type d'offre
  const getTitleAndIcon = () => {
    if (isExternalOffer) {
      return {
        title: "Références de Recommandation",
        shortTitle: "Références",
        icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />
      };
    } else if (isInternalOffer) {
      return {
        title: "Expérience Professionnelle",
        shortTitle: "Expérience",
        icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
      };
    } else {
      return {
        title: "Informations Complémentaires",
        shortTitle: "Informations",
        icon: <Info className="w-4 h-4 sm:w-5 sm:h-5" />
      };
    }
  };
  
  const { title, shortTitle, icon } = getTitleAndIcon();
  
  return (
    <Card>
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          {icon}
          <span className="hidden sm:inline">{title}</span>
          <span className="sm:hidden">{shortTitle}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pt-2 sm:pt-3 pb-4 sm:pb-6">
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
                return <p className="text-xs sm:text-sm text-muted-foreground">Aucune référence fournie.</p>;
              }

              return (
                <div className="space-y-4">
                  {Array.from({ length: maxLength }, (_, i) => {
                    const hasData = names[i] || emails[i] || contacts[i] || companies[i];
                    if (!hasData) return null;
                    
                    return (
                      <div key={i} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="font-semibold text-sm text-primary">Recommandation {i + 1}</div>
                        <div className="text-xs sm:text-sm space-y-1">
                          {names[i] && (<div><span className="font-medium">Nom et prénom:</span> {cleanCorruptedText(names[i])}</div>)}
                          {companies[i] && (<div><span className="font-medium">Administration / Entreprise / Organisation:</span> {cleanCorruptedText(companies[i])}</div>)}
                          {emails[i] && (<div><span className="font-medium">Email:</span> {cleanCorruptedText(emails[i])}</div>)}
                          {contacts[i] && (<div><span className="font-medium">Contact:</span> {cleanCorruptedText(contacts[i])}</div>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            } catch (error) {
              console.error('Erreur reconstruction recommandations:', error);
              return <p className="text-xs sm:text-sm text-muted-foreground">Erreur lors du chargement des références.</p>;
            }
          })()
        ) : isInternalOffer ? (
          // Section Expérience Professionnelle pour les offres internes
          <div className="text-xs sm:text-sm space-y-3">
            <div>
              <p className="font-medium mb-2">Avez vous déjà eu, pour ce métier, l'une des expériences suivantes :</p>
              <ul className="space-y-1 ml-4 text-muted-foreground">
                <li>• Chef de service ;</li>
                <li>• Chef de division ou équivalent ;</li>
                <li>• Directeur ;</li>
                <li>• Senior/Expert avec au moins 5 ans d'expérience ?</li>
              </ul>
            </div>
            <div className="pt-2 border-t">
              <span className="font-medium">Réponse: </span>
              {application.has_been_manager === true ? (
                <span className="text-green-600 font-medium">Oui</span>
              ) : application.has_been_manager === false ? (
                <span className="text-red-600 font-medium">Non</span>
              ) : (
                <span className="text-muted-foreground">Non renseigné</span>
              )}
            </div>
          </div>
        ) : (
          // Fallback pour les offres sans statut défini
          <p className="text-xs sm:text-sm text-muted-foreground">Statut d'offre non défini.</p>
        )}
      </CardContent>
    </Card>
  );
};

const MtpAnswersDisplay = ({ mtpAnswers, jobTitle, jobOffer }) => {
  // Récupérer les questions MTP spécifiques pour ce poste depuis l'offre ou fallback
  const questions = jobOffer ? getMTPQuestionsFromJobOffer(jobOffer) : getMetierQuestionsForTitle(jobTitle);

  if (!mtpAnswers) return <p className="text-xs sm:text-sm">Aucune réponse au questionnaire MTP.</p>;

  // Si mtp_answers est une string JSON, la parser
  let parsedAnswers = mtpAnswers;
  if (typeof mtpAnswers === 'string') {
    try {
      parsedAnswers = JSON.parse(mtpAnswers);
    } catch (error) {
      console.error('❌ [MtpAnswersDisplay] Erreur de parsing JSON:', error);
      return <p className="text-xs sm:text-sm text-red-500">Erreur de format des réponses MTP.</p>;
    }
  }

  // Utiliser parsedAnswers au lieu de mtpAnswers
  mtpAnswers = parsedAnswers;

  const renderSection = (title, section, color, answers, badgeColor) => {
    const validAnswers = (answers || []).filter(answer => answer && answer.trim() !== '');
    const sectionQuestions = questions[section] || [];
    
    // Limiter l'affichage au nombre de questions de l'offre
    const maxQuestions = sectionQuestions.length;
    const answersToShow = validAnswers.slice(0, maxQuestions);

    return (
      <div className="mb-6">
        <h4 className="font-semibold text-sm sm:text-base mb-3">{title} ({answersToShow.length}/{sectionQuestions.length} réponses)</h4>
        {answersToShow.length > 0 ? (
          <div className="space-y-3">
            {answersToShow.map((answer, index) => (
              <div key={index} className={`border-l-2 ${color} pl-3`}>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  <span className="inline-flex items-center gap-2">
                    <span className={`${badgeColor} px-2 py-1 rounded-full text-xs font-semibold min-w-[24px] text-center`}>
                      {index + 1}
                    </span>
                    {sectionQuestions[index] || `Question ${index + 1}`}
                  </span>
                </p>
                <div className="text-xs sm:text-sm text-foreground whitespace-pre-wrap break-words">
                  {cleanCorruptedText(answer)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">Aucune réponse aux questions {title.toLowerCase()}.</p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">
          <span className="hidden sm:inline">Réponses au Questionnaire MTP</span>
          <span className="sm:hidden">Questionnaire MTP</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {renderSection('Questions Métier', 'metier', 'border-blue-500', mtpAnswers.metier, 'bg-blue-100 text-blue-800')}
        {renderSection('Questions Talent', 'talent', 'border-green-500', mtpAnswers.talent, 'bg-green-100 text-green-800')}
        {renderSection('Questions Paradigme', 'paradigme', 'border-purple-500', mtpAnswers.paradigme, 'bg-purple-100 text-purple-800')}
      </CardContent>
    </Card>
  );
};

const DocumentPreviewModal = ({ fileUrl, fileName, isOpen, onClose }: { fileUrl: string, fileName: string, isOpen: boolean, onClose: () => void }) => {
  const getFileType = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop() || '';

    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return 'image';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    if (['txt', 'rtf'].includes(ext)) return 'text';
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
    return 'other';
  };

  const fileType = getFileType(fileName);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsLoading(true);
      // Nettoyer l'URL Blob quand le modal se ferme
      if (fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    } else if (fileUrl) {
      // Pas de vérification HEAD car elle échoue avec les permissions RLS
      // La modale gère les erreurs de chargement directement
      setIsLoading(false);
    }
  }, [isOpen, fileUrl, fileName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] sm:h-[80vh] w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-sm sm:text-base">
            <span className="truncate">Prévisualisation - {fileName}</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Prévisualisation du document {fileName}. Utilisez les contrôles pour naviguer dans le contenu.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 sm:space-y-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs sm:text-sm text-muted-foreground">Chargement du document...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-3 sm:space-y-4 p-3 sm:p-6">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-red-300" />
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm font-medium">Document inaccessible</p>
                <p className="text-xs text-muted-foreground max-w-md">{error}</p>
                <div className="pt-3 sm:pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(fileUrl, '_blank')}
                    className="mr-2 text-xs sm:text-sm"
                  >
                    Essayer dans un nouvel onglet
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose} className="text-xs sm:text-sm">
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          ) : fileType === 'pdf' ? (
            <embed
              src={fileUrl}
              type="application/pdf"
              className="w-full h-full"
              title={`Prévisualisation de ${fileName}`}
              onError={() => setError("Le fichier PDF n'existe pas ou a été supprimé du storage.")}
            />
          ) : fileType === 'image' ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="w-full h-full object-contain"
              onError={() => setError("Le fichier image n'existe pas ou a été supprimé du storage.")}
            />
          ) : fileType === 'word' || fileType === 'excel' || fileType === 'powerpoint' ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
              className="w-full h-full border-0"
              title={`Prévisualisation de ${fileName}`}
              onError={() => {
                // Fallback vers Google Docs Viewer si Office Online échoue
                const iframe = document.querySelector('iframe[title*="Prévisualisation"]') as HTMLIFrameElement;
                if (iframe) {
                  iframe.src = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
                }
              }}
            />
          ) : fileType === 'text' ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0 bg-white"
              title={`Prévisualisation de ${fileName}`}
              onError={() => setError("Impossible de charger le fichier texte.")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-3 sm:space-y-4 p-3 sm:p-6">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Prévisualisation non disponible</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Le type de fichier "{fileName.split('.').pop()?.toUpperCase()}" ne peut pas être prévisualisé directement.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(fileUrl, '_blank')}
                      className="text-xs sm:text-sm"
                    >
                      Ouvrir dans un nouvel onglet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = fileName;
                        link.click();
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DocumentsTab = ({ documents, isLoading, error, getFileUrl, downloadFile, toast, candidateName, isObserver = false }: { documents: any[], isLoading: boolean, error: Error | null, getFileUrl: (path: string) => Promise<string>, downloadFile: (path: string, name: string) => void, toast: any, candidateName?: string, isObserver?: boolean }) => {
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean, fileUrl: string, fileName: string }>({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Fonction pour télécharger tous les documents en ZIP
  const handleDownloadAllDocuments = async () => {
    if (!documents || documents.length === 0) {
      toast({
        title: "Aucun document",
        description: "Ce candidat n'a fourni aucun document à télécharger.",
        variant: "destructive"
      });
      return;
    }

    if (!candidateName) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer le nom du candidat.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloadingZip(true);

    try {
      await downloadCandidateDocumentsAsZip(documents, candidateName);

      toast({
        title: "Téléchargement réussi",
        description: `Le dossier de candidature de ${candidateName} a été téléchargé avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement ZIP:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur s'est produite lors de la création du fichier ZIP.",
        variant: "destructive"
      });
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg"><FileText className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> Documents</CardTitle>
            {!isObserver && documents && documents.length > 0 && (
              <Button
                onClick={handleDownloadAllDocuments}
                disabled={isDownloadingZip}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                {isDownloadingZip ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary mr-1 sm:mr-2" />
                ) : (
                  <Archive className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                )}
                {isDownloadingZip ? 'Création...' : 'Télécharger tout (ZIP)'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-6">
          {isLoading ? (
            <p className="text-xs sm:text-sm">Chargement des documents...</p>
          ) : error ? (
            <div className="text-red-500 text-xs sm:text-sm">
              <p>Erreur de chargement des documents:</p>
              <p className="text-xs mt-1">{error.message}</p>
              <p className="text-xs mt-1">Vérifiez la console pour plus de détails.</p>
            </div>
          ) : documents && documents.length > 0 ? (
            <div>
              <p className="text-xs text-muted-foreground mb-2 sm:mb-3">{documents.length} document(s) trouvé(s)</p>
              {documents.map((doc) => {
                return (
                  <div key={doc.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0 flex-1">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-muted-foreground flex-shrink-0" />
                      <div className="overflow-hidden min-w-0 flex-1">
                        <p className="font-medium truncate text-xs sm:text-sm">{getDocumentTypeLabel(doc.document_type)}</p>
                        <p className="text-xs text-muted-foreground truncate">{doc.file_name} ({formatFileSize(doc.file_size)})</p>
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={async () => {
                        try {
                          // Utiliser directement getPublicUrl au lieu de passer par getFileUrl
                          const { data } = supabase.storage
                            .from('application-documents')
                            .getPublicUrl(doc.file_url);

                          setPreviewModal({ isOpen: true, fileUrl: data.publicUrl, fileName: doc.file_name });
                        } catch (error) {
                          console.error('Error getting preview URL:', error);
                          toast({
                            variant: "destructive",
                            title: "Erreur de prévisualisation",
                            description: "Impossible de récupérer l'URL du fichier pour la prévisualisation.",
                          });
                        }
                      }} className="p-1 sm:p-2 h-8 w-8 sm:h-9 sm:w-9">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      {!isObserver && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => downloadFile(doc.file_url, doc.file_name)} 
                          className="p-1 sm:p-2 h-8 w-8 sm:h-9 sm:w-9"
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-xs sm:text-sm text-muted-foreground py-3 sm:py-4">
              <p>Aucun document trouvé.</p>
              <p className="text-xs mt-2">Les documents peuvent ne pas être visibles en raison de permissions ou d'un problème de récupération.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentPreviewModal
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
      />
    </>
  );
};

const EvaluationProtocol = ({ candidateName, jobTitle, applicationId, onStatusChange, isReadOnly = false, protocol = 1 }: { candidateName: string, jobTitle: string, applicationId: string, onStatusChange: (status: 'incubation' | 'embauche' | 'refuse') => void, isReadOnly?: boolean, protocol?: number }) => {
  if (protocol === 2) {
    return (
      <Protocol2Dashboard
        candidateName={candidateName}
        jobTitle={jobTitle}
        applicationId={applicationId}
        onStatusChange={onStatusChange}
        isReadOnly={isReadOnly}
      />
    );
  }
  
  return (
    <EvaluationDashboard
      candidateName={candidateName}
      jobTitle={jobTitle}
      applicationId={applicationId}
      onStatusChange={onStatusChange}
      isReadOnly={isReadOnly}
    />
  );
};

export default function CandidateAnalysis() {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isRecruiter, isObserver } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  
  const { data: application, isLoading, error, refetch: refetchApplication } = useApplication(id);
  
  // Utiliser le hook useSynthesisData pour récupérer les vraies données
  const { synthesisData, isLoading: synthesisLoading, updateRecommendations, saveSynthesisFields } = useSynthesisData(application?.id || '');
  const { data: documents, isLoading: documentsLoading, error: documentsError } = useApplicationDocuments(id);

  const jobId = searchParams.get('jobId') || application?.job_offer_id;
  const jobTitle = application?.job_offers?.title;

  const getFileUrl = async (filePath: string): Promise<string> => {
    if (!filePath) {
      throw new Error('File path is invalid.');
    }

    // Si le chemin est déjà une URL complète, la retourner directement.
    if (filePath.startsWith('http')) {
      return filePath;
    }

    // Pour les buckets publics, on utilise getPublicUrl.
    const { data } = supabase.storage
      .from('application-documents')
      .getPublicUrl(filePath);

    if (!data.publicUrl) {
      console.error(`Error getting public URL for path: ${filePath}`);
      throw new Error('Impossible de générer le lien public du document.');
    }

    return data.publicUrl;
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    if (isObserver) {
      toast({
        variant: 'default',
        title: 'Accès restreint',
        description: 'Les observateurs ne peuvent pas télécharger de documents.'
      });
      return;
    }

    try {
      const finalUrl = await getFileUrl(fileUrl);
      window.open(finalUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de téléchargement',
        description: 'Impossible de récupérer l\'URL du fichier.'
      });
    }
  };

  const handleStatusChange = async (newStatus: Application['status']) => {
    if (!application || isObserver) return;
    console.log('🔄 [CandidateAnalysis] handleStatusChange appelé avec:', { applicationId: application.id, newStatus });
    
    try {
      // Utiliser une requête directe au lieu de la mutation problématique
      console.log('📤 [CandidateAnalysis] Mise à jour directe du statut...');
      const { data: updateData, error: statusError } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id)
        .select('id, status');

      console.log('📊 [CandidateAnalysis] Résultat de la mise à jour:', { updateData, statusError });

      if (statusError) {
        console.error('❌ [CandidateAnalysis] Erreur lors de la mise à jour:', statusError);
        throw new Error(`Erreur lors de la mise à jour: ${statusError.message}`);
      }

      if (!updateData || updateData.length === 0) {
        console.error('❌ [CandidateAnalysis] Aucune donnée retournée');
        throw new Error('Aucune candidature trouvée pour la mise à jour');
      }

      console.log('✅ [CandidateAnalysis] Statut mis à jour avec succès:', updateData[0]);

      // Envoyer l'email de rejet si le candidat est refusé
      if (newStatus === 'refuse') {
        try {
          console.log('📧 [REJECTION] Envoi email de rejet...');
          
          const candidateFullName = `${application.users?.first_name || ''} ${application.users?.last_name || ''}`.trim();
          const candidateEmail = application.users?.email;
          const jobTitle = application.job_offers?.title || 'Poste non spécifié';
          
          if (candidateFullName && candidateEmail && jobTitle) {
            const resp = await fetch('/api/send-rejection-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: 'support@seeg-talentsource.com',
                candidateFullName,
                candidateEmail,
                jobTitle,
                applicationId: application.id,
              })
            });
            
            const json = await (async () => { 
              try { return await resp.json(); } catch { return undefined; } 
            })();
            
            if (!resp.ok) {
              console.error('📧 [REJECTION] Échec envoi email:', resp.status, json);
              toast({
                title: "Email non envoyé",
                description: "L'email de rejet n'a pas pu être envoyé",
                variant: "destructive"
              });
            } else {
              console.log('📧 [REJECTION] Email de rejet envoyé avec succès:', json);
              toast({
                title: "Email envoyé",
                description: "L'email de rejet a été envoyé au candidat",
              });
            }
          }
        } catch (emailError) {
          console.error('❌ Erreur lors de l\'envoi de l\'email de rejet:', emailError);
          // Non bloquant
        }
      }

      // Recharger les données de l'application pour refléter le nouveau statut
      console.log('🔄 [CandidateAnalysis] Rechargement des données...');
      await refetchApplication();
      console.log('✅ [CandidateAnalysis] Données rechargées');

      toast({
        title: "Statut mis à jour",
        description: `Le statut du candidat a été changé vers "${newStatus}".`,
      });

      // Navigation automatique vers Protocole 2 quand on clique "Incuber"
      if (newStatus === 'incubation') {
        setActiveTab('protocol2');
      } else if (newStatus === 'embauche' || newStatus === 'refuse') {
        // Pour les décisions finales, rediriger vers le pipeline
        if (jobId) {
          navigate(`/recruiter/jobs/${jobId}/pipeline`);
        } else {
          navigate(-1);
        }
      }
    } catch (e) {
      console.error("❌ [CandidateAnalysis] Erreur lors du changement de statut", e);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du changement de statut du candidat.",
      });
    }
  };

  if (isLoading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Chargement du profil candidat...</span>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  if (error || !application) {
    return (
      <ErrorFallback
        error={error}
        resetError={() => {
          refetchApplication();
        }}
        type="generic"
      />
    );
  }

  const candidateName = `${application.users?.first_name || ''} ${application.users?.last_name || ''}`.trim();

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-3 sm:mb-4 lg:mb-6">
          <RouterLink to={jobId ? `/recruiter/jobs/${jobId}/pipeline` : "#"} onClick={(e) => { if (!jobId) { e.preventDefault(); navigate(-1); } }}>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Retour au pipeline
            </Button>
          </RouterLink>
        </div>

        <header className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground leading-tight">{candidateName}</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">Candidature pour le poste de {application.job_offers?.title}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Candidature reçue le {formatDate(application.created_at)}</p>
          <div className="flex items-center mt-2">
            <p className="text-xs sm:text-sm text-muted-foreground mr-2">Statut:</p>
            <Badge variant={getBadgeVariant(application.status)} className="text-xs sm:text-sm">{application.status}</Badge>
          </div>
        </header>

        {/* Alerte si candidat a déjà postulé */}
        {application?.candidate_id && (
          <div className="mb-4">
            <PreviousApplicationAlert 
              candidateId={application.candidate_id} 
              currentApplicationId={application.id}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm h-10 sm:h-11">
            <TabsTrigger value="info" className="px-1 sm:px-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Informations Candidat</span>
              <span className="sm:hidden">Informations</span>
            </TabsTrigger>
            <TabsTrigger value="protocol1" className="px-1 sm:px-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Protocole 1</span>
              <span className="sm:hidden">Protocole 1</span>
            </TabsTrigger>
            <TabsTrigger value="protocol2" className="px-1 sm:px-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Protocole 2</span>
              <span className="sm:hidden">Protocole 2</span>
            </TabsTrigger>
            <TabsTrigger value="synthesis" className="px-1 sm:px-2 text-xs sm:text-sm">Synthèse</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-3 sm:mt-4 lg:mt-6">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <ProfileTab application={application} />
              <DocumentsTab 
                documents={documents} 
                isLoading={documentsLoading} 
                error={documentsError} 
                getFileUrl={getFileUrl} 
                downloadFile={downloadFile} 
                toast={toast} 
                candidateName={candidateName} 
                isObserver={isObserver}
              />
              <ReferencesTab application={application} />
              <MtpAnswersDisplay mtpAnswers={application.mtp_answers} jobTitle={jobTitle} jobOffer={application.job_offers} />
            </div>
          </TabsContent>
          <TabsContent value="protocol1" className="mt-3 sm:mt-4 lg:mt-6">
            <div className="relative">
              {isObserver && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs sm:text-sm text-yellow-800 font-medium">Mode consultation seule</p>
                  <p className="text-xs text-yellow-700">Vous pouvez consulter cette évaluation mais pas la modifier</p>
                </div>
              )}
              <EvaluationProtocol
                candidateName={candidateName}
                jobTitle={jobTitle || 'Poste non spécifié'}
                applicationId={application.id}
                onStatusChange={isObserver ? undefined : handleStatusChange}
                isReadOnly={isObserver}
              />
            </div>
          </TabsContent>
          <TabsContent value="protocol2" className="mt-3 sm:mt-4 lg:mt-6">
            {application.status !== 'incubation' && application.status !== 'embauche' && !isObserver && (
              <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  <div>
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-yellow-800">Protocole 2 en lecture seule</p>
                    <p className="text-xs sm:text-sm text-yellow-700">
                      Le candidat doit d'abord être incubé dans le Protocole 1 
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="relative">
              {isObserver && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs sm:text-sm text-yellow-800 font-medium">Mode consultation seule</p>
                  <p className="text-xs text-yellow-700">Vous pouvez consulter cette évaluation mais pas la modifier</p>
                </div>
              )}
              <EvaluationProtocol
                candidateName={candidateName}
                jobTitle={jobTitle || 'Poste non spécifié'}
                applicationId={application.id}
                onStatusChange={isObserver ? undefined : handleStatusChange}
                isReadOnly={isObserver || (application.status !== 'incubation' && application.status !== 'embauche')}
                protocol={2}
              />
            </div>
          </TabsContent>
          <TabsContent value="synthesis" className="mt-3 sm:mt-4 lg:mt-6">
            {synthesisLoading ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-lg">Chargement des données de synthèse...</span>
                </div>
              </div>
            ) : (
              <SynthesisDashboard
                candidateName={candidateName}
                jobTitle={jobTitle || 'Poste non spécifié'}
                applicationId={application.id}
                isReadOnly={isObserver}
                synthesisData={synthesisData}
                onUpdate={(updates) => {
                  if (updates.pointsForts !== undefined || updates.pointsAmelioration !== undefined) {
                    updateRecommendations(
                      updates.pointsForts || synthesisData.pointsForts,
                      updates.pointsAmelioration || synthesisData.pointsAmelioration
                    );
                  }
                }}
                saveSynthesisFields={saveSynthesisFields}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
}