/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useApplication, useRecruiterApplications, Application } from "@/hooks/useApplications";
import { useApplicationDocuments, getDocumentTypeLabel, formatFileSize } from "@/hooks/useDocuments";
import { getMetierQuestionsForTitle } from "@/data/metierQuestions";
import { supabase } from "@/integrations/supabase/client";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Briefcase, Info, FileText, Eye, Download, Users, X, Archive } from "lucide-react";
import { EvaluationDashboard } from "@/components/evaluation/EvaluationDashboard";
import { Protocol2Dashboard } from "@/components/evaluation/Protocol2Dashboard";
import { SynthesisDashboard } from "@/components/evaluation/SynthesisDashboard";
import { useSynthesisData } from "@/hooks/useSynthesisData";
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
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Users className="w-4 h-4 sm:w-5 sm:h-5" /> Références de Recommandation</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {application.reference_contacts || application.ref_contacts ? (
          <div className="whitespace-pre-wrap text-xs sm:text-sm">
            {application.reference_contacts || application.ref_contacts}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">Aucune référence fournie.</p>
        )}
      </CardContent>
    </Card>
  );
};

const MtpAnswersDisplay = ({ mtpAnswers, jobTitle }) => {
  // Récupérer les questions MTP spécifiques pour ce poste
  const questions = getMetierQuestionsForTitle(jobTitle);

  if (!mtpAnswers) return <p className="text-xs sm:text-sm">Aucune réponse au questionnaire MTP.</p>;

  const renderSection = (title, section, color, answers, badgeColor) => {
    const validAnswers = (answers || []).filter(answer => answer && answer.trim() !== '');
    const sectionQuestions = questions[section] || [];

    return (
      <div className="mb-6">
        <h4 className="font-semibold text-sm sm:text-base mb-3">{title} ({validAnswers.length}/{sectionQuestions.length} réponses)</h4>
        {validAnswers.length > 0 ? (
          <div className="space-y-3">
            {validAnswers.map((answer, index) => (
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
                  {answer}
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
        <CardTitle className="text-base sm:text-lg">Réponses au Questionnaire MTP</CardTitle>
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
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Prévisualisation - {fileName}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Prévisualisation du document {fileName}. Utilisez les contrôles pour naviguer dans le contenu.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground">Chargement du document...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-4 p-6">
              <FileText className="w-16 h-16 text-red-300" />
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Document inaccessible</p>
                <p className="text-xs text-muted-foreground max-w-md">{error}</p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(fileUrl, '_blank')}
                    className="mr-2"
                  >
                    Essayer dans un nouvel onglet
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
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
              <div className="text-center space-y-4">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-medium">Prévisualisation non disponible</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Le type de fichier "{fileName.split('.').pop()?.toUpperCase()}" ne peut pas être prévisualisé directement.
                  </p>
                  <div className="flex gap-2 mt-4 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(fileUrl, '_blank')}
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
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Documents</CardTitle>
            {!isObserver && documents && documents.length > 0 && (
              <Button
                onClick={handleDownloadAllDocuments}
                disabled={isDownloadingZip}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
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
        <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
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
              <p className="text-xs text-muted-foreground mb-3">{documents.length} document(s) trouvé(s)</p>
              {documents.map((doc) => {
                return (
                  <div key={doc.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                      <div className="overflow-hidden min-w-0">
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
                      }} className="p-1 sm:p-2">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      {!isObserver && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => downloadFile(doc.file_url, doc.file_name)} 
                          className="p-1 sm:p-2"
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
            <div className="text-center text-xs sm:text-sm text-muted-foreground py-4">
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

const EvaluationProtocol = ({ candidateName, jobTitle, applicationId, onStatusChange }: { candidateName: string, jobTitle: string, applicationId: string, onStatusChange: (status: 'incubation' | 'embauche' | 'refuse') => void }) => {
  return (
    <EvaluationDashboard
      candidateName={candidateName}
      jobTitle={jobTitle}
      applicationId={applicationId}
      onStatusChange={onStatusChange}
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
  
  const { data: application, isLoading, error } = useApplication(id);
  
  // Utiliser le hook useSynthesisData pour récupérer les vraies données
  const { synthesisData, isLoading: synthesisLoading, updateRecommendations, refreshData } = useSynthesisData(application?.id || '');
  const { data: documents, isLoading: documentsLoading, error: documentsError } = useApplicationDocuments(id);
  const { updateApplicationStatus } = useRecruiterApplications(application?.job_offer_id);

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
    try {
      await updateApplicationStatus({ applicationId: application.id, status: newStatus });

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
      console.error("Erreur lors du changement de statut", e);
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
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-600 mb-4">Erreur: Impossible de charger les données du candidat.</p>
          <Button onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </RecruiterLayout>
    );
  }

  const candidateName = `${application.users?.first_name || ''} ${application.users?.last_name || ''}`.trim();

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <RouterLink to={jobId ? `/recruiter/jobs/${jobId}/pipeline` : "#"} onClick={(e) => { if (!jobId) { e.preventDefault(); navigate(-1); } }}>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Retour au pipeline
            </Button>
          </RouterLink>
        </div>

        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">{candidateName}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Candidature pour le poste de {application.job_offers?.title}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Candidature reçue le {format(new Date(application.created_at), 'PPP', { locale: fr })}</p>
          <div className="flex items-center mt-2">
            <p className="text-xs sm:text-sm text-muted-foreground mr-2">Statut:</p>
            <Badge variant={getBadgeVariant(application.status)}>{application.status}</Badge>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm">
            <TabsTrigger value="info" className="px-1 sm:px-2">Informations Candidat</TabsTrigger>
            <TabsTrigger value="protocol1" className="px-1 sm:px-2">Protocole 1</TabsTrigger>
            <TabsTrigger value="protocol2" className="px-1 sm:px-2">Protocole 2</TabsTrigger>
            <TabsTrigger value="synthesis" className="px-1 sm:px-2">Synthèse</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
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
              <MtpAnswersDisplay mtpAnswers={application.mtp_answers} jobTitle={jobTitle} />
            </div>
          </TabsContent>
          <TabsContent value="protocol1" className="mt-4 sm:mt-6">
            <div className={isObserver ? 'opacity-70 relative' : ''}>
              {isObserver && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                  <div className="bg-background p-4 rounded-lg border border-border shadow-lg text-center">
                    <p className="font-medium">Mode consultation seule</p>
                    <p className="text-sm text-muted-foreground mt-1">Les observateurs ne peuvent pas modifier les évaluations</p>
                  </div>
                </div>
              )}
              <EvaluationProtocol
                candidateName={candidateName}
                jobTitle={jobTitle || 'Poste non spécifié'}
                applicationId={application.id}
                onStatusChange={isObserver ? () => { } : handleStatusChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="protocol2" className="mt-4 sm:mt-6">
            <div className={isObserver ? 'opacity-70 relative' : ''}>
              {isObserver && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                  <div className="bg-background p-4 rounded-lg border border-border shadow-lg text-center">
                    <p className="font-medium">Mode consultation seule</p>
                    <p className="text-sm text-muted-foreground mt-1">Les observateurs ne peuvent pas modifier les évaluations</p>
                  </div>
                </div>
              )}
              <Protocol2Dashboard
                candidateName={candidateName}
                jobTitle={jobTitle || 'Poste non spécifié'}
                applicationId={application.id}
                onStatusChange={isObserver ? () => { } : handleStatusChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="synthesis" className="mt-4 sm:mt-6">
            {synthesisLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg">Chargement des données de synthèse...</span>
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
                onRefresh={refreshData}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
}