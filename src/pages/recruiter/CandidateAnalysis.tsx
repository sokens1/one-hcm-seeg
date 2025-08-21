/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useApplication, useRecruiterApplications, Application } from "@/hooks/useApplications";
import { useApplicationDocuments, getDocumentTypeLabel, formatFileSize } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap, Star, Info, Linkedin, Link as LinkIcon, FileText, Eye, Download, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link as RouterLink } from "react-router-dom";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const InfoRow = ({ icon: Icon, label, value, isLink = false }: { icon: any, label: string, value?: string | null, isLink?: boolean }) => {
  if (!value) return null;
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
  
  // Récupérer le profil candidat séparément
  const [candidateProfile, setCandidateProfile] = useState(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!application?.candidate_id) return;
      
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', application.candidate_id)
        .maybeSingle();
        
      if (!error && data) {
        setCandidateProfile(data);
      }
    };
    
    fetchProfile();
  }, [application?.candidate_id]);
  
  const profile = candidateProfile;
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><User className="w-4 h-4 sm:w-5 sm:h-5"/> Informations Personnelles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <InfoRow icon={User} label="Prénom" value={user?.first_name} />
        <InfoRow icon={User} label="Nom" value={user?.last_name} />
        <InfoRow icon={Mail} label="Email" value={user?.email} />
        <InfoRow icon={Phone} label="Téléphone" value={user?.phone as string | undefined} />
        <InfoRow icon={Calendar} label="Date de naissance" value={user?.date_of_birth ? format(new Date(user.date_of_birth), 'PPP', { locale: fr }) : undefined} />
        <InfoRow icon={Info} label="Sexe" value={profile?.gender} />
        <InfoRow icon={Briefcase} label="Poste actuel" value={profile?.current_position} />
      </CardContent>
    </Card>
  );
};

const ReferencesTab = ({ application }: { application: Application }) => {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Users className="w-4 h-4 sm:w-5 sm:h-5"/> Références de Recommandation</CardTitle>
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

const MtpAnswersDisplay = ({ mtpAnswers }) => {
  if (!mtpAnswers) return <p className="text-xs sm:text-sm">Aucune réponse au questionnaire MTP.</p>;

  const renderAnswers = (title, answers) => (
    <div>
      <h4 className="font-semibold text-sm sm:text-base mb-2">{title}</h4>
      {answers && answers.length > 0 ? (
        <ul className="list-disc list-inside pl-3 sm:pl-4 text-xs sm:text-sm text-muted-foreground">
          {answers.map((answer, index) => <li key={index}>{answer}</li>)}
        </ul>
      ) : <p className="text-xs sm:text-sm text-muted-foreground">Aucune réponse.</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Réponses au Questionnaire MTP</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        {renderAnswers("Métier", mtpAnswers.metier)}
        {renderAnswers("Talent", mtpAnswers.talent)}
        {renderAnswers("Paradigme", mtpAnswers.paradigme)}
      </CardContent>
    </Card>
  );
};

// Restored Evaluation Protocol as requested
const EvaluationProtocol = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Protocole d'évaluation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Le module d'évaluation est en cours de développement.</p>
        {/* The original structure will be restored here once defined */}
      </CardContent>
    </Card>
  );
};

const DocumentPreviewModal = ({ fileUrl, fileName, isOpen, onClose }: { fileUrl: string, fileName: string, isOpen: boolean, onClose: () => void }) => {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  
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
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {isPdf ? (
            <embed
              src={fileUrl}
              type="application/pdf"
              className="w-full h-full"
              title={`Prévisualisation de ${fileName}`}
            />
          ) : isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="w-full h-full object-contain"
            />
          ) : (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              className="w-full h-full border-0"
              title={`Prévisualisation de ${fileName}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DocumentsTab = ({ documents, documentsLoading, getFileUrl, downloadFile }: { documents: any[], documentsLoading: boolean, getFileUrl: (path: string) => string, downloadFile: (path: string, name: string) => void }) => {
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean, fileUrl: string, fileName: string }>({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  const handlePreview = (filePath: string, fileName: string) => {
    const fileUrl = getFileUrl(filePath);
    setPreviewModal({ isOpen: true, fileUrl, fileName });
  };

  return (
    <>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><FileText className="w-4 h-4 sm:w-5 sm:h-5"/> Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
          {documentsLoading ? (
            <p className="text-xs sm:text-sm">Chargement...</p>
          ) : documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  <div className="overflow-hidden min-w-0">
                    <p className="font-medium truncate text-xs sm:text-sm">{getDocumentTypeLabel(doc.document_type)}</p>
                    <p className="text-xs text-muted-foreground truncate">{doc.file_name} ({formatFileSize(doc.file_size)})</p>
                  </div>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handlePreview(doc.file_path, doc.file_name)} className="p-1 sm:p-2">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadFile(doc.file_path, doc.file_name)} className="p-1 sm:p-2">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs sm:text-sm text-muted-foreground py-4">Aucun document.</p>
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

export default function CandidateAnalysis() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: application, isLoading, error } = useApplication(id);
  const { data: documents = [], isLoading: documentsLoading } = useApplicationDocuments(id);
  const { updateApplicationStatus } = useRecruiterApplications(application?.job_offer_id);


  const jobId = searchParams.get('jobId') || application?.job_offer_id;

  const getFileUrl = (filePath: string) => {
    // Si le chemin est déjà une URL complète, la retourner telle quelle
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    // Sinon, générer l'URL publique depuis Supabase Storage
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      // Extraire le chemin relatif si c'est une URL complète
      const relativePath = filePath.includes('/storage/v1/object/public/documents/') 
        ? filePath.split('/storage/v1/object/public/documents/')[1]
        : filePath;
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(relativePath);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Fallback: ouvrir dans un nouvel onglet
      window.open(getFileUrl(filePath), '_blank');
    }
  };

  const handleStatusChange = async (newStatus: Application['status']) => {
    if (!application) return;
    try {
      await updateApplicationStatus({ applicationId: application.id, status: newStatus });
      if (jobId) {
        navigate(`/recruiter/jobs/${jobId}/pipeline`);
      } else {
        navigate(-1);
      }
    } catch (e) {
      console.error("Erreur lors du changement de statut", e);
      // Gérer l'affichage de l'erreur à l'utilisateur
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
        </header>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
            <TabsTrigger value="info" className="px-2 sm:px-4">Informations Candidat</TabsTrigger>
            <TabsTrigger value="evaluation" className="px-2 sm:px-4">Évaluation</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              <ProfileTab application={application} />
              <DocumentsTab documents={documents} documentsLoading={documentsLoading} getFileUrl={getFileUrl} downloadFile={downloadFile} />
              <ReferencesTab application={application} />
              <MtpAnswersDisplay mtpAnswers={application.mtp_answers} />
            </div>
          </TabsContent>
          <TabsContent value="evaluation" className="mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <EvaluationProtocol />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" onClick={() => handleStatusChange('incubation')}>Déplacer en Incubation</Button>
                    <Button className="w-full" onClick={() => handleStatusChange('embauche')}>Engager</Button>
                    <Button variant="destructive" className="w-full" onClick={() => handleStatusChange('refuse')}>Refuser</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
}