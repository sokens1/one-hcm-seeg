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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Briefcase, GraduationCap, Star, Info, FileText, Eye, Download, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
  // Utiliser le profil inclus via la RPC pour éviter les problèmes RLS
  const profile = (application?.users as any)?.candidate_profiles || null;
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><User className="w-4 h-4 sm:w-5 sm:h-5"/> Informations Personnelles</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Layout horizontal avec grid responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            <InfoRow icon={User} label="Prénom" value={user?.first_name} />
            <InfoRow icon={User} label="Nom" value={user?.last_name} />
            <InfoRow icon={Mail} label="Email" value={user?.email} />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <InfoRow icon={Phone} label="Téléphone" value={user?.phone as string | undefined} />
            <InfoRow icon={Calendar} label="Date de naissance" value={user?.date_of_birth ? format(new Date(user.date_of_birth), 'PPP', { locale: fr }) : undefined} />
            <InfoRow icon={Info} label="Sexe" value={profile?.gender} />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <InfoRow icon={Briefcase} label="Poste actuel" value={profile?.current_position} />
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

const MtpAnswersDisplay = ({ mtpAnswers, jobTitle }) => {
  // Récupérer les questions métier spécifiques pour ce poste
  const metierQuestions = getMetierQuestionsForTitle(jobTitle);
  
  
  if (!mtpAnswers) return <p className="text-xs sm:text-sm">Aucune réponse au questionnaire MTP.</p>;

  // Questions Talent fixes (7 questions)
  const talentQuestions = [
    "1. Décrivez une situation où votre créativité et innovation ont permis de proposer des solutions stratégiques pour optimiser des processus, comme réduire l'utilisation de gasoil dans un système énergétique, en inspirant vos équipes dirigeantes.",
    "2. Comment démontrez-vous votre initiative et votre autonomie dans des tâches imprévues à haut niveau, par exemple lors d'une campagne de recouvrement d'impayés ou de réparation critique d'équipements, en mobilisant des ressources exécutives ?",
    "3. Fournissez un exemple où votre raisonnement analytique a aidé à synthétiser des informations complexes, analyser des allégations de détournements ou des données sur la performance des réseaux, pour orienter des décisions board-level.",
    "4. Expliquez comment vous gérez le stress et les crises à un niveau dirigeant, par exemple en maintenant votre leadership lors de tensions récurrentes comme des délestages électriques affectant populations et industries.",
    "5. Décrivez votre capacité à prendre des décisions en situations difficiles, comme allouer des ressources limitées pour une maintenance rigoureuse des infrastructures existantes, en alignant avec la vision globale de l'entreprise.",
    "6. Comment votre aptitude à l'apprentissage continu vous a permis de vous perfectionner en technologies émergentes, par exemple les compteurs connectés pour la gestion des réseaux au Gabon, et de cascader cela à vos équipes de direction ?",
    "7. Partagez une expérience où votre travail en équipe a favorisé la coordination à un niveau exécutif, par exemple dans un dialogue constructif avec des parties prenantes comme l'État ou des associations de consommateurs."
  ];

  // Questions Paradigme fixes (7 questions)
  const paradigmeQuestions = [
    "1. Comment alignez-vous votre vision professionnelle en tant que dirigeant avec une approche holistique de renaissance d'une entreprise comme la SEEG, combinant rigueur managériale et investissements stratégiques pour le développement national du Gabon ?",
    "2. Décrivez comment vous avez manifesté votre intégrité professionnelle ainsi que vos valeurs de transparence et de gouvernance renforcée dans un précédent rôle, par exemple en gérant un dilemme éthique ou en prenant une décision difficile alignée avec vos valeurs éthiques.",
    "3. Expliquez votre adhésion à un paradigme de transition énergétique durable, en promouvant des énergies renouvelables et des standards de service comparables aux pays développés d'ici 2035, sous votre direction stratégique.",
    "4. Comment votre paradigme professionnel soutient l'implication des parties prenantes, comme la participation active des consommateurs et la motivation des employés dans une restructuration organisationnelle à grande échelle ?",
    "5. Fournissez un exemple où vous avez promu un modèle économique viable, en résolvant des impayés et en appliquant une tarification sociale réaliste pour un accès universel à l'eau et l'électricité, en tant que dirigeant financier.",
    "6. Décrivez comment vous anticipez et gérez le changement dans un paradigme d'autosuffisance énergétique et hydrique, en visant une capacité de 2 à 4 Gigawatts à horizon 2030 au Gabon, via des roadmaps exécutives.",
    "7. Expliquez votre alignement avec un paradigme d'innovation et d'excellence régionale, en positionnant une société comme la SEEG comme référence en Afrique centrale pour la performance et la durabilité, sous votre vision leadership."
  ];

  const renderMetierAnswers = () => {
    // Récupérer toutes les réponses métier depuis le tableau
    const metierAnswers = mtpAnswers.metier || [];
    
    
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-sm sm:text-base mb-3">Questions Métier ({metierAnswers.length}/7 réponses)</h4>
        {metierAnswers.length > 0 ? (
          <div className="space-y-3">
            {metierAnswers.map((answer, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-3">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  {metierQuestions[index] || `Question ${index + 1}`}
                </p>
                <p className="text-xs sm:text-sm text-foreground">{answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">Aucune réponse aux questions métier.</p>
        )}
      </div>
    );
  };

  const renderTalentAnswers = () => {
    // Récupérer toutes les réponses talent depuis le tableau
    const talentAnswers = (mtpAnswers.talent || []).filter(answer => answer && answer.trim() !== '');
    
    
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-sm sm:text-base mb-3">Questions Talent ({talentAnswers.length}/7 réponses)</h4>
        {talentAnswers.length > 0 ? (
          <div className="space-y-3">
            {talentAnswers.map((answer, index) => (
              <div key={index} className="border-l-2 border-green-500 pl-3">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  {talentQuestions[index] || `Question ${index + 1}`}
                </p>
                <p className="text-xs sm:text-sm text-foreground">{answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">Aucune réponse aux questions talent.</p>
        )}
      </div>
    );
  };

  const renderParadigmeAnswers = () => {
    // Récupérer toutes les réponses paradigme depuis le tableau
    const paradigmeAnswers = (mtpAnswers.paradigme || []).filter(answer => answer && answer.trim() !== '');
    
    
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-sm sm:text-base mb-3">Questions Paradigme ({paradigmeAnswers.length}/7 réponses)</h4>
        {paradigmeAnswers.length > 0 ? (
          <div className="space-y-3">
            {paradigmeAnswers.map((answer, index) => (
              <div key={index} className="border-l-2 border-purple-500 pl-3">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                  {paradigmeQuestions[index] || `Question ${index + 1}`}
                </p>
                <p className="text-xs sm:text-sm text-foreground">{answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">Aucune réponse aux questions paradigme.</p>
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
        {renderMetierAnswers()}
        {renderTalentAnswers()}
        {renderParadigmeAnswers()}
      </CardContent>
    </Card>
  );
};

const DocumentPreviewModal = ({ fileUrl, fileName, isOpen, onClose }: { fileUrl: string, fileName: string, isOpen: boolean, onClose: () => void }) => {
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      // Nettoyer l'URL Blob quand le modal se ferme
      if (fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    }
  }, [isOpen, fileUrl]);
  
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
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-2">
              <p className="text-sm">Erreur lors du chargement du document:</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : isPdf ? (
            <embed
              src={fileUrl}
              type="application/pdf"
              className="w-full h-full"
              title={`Prévisualisation de ${fileName}`}
              onError={() => setError("Impossible de charger le PDF. Vérifiez que vous avez les permissions nécessaires.")}
            />
          ) : isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className="w-full h-full object-contain"
              onError={() => setError("Impossible de charger l'image. Vérifiez que vous avez les permissions nécessaires.")}
            />
          ) : (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              className="w-full h-full border-0"
              title={`Prévisualisation de ${fileName}`}
              onError={() => setError("Impossible de charger le document. Vérifiez que vous avez les permissions nécessaires.")}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DocumentsTab = ({ documents, isLoading, error, getFileUrl, downloadFile }: { documents: any[], isLoading: boolean, error: Error | null, getFileUrl: (path: string) => Promise<string>, downloadFile: (path: string, name: string) => void }) => {
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean, fileUrl: string, fileName: string }>({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  // Helper pour ouvrir un document en prévisualisation
  const handlePreview = async (fileUrl: string, fileName: string) => {
    try {
      const absUrl = await getFileUrl(fileUrl);
      setPreviewModal({ isOpen: true, fileUrl: absUrl, fileName });
    } catch (error) {
      console.error('Error getting preview URL:', error);
      alert('Erreur lors de la prévisualisation. Veuillez réessayer.');
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><FileText className="w-4 h-4 sm:w-5 sm:h-5"/> Documents</CardTitle>
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
                console.log('[DOCUMENTS DEBUG] Document:', doc);
                console.log('[DOCUMENTS DEBUG] doc.file_url:', doc.file_url);
                console.log('[DOCUMENTS DEBUG] doc.file_name:', doc.file_name);
                console.log('[DOCUMENTS DEBUG] doc.id:', doc.id);
                
                return (
                  <div key={doc.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden min-w-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                      <div className="overflow-hidden min-w-0">
                        <p className="font-medium truncate text-xs sm:text-sm">{getDocumentTypeLabel(doc.document_type)}</p>
                        <p className="text-xs text-muted-foreground truncate">{doc.file_name} ({formatFileSize(doc.file_size)})</p>
                        <p className="text-xs text-muted-foreground truncate">ID: {doc.id}</p>
                        <p className="text-xs text-muted-foreground truncate">URL: {doc.file_url}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={async () => {
                        console.log('[BUTTON DEBUG] Eye button clicked for:', doc.file_name);
                        const finalUrl = await getFileUrl(doc.file_url);
                        console.log('[BUTTON DEBUG] Opening URL:', finalUrl);
                        
                        // Test si le fichier existe avant d'ouvrir
                        try {
                          const response = await fetch(finalUrl, { method: 'HEAD' });
                          console.log('[FILE CHECK] HTTP Status:', response.status);
                          console.log('[FILE CHECK] Response OK:', response.ok);
                          
                          if (!response.ok) {
                            console.error('[FILE CHECK] File not found or access denied');
                            if (response.status === 400) {
                              alert(`Erreur 400: Le bucket 'application-documents' n'est pas public ou mal configuré.\n\nSolution:\n1. Allez dans Supabase Dashboard > Storage\n2. Cliquez sur le bucket 'application-documents'\n3. Activez 'Public bucket' dans les paramètres\n4. Ou vérifiez les politiques RLS\n\nURL: ${finalUrl}`);
                            } else {
                              alert(`Erreur ${response.status}: Fichier non trouvé ou accès refusé.\nURL: ${finalUrl}`);
                            }
                            return;
                          }
                        } catch (error) {
                          console.error('[FILE CHECK] Network error:', error);
                          alert(`Erreur réseau: ${error.message}\nURL: ${finalUrl}`);
                          return;
                        }
                        
                        window.open(finalUrl, '_blank');
                      }} className="p-1 sm:p-2">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        console.log('[BUTTON DEBUG] Download button clicked for:', doc.file_name);
                        downloadFile(doc.file_url, doc.file_name);
                      }} className="p-1 sm:p-2">
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
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

const EvaluationProtocol = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Protocole 1</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Le module Evaluation est en cours d'intégration.</p>
        {/* The original structure will be restored here once defined */}
      </CardContent>
    </Card>
  );
};

export default function CandidateAnalysis() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isRecruiter } = useAuth();
  
  const { data: application, isLoading, error } = useApplication(id);
  const { data: documents, isLoading: documentsLoading, error: documentsError } = useApplicationDocuments(id);
  const { updateApplicationStatus } = useRecruiterApplications(application?.job_offer_id);

  const jobId = searchParams.get('jobId') || application?.job_offer_id;
  const jobTitle = application?.job_offers?.title;

  // Helper pour garantir une URL absolue Supabase vers le bucket application-documents
  const ensureAbsoluteUrl = (path: string) => {
    console.log('[DOC URL DEBUG] === ensureAbsoluteUrl START ===');
    console.log('[DOC URL DEBUG] Input path:', path);
    console.log('[DOC URL DEBUG] Path type:', typeof path);
    console.log('[DOC URL DEBUG] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    
    if (!path) {
      console.log('[DOC URL DEBUG] Empty path, returning as-is');
      return path;
    }
    
    if (path.startsWith('http')) {
      console.log('[DOC URL DEBUG] Already absolute URL, returning as-is');
      return path;
    }
    
    const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';
    let p = String(path).trim();
    console.log('[DOC URL DEBUG] Base URL:', base);
    console.log('[DOC URL DEBUG] Trimmed path:', p);
    
    // Nettoyage des slashes de début
    p = p.replace(/^\/+/, '');
    console.log('[DOC URL DEBUG] Path after slash cleanup:', p);
    
    let finalUrl = '';
    
    // Si on reçoit déjà un chemin public complet stockage
    if (p.startsWith('storage/v1/object/public/')) {
      finalUrl = `${base}/${p}`;
      console.log('[DOC URL DEBUG] Case: storage/v1/object/public/ prefix detected');
    }
    // Si le chemin inclut déjà le nom du bucket
    else if (p.startsWith('application-documents/')) {
      finalUrl = `${base}/storage/v1/object/public/${p}`;
      console.log('[DOC URL DEBUG] Case: application-documents/ prefix detected');
    }
    // Cas par défaut: ajouter le bucket
    else {
      finalUrl = `${base}/storage/v1/object/public/application-documents/${p}`;
      console.log('[DOC URL DEBUG] Case: default, adding bucket prefix');
    }
    
    console.log('[DOC URL DEBUG] Final URL:', finalUrl);
    console.log('[DOC URL DEBUG] === ensureAbsoluteUrl END ===');
    return finalUrl;
  };

  const getFileUrl = async (filePath: string) => {
    return ensureAbsoluteUrl(filePath);
  };

  // Nettoie une URL Blob si c'en est une
  const cleanupBlobUrl = (url: string) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    console.log('[DOWNLOAD DEBUG] Attempting to download:', fileName);
    console.log('[DOWNLOAD DEBUG] File URL:', fileUrl);
    const finalUrl = ensureAbsoluteUrl(fileUrl);
    console.log('[DOWNLOAD DEBUG] Final URL:', finalUrl);
    window.open(finalUrl, '_blank');
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
              <DocumentsTab documents={documents} isLoading={documentsLoading} error={documentsError} getFileUrl={getFileUrl} downloadFile={downloadFile} />
              <ReferencesTab application={application} />
              <MtpAnswersDisplay mtpAnswers={application.mtp_answers} jobTitle={jobTitle} />
            </div>
          </TabsContent>
          <TabsContent value="evaluation" className="mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <EvaluationProtocol />
              </div>
              <div className="space-y-6">
                {isRecruiter && (
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
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  );
}