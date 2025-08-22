/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Upload, CheckCircle, User, FileText, Send, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useApplications } from "@/hooks/useApplications";
import { useFileUpload, UploadedFile } from "@/hooks/useFileUpload";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ApplicationFormProps {
  jobTitle: string;
  jobId?: string; // required for create
  onBack: () => void;
  onSubmit?: () => void;
  applicationId?: string; // used in edit mode
  mode?: 'create' | 'edit';
  initialStep?: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dateOfBirth: Date | null;
  currentPosition: string;
  yearsExperience: number | null;
  cv: UploadedFile | null;
  coverLetter: UploadedFile | null;
  integrityLetter: UploadedFile | null;
  projectIdea: UploadedFile | null;
  certificates: UploadedFile[];
  recommendations: UploadedFile[];
  references: string;
  // Partie Métier
  metier1: string;
  metier2: string;
  metier3: string;
  // Partie Talent
  talent1: string;
  talent2: string;
  talent3: string;
  talent4: string;
  talent5: string;
  talent6: string;
  talent7: string;
  // Partie Paradigme
  paradigme1: string;
  paradigme2: string;
  paradigme3: string;
  paradigme4: string;
  paradigme5: string;
  paradigme6: string;
  paradigme7: string;
  consent: boolean;
}

export function ApplicationForm({ jobTitle, jobId, onBack, onSubmit, applicationId, mode = 'create', initialStep }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(
    typeof initialStep === 'number' && initialStep >= 1 ? initialStep : (mode === 'edit' ? 4 : 1)
  );
  const [activeTab, setActiveTab] = useState<'metier' | 'talent' | 'paradigme'>('metier');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitApplication } = useApplications();
  const { uploadFile, isUploading, getFileUrl, deleteFile } = useFileUpload();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    dateOfBirth: null,
    currentPosition: "",
    yearsExperience: null,
    cv: null,
    coverLetter: null,
    integrityLetter: null,
    projectIdea: null,
    certificates: [],
    recommendations: [],
    references: "",
    // Partie Métier
    metier1: "",
    metier2: "",
    metier3: "",
    // Partie Talent
    talent1: "",
    talent2: "",
    talent3: "",
    talent4: "",
    talent5: "",
    talent6: "",
    talent7: "",
    // Partie Paradigme
    paradigme1: "",
    paradigme2: "",
    paradigme3: "",
    paradigme4: "",
    paradigme5: "",
    paradigme6: "",
    paradigme7: "",
    consent: false
  });

  // Prefill personal info from public.users and candidate_profiles
  useEffect(() => {
    let isMounted = true;
    const prefill = async () => {
      try {
        if (!user?.id) return;

        const [{ data: dbUser, error: userError }, { data: profile, error: profileError }] = await Promise.all([
          supabase
            .from('users')
            .select('first_name, last_name, email, date_of_birth')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('candidate_profiles')
            .select('current_position, gender')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        if (userError) throw userError;
        if (profileError) throw profileError;

        if (!isMounted) return;

        // Fallbacks depuis les métadonnées d'auth (providers):
        const meta: any = (user as any)?.user_metadata || {};
        // Essayer différentes clés communes
        let metaFirst: string | undefined = meta.first_name || meta.prenom || meta.given_name;
        let metaLast: string | undefined = meta.last_name || meta.nom || meta.family_name;
        if ((!metaFirst || !metaLast) && typeof meta.name === 'string') {
          const parts = meta.name.trim().split(/\s+/);
          if (!metaFirst && parts.length > 0) metaFirst = parts[0];
          if (!metaLast && parts.length > 1) metaLast = parts.slice(1).join(' ');
        }

        setFormData((prev) => ({
          ...prev,
          firstName: prev.firstName || dbUser?.first_name || metaFirst || '',
          lastName: prev.lastName || dbUser?.last_name || metaLast || '',
          email: prev.email || dbUser?.email || user.email || '',
          dateOfBirth: prev.dateOfBirth || (dbUser?.date_of_birth ? new Date(dbUser.date_of_birth) : null),
          currentPosition: prev.currentPosition || profile?.current_position || '',
          gender: prev.gender || profile?.gender || '',
        }));
      } catch (e: any) {
        console.error('Prefill error:', e);
        // Ne bloque pas l'utilisateur, informe simplement en silencieux
      }
    };

    prefill();
    return () => {
      isMounted = false;
    };
  }, [user, user?.id, user?.email]);

  // Prefill from existing application when editing
  useEffect(() => {
    let aborted = false;
    const loadExisting = async () => {
      if (mode !== 'edit' || !applicationId) return;
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            reference_contacts, 
            mtp_answers,
            candidate_id
          `)
          .eq('id', applicationId)
          .single();
        if (error) throw error;
        if (aborted || !data) return;
        
        // Récupérer les informations utilisateur et profil séparément
        const candidateId = (data as any).candidate_id;
        if (candidateId) {
          const [{ data: userData }, { data: profileData }] = await Promise.all([
            supabase
              .from('users')
              .select('first_name, last_name, email, date_of_birth')
              .eq('id', candidateId)
              .maybeSingle(),
            supabase
              .from('candidate_profiles')
              .select('current_position, gender')
              .eq('user_id', candidateId)
              .maybeSingle()
          ]);
          
          const mtp = (data as any).mtp_answers as { metier?: string[]; talent?: string[]; paradigme?: string[] } | null;
          
          setFormData(prev => ({
            ...prev,
            // Informations personnelles depuis la candidature existante
            firstName: userData?.first_name || prev.firstName,
            lastName: userData?.last_name || prev.lastName,
            email: userData?.email || prev.email,
            dateOfBirth: userData?.date_of_birth ? new Date(userData.date_of_birth) : prev.dateOfBirth,
            gender: profileData?.gender || prev.gender,
            currentPosition: profileData?.current_position || prev.currentPosition,
            // Références et MTP
            references: (data as any).reference_contacts ?? prev.references,
            metier1: mtp?.metier?.[0] ?? prev.metier1,
            metier2: mtp?.metier?.[1] ?? prev.metier2,
            metier3: mtp?.metier?.[2] ?? prev.metier3,
            talent1: mtp?.talent?.[0] ?? prev.talent1,
            talent2: mtp?.talent?.[1] ?? prev.talent2,
            talent3: mtp?.talent?.[2] ?? prev.talent3,
            talent4: mtp?.talent?.[3] ?? prev.talent4,
            talent5: mtp?.talent?.[4] ?? prev.talent5,
            talent6: mtp?.talent?.[5] ?? prev.talent6,
            talent7: mtp?.talent?.[6] ?? prev.talent7,
            paradigme1: mtp?.paradigme?.[0] ?? prev.paradigme1,
            paradigme2: mtp?.paradigme?.[1] ?? prev.paradigme2,
            paradigme3: mtp?.paradigme?.[2] ?? prev.paradigme3,
            paradigme4: mtp?.paradigme?.[3] ?? prev.paradigme4,
            paradigme5: mtp?.paradigme?.[4] ?? prev.paradigme5,
            paradigme6: mtp?.paradigme?.[5] ?? prev.paradigme6,
            paradigme7: mtp?.paradigme?.[6] ?? prev.paradigme7,
          }));
        }
      } catch (e) {
        console.warn('Chargement de la candidature (édition) échoué:', (e as any)?.message || e);
      }
    };
    loadExisting();
    return () => { aborted = true; };
  }, [mode, applicationId]);

  // Prefill documents from existing application when editing
  useEffect(() => {
    let cancelled = false;
    const loadDocuments = async () => {
      if (mode !== 'edit' || !applicationId) return;
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('document_type, file_name, file_path, file_size')
          .eq('application_id', applicationId);
        if (error) throw error;
        if (cancelled || !data) return;

        const makeUploaded = (d: any): UploadedFile => ({
          path: d.file_path, // may already be a public URL
          name: d.file_name,
          size: d.file_size ?? 0,
          type: ''
        });

        const cv = data.find(d => d.document_type === 'cv');
        const cover = data.find(d => d.document_type === 'cover_letter');
        // Sections masquées: on ignore ces documents s'ils existent
        const integrity = undefined;
        const project = undefined;
        const certificates = data.filter(d => d.document_type === 'diploma').map(makeUploaded);
        const recommendations: UploadedFile[] = [];

        setFormData(prev => ({
          ...prev,
          cv: cv ? makeUploaded(cv) : prev.cv,
          coverLetter: cover ? makeUploaded(cover) : prev.coverLetter,
          integrityLetter: prev.integrityLetter,
          projectIdea: prev.projectIdea,
          certificates: certificates.length ? certificates : prev.certificates,
          recommendations: prev.recommendations,
        }));
      } catch (e) {
        console.warn('Chargement des documents échoué:', (e as any)?.message || e);
      }
    };
    loadDocuments();
    return () => { cancelled = true; };
  }, [mode, applicationId]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (mode !== 'edit' && !jobId) {
      toast.error("ID de l'offre d'emploi manquant");
      return;
    }

    setIsSubmitting(true);
    try {
      let applicationIdForDocs: string | null = null;
      if (mode === 'edit' && applicationId) {
        const { error: updError } = await supabase
          .from('applications')
          .update({
            reference_contacts: formData.references,
            mtp_answers: {
              metier: [formData.metier1, formData.metier2, formData.metier3],
              talent: [formData.talent1, formData.talent2, formData.talent3, formData.talent4, formData.talent5, formData.talent6, formData.talent7],
              paradigme: [formData.paradigme1, formData.paradigme2, formData.paradigme3, formData.paradigme4, formData.paradigme5, formData.paradigme6, formData.paradigme7],
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId);
        if (updError) throw updError;
        applicationIdForDocs = applicationId;
      } else {
        const application = await submitApplication({
          job_offer_id: jobId as string,
          ref_contacts: formData.references,
          mtp_answers: {
            metier: [formData.metier1, formData.metier2, formData.metier3],
            talent: [formData.talent1, formData.talent2, formData.talent3, formData.talent4, formData.talent5, formData.talent6, formData.talent7],
            paradigme: [formData.paradigme1, formData.paradigme2, formData.paradigme3, formData.paradigme4, formData.paradigme5, formData.paradigme6, formData.paradigme7],
          },
        });
        applicationIdForDocs = application.id;
      }

      // Gérer les documents lors de l'édition ou création
      try {
        if (mode === 'edit' && applicationIdForDocs) {
          // En mode édition, supprimer d'abord tous les anciens documents
          await supabase
            .from('documents')
            .delete()
            .eq('application_id', applicationIdForDocs);
        }

        const docsPayload: Array<{ application_id: string; document_type: string; file_name: string; file_path: string; file_size: number | null; }> = [];
        
        const toFileUrl = (p: string) => (isPublicUrl(p)) ? p : getFileUrl(p);

        // Upload uniquement CV et lettre de motivation (les autres sections sont masquées)
        const filesToUpload: { file: UploadedFile | null, type: string }[] = [
          { file: formData.cv, type: 'cv' },
          { file: formData.coverLetter, type: 'cover_letter' },
        ];

        for (const { file, type } of filesToUpload) {
          if (file) {
            docsPayload.push({
              application_id: applicationIdForDocs as string,
              document_type: type,
              file_name: file.name,
              file_path: toFileUrl(file.path),
              file_size: file.size ?? null,
            });
          }
        }

        for (const cert of formData.certificates) {
          docsPayload.push({
            application_id: applicationIdForDocs as string,
            document_type: 'diploma',
            file_name: cert.name,
            file_path: toFileUrl(cert.path),
            file_size: cert.size ?? null,
          });
        }

        // Les recommandations sont désormais masquées et non traitées

        if (docsPayload.length > 0) {
          const { error: docsError } = await supabase
            .from('documents')
            .insert(docsPayload);
          if (docsError) {
            console.warn('Insertion documents échouée:', docsError.message);
          }
        }
      } catch (docsEx: any) {
        console.warn('Erreur lors de la gestion des documents:', docsEx?.message || docsEx);
      }

      // Sync profile with form data, do not block on this
      if (user?.id) {
        Promise.allSettled([
          supabase.from('users').update({ 
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
          }).eq('id', user.id),
          supabase.from('candidate_profiles').update({ 
            current_position: formData.currentPosition,
            gender: formData.gender,
          }).eq('user_id', user.id),
        ]).then(results => {
          results.forEach(result => {
            if (result.status === 'rejected') {
              console.warn('Profile sync failed for a field:', result.reason);
            }
          });
        });
      }

      setIsSubmitted(true);
      toast.success("Candidature envoyée avec succès!");
      
      // Appeler onSubmit si fourni après un délai
      setTimeout(() => {
        onSubmit?.();
      }, 2000);
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers pour suppression de fichiers du stockage si nécessaire
  const isPublicUrl = (p: string) => p.startsWith('http://') || p.startsWith('https://');
  const safeDeleteStorageFile = async (path?: string) => {
    try {
      if (!path || isPublicUrl(path)) return;
      await deleteFile(path);
    } catch (e) {
      console.warn('Suppression stockage échouée (non-bloquant):', (e as any)?.message || e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'coverLetter' | 'integrityLetter' | 'projectIdea' | 'certificates' | 'recommendations') => {
    const files = e.target.files;
    if (!files) return;

    try {
      if (type === 'cv') {
        const uploadedFile = await uploadFile(files[0], 'cv');
        setFormData({ ...formData, cv: uploadedFile });
        toast.success("CV uploadé avec succès!");
      } else if (type === 'coverLetter') {
        const uploadedFile = await uploadFile(files[0], 'cover-letters');
        setFormData({ ...formData, coverLetter: uploadedFile });
        toast.success("Lettre de motivation uploadée avec succès!");
      } else if (type === 'integrityLetter') {
        const uploadedFile = await uploadFile(files[0], 'integrity-letters');
        setFormData({ ...formData, integrityLetter: uploadedFile });
        toast.success("Lettre d'intégrité professionnelle uploadée avec succès!");
      } else if (type === 'projectIdea') {
        const uploadedFile = await uploadFile(files[0], 'project-ideas');
        setFormData({ ...formData, projectIdea: uploadedFile });
        toast.success("Idée de projet uploadée avec succès!");
      } else if (type === 'certificates') {
        const uploadPromises = Array.from(files).map(file => uploadFile(file, 'certificates'));
        const uploadedFiles = await Promise.all(uploadPromises);
        setFormData({ ...formData, certificates: [...formData.certificates, ...uploadedFiles] });
        toast.success("Certificats uploadés avec succès!");
      } else if (type === 'recommendations') {
        const uploadPromises = Array.from(files).map(file => uploadFile(file, 'recommendations'));
        const uploadedFiles = await Promise.all(uploadPromises);
        setFormData({ ...formData, recommendations: [...formData.recommendations, ...uploadedFiles] });
        toast.success("Recommandations uploadées avec succès!");
      }
    } catch (error: any) {
      toast.error("Erreur lors de l'upload: " + error.message);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
          <div className="max-w-md sm:max-w-lg mx-auto text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-success rounded-full flex items-center justify-center mx-auto animate-bounce-soft">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Candidature envoyée !</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2 sm:px-4 leading-relaxed">
              Merci, <strong>{formData.firstName}</strong> ! Nous avons bien reçu votre candidature pour le poste de{" "}
              <strong>{jobTitle}</strong> et nous reviendrons vers vous très prochainement.
            </p>
            <div className="space-y-2 sm:space-y-3 px-2 sm:px-4">
              <Button variant="hero" onClick={onBack} className="w-full text-sm sm:text-base py-2 sm:py-3">
                Retour aux offres
              </Button>
              <Button variant="outline" className="w-full text-sm sm:text-base py-2 sm:py-3">
                Postuler à une autre offre
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-3 sm:mb-4 text-white hover:bg-white/10 text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Retour à l'offre</span>
            <span className="sm:hidden">Retour</span>
          </Button>
          
          <div className="text-center space-y-3 sm:space-y-4 px-4">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              Plateforme de Recrutement Nouvelle Génération
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Rejoignez l'Excellence</h1>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-light break-words">{jobTitle}</h2>
            <p className="text-sm sm:text-base lg:text-lg opacity-90 max-w-2xl mx-auto">
              Découvrez un processus de candidature révolutionnaire qui valorise vos compétences, 
              votre potentiel et votre ambition.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Progress Bar with modern design */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4 overflow-x-auto">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-shrink-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                    step <= currentStep 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}>
                    {step <= currentStep ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`h-1 w-8 sm:w-12 lg:w-16 mx-1 sm:mx-2 rounded-full transition-all ${
                      step < currentStep ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-xs font-medium text-gray-600 text-center">
              <span className="truncate">Infos Personnelles</span>
              <span className="truncate">Parcours & Documents</span>
              <span className="truncate">Adhérence MTP</span>
              <span className="truncate">Finalisation</span>
            </div>
            <div className="mt-3 sm:mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Top guide text removed to avoid duplication; sidebar guide remains */}
          </div>
        </div>

        {/* Form Content with modern layout */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Left side - Progress info */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 xl:sticky xl:top-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Étape <span className="font-semibold text-foreground">{currentStep}</span> / {totalSteps}
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3 text-center">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Guide de Candidature</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Ce formulaire se déroule en 4 étapes: renseignez vos informations, ajoutez vos
                      documents clés, indiquez votre adhérence MTP (Métier, Talent, Paradigme), puis
                      vérifiez et soumettez votre candidature.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="xl:col-span-2 order-1 xl:order-2">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl">
                    {currentStep === 1 && <><User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> Informations Personnelles</>}
                    {currentStep === 2 && <><FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> Parcours & Documents</>}
                    {currentStep === 3 && <><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> Adhérence MTP</>}
                    {currentStep === 4 && <><Send className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> Finalisation</>}
                  </CardTitle>
                </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Votre prénom"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre.email@exemple.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().slice(0, 10) : ""}
                      max={new Date().toISOString().slice(0, 10)}
                      min="1900-01-01"
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, dateOfBirth: val ? new Date(val) : null });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Sexe *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre sexe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homme">Homme</SelectItem>
                        <SelectItem value="femme">Femme</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currentPosition">Poste actuel *</Label>
                    <Input
                      id="currentPosition"
                      value={formData.currentPosition}
                      onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                      placeholder="Votre poste actuel"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Experience & Documents */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <Label htmlFor="yearsExperience">Années d'expérience (nombre)</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      min={0}
                      max={60}
                      value={formData.yearsExperience ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormData({ ...formData, yearsExperience: v === '' ? null : Math.max(0, Math.min(60, Number(v))) });
                      }}
                      placeholder="Ex: 5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cv">Votre CV *</Label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary transition-colors" aria-busy={isUploading} aria-live="polite">
                        {isUploading ? (
                          <div className="space-y-2">
                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Upload en cours...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              {formData.cv ? formData.cv.name : "Glissez votre CV ici ou cliquez pour parcourir"}
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'cv')}
                          className="hidden"
                          id="cv-upload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => document.getElementById('cv-upload')?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Upload..." : "Choisir un fichier"}
                        </Button>
                        {formData.cv && (
                          <div className="mt-3 flex items-center justify-between bg-muted p-2 rounded text-sm">
                            <span>{formData.cv.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                await safeDeleteStorageFile(formData.cv?.path);
                                setFormData({ ...formData, cv: null });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section cachée: Lettre d'intégrité professionnelle */}
                  {/* Section cachée: Idée de projet */}
                  {/* Section cachée: Lettres de recommandation */}

                  <div>
                    <Label htmlFor="references">Références de recommandation (facultatif)</Label>
                    <Textarea
                      id="references"
                      value={formData.references}
                      onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                      placeholder="Nom, poste, entreprise, téléphone/email de vos références..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Adhérence MTP au poste */}
              {currentStep === 3 && (
                <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
                  <div className="text-center mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Adhérence MTP au poste</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2">Évaluez votre adéquation avec le poste selon les dimensions Métier, Talent et Paradigme.</p>
                    
                    {/* Navigation par onglets */}
                    <div className="flex justify-center border-b border-gray-200 w-full mb-4 sm:mb-6">
                      <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto" aria-label="Navigation MTP">
                        <button
                          onClick={() => setActiveTab('metier')}
                          className={`${activeTab === 'metier' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                            whitespace-nowrap py-2 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink-0`}
                        >
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === 'metier' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
                            M
                          </div>
                          <span className="hidden sm:inline">Métier</span>
                        </button>
                        
                        <button
                          onClick={() => setActiveTab('talent')}
                          className={`${activeTab === 'talent' 
                            ? 'border-green-500 text-green-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                            whitespace-nowrap py-2 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink-0`}
                        >
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === 'talent' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}>
                            T
                          </div>
                          <span className="hidden sm:inline">Talent</span>
                        </button>
                        
                        <button
                          onClick={() => setActiveTab('paradigme')}
                          className={`${activeTab === 'paradigme' 
                            ? 'border-purple-500 text-purple-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                            whitespace-nowrap py-2 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 min-w-0 flex-shrink-0`}
                        >
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeTab === 'paradigme' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'}`}>
                            P
                          </div>
                          <span className="hidden sm:inline">Paradigme</span>
                        </button>
                      </nav>
                    </div>
                  </div>
                  
                  {/* Contenu des onglets */}
                  <div className="mt-2 sm:mt-4">
                    {/* Onglet Métier */}
                    {activeTab === 'metier' && (
                      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 lg:p-6 border border-blue-200 animate-fade-in">
                        <h4 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">M</div>
                          Partie Métier
                        </h4>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <Label htmlFor="metier1" className="text-sm sm:text-base">1. Quelles sont vos principales compétences techniques dans ce domaine ?</Label>
                            <Textarea
                              id="metier1"
                              value={formData.metier1}
                              onChange={(e) => setFormData({ ...formData, metier1: e.target.value })}
                              placeholder="Décrivez vos compétences techniques..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="metier2" className="text-sm sm:text-base">2. Comment votre expérience professionnelle vous prépare-t-elle à ce poste ?</Label>
                            <Textarea
                              id="metier2"
                              value={formData.metier2}
                              onChange={(e) => setFormData({ ...formData, metier2: e.target.value })}
                              placeholder="Expliquez la pertinence de votre expérience..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="metier3" className="text-sm sm:text-base">3. Quels défis techniques de ce métier vous motivent le plus ?</Label>
                            <Textarea
                              id="metier3"
                              value={formData.metier3}
                              onChange={(e) => setFormData({ ...formData, metier3: e.target.value })}
                              placeholder="Partagez vos motivations techniques..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Onglet Talent */}
                    {activeTab === 'talent' && (
                      <div className="bg-green-50 rounded-lg p-3 sm:p-4 lg:p-6 border border-green-200 animate-fade-in">
                        <h4 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4 flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">T</div>
                          Partie Talent
                        </h4>
                        
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <Label htmlFor="talent1" className="text-sm sm:text-base">1. Quel est votre talent naturel le plus distinctif ?</Label>
                            <Textarea
                              id="talent1"
                              value={formData.talent1}
                              onChange={(e) => setFormData({ ...formData, talent1: e.target.value })}
                              placeholder="Décrivez votre talent unique..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="talent2" className="text-sm sm:text-base">2. Comment ce talent vous aide-t-il à exceller dans votre travail ?</Label>
                            <Textarea
                              id="talent2"
                              value={formData.talent2}
                              onChange={(e) => setFormData({ ...formData, talent2: e.target.value })}
                              placeholder="Expliquez l'impact de votre talent..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="talent3" className="text-sm sm:text-base">3. Donnez un exemple concret où votre talent a fait la différence.</Label>
                            <Textarea
                              id="talent3"
                              value={formData.talent3}
                              onChange={(e) => setFormData({ ...formData, talent3: e.target.value })}
                              placeholder="Racontez un exemple précis..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="talent4" className="text-sm sm:text-base">4. Sur quelles activités prenez-vous naturellement le lead ?</Label>
                            <Textarea
                              id="talent4"
                              value={formData.talent4}
                              onChange={(e) => setFormData({ ...formData, talent4: e.target.value })}
                              placeholder="Décrivez les situations où vous prenez l'initiative..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="talent5" className="text-sm sm:text-base">5. Quelle compétence vous distingue le plus de vos pairs ?</Label>
                            <Textarea
                              id="talent5"
                              value={formData.talent5}
                              onChange={(e) => setFormData({ ...formData, talent5: e.target.value })}
                              placeholder="Expliquez en quoi cette compétence est différenciante..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="talent6" className="text-sm sm:text-base">6. Quelle activité vous donne le plus d'énergie au travail ?</Label>
                            <Textarea
                              id="talent6"
                              value={formData.talent6}
                              onChange={(e) => setFormData({ ...formData, talent6: e.target.value })}
                              placeholder="Partagez ce qui vous énergise..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="talent7" className="text-sm sm:text-base">7. Quelle reconnaissance attendez-vous pour vous sentir valorisé ?</Label>
                            <Textarea
                              id="talent7"
                              value={formData.talent7}
                              onChange={(e) => setFormData({ ...formData, talent7: e.target.value })}
                              placeholder="Décrivez le type de reconnaissance..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Onglet Paradigme */}
                    {activeTab === 'paradigme' && (
                      <div className="bg-purple-50 rounded-lg p-3 sm:p-4 lg:p-6 border border-purple-200 animate-fade-in">
                        <h4 className="text-base sm:text-lg font-semibold text-purple-800 mb-3 sm:mb-4 flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">P</div>
                          Partie Paradigme/Valeurs
                        </h4>
                        
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <Label htmlFor="paradigme1" className="text-sm sm:text-base">1. Quelles valeurs guident vos décisions professionnelles ?</Label>
                            <Textarea
                              id="paradigme1"
                              value={formData.paradigme1}
                              onChange={(e) => setFormData({ ...formData, paradigme1: e.target.value })}
                              placeholder="Partagez vos valeurs professionnelles..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="paradigme2" className="text-sm sm:text-base">2. Comment votre vision s'aligne-t-elle avec la mission de OneHCM ?</Label>
                            <Textarea
                              id="paradigme2"
                              value={formData.paradigme2}
                              onChange={(e) => setFormData({ ...formData, paradigme2: e.target.value })}
                              placeholder="Expliquez l'alignement avec notre mission..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="paradigme3" className="text-sm sm:text-base">3. Comment contribueriez-vous à notre culture d'entreprise ?</Label>
                            <Textarea
                              id="paradigme3"
                              value={formData.paradigme3}
                              onChange={(e) => setFormData({ ...formData, paradigme3: e.target.value })}
                              placeholder="Décrivez votre contribution potentielle..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="paradigme4" className="text-sm sm:text-base">4. Quelles attitudes au travail vous sont inacceptables ?</Label>
                            <Textarea
                              id="paradigme4"
                              value={formData.paradigme4}
                              onChange={(e) => setFormData({ ...formData, paradigme4: e.target.value })}
                              placeholder="Décrivez vos lignes rouges..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="paradigme5" className="text-sm sm:text-base">5. Quelles conditions favorisent votre meilleur travail ?</Label>
                            <Textarea
                              id="paradigme5"
                              value={formData.paradigme5}
                              onChange={(e) => setFormData({ ...formData, paradigme5: e.target.value })}
                              placeholder="Décrivez votre environnement idéal..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="paradigme6" className="text-sm sm:text-base">6. Comment gérez-vous les conflits de valeurs ?</Label>
                            <Textarea
                              id="paradigme6"
                              value={formData.paradigme6}
                              onChange={(e) => setFormData({ ...formData, paradigme6: e.target.value })}
                              placeholder="Expliquez votre approche..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="paradigme7" className="text-sm sm:text-base">7. Quel impact souhaitez-vous avoir dans l'organisation ?</Label>
                            <Textarea
                              id="paradigme7"
                              value={formData.paradigme7}
                              onChange={(e) => setFormData({ ...formData, paradigme7: e.target.value })}
                              placeholder="Décrivez l'impact attendu..."
                              className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
  
              {/* Navigation pour étapes 1 à 3 */}
              {currentStep < 4 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Précédent
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="w-full sm:w-auto"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h4 className="text-lg sm:text-xl font-semibold text-center mb-6">Récapitulatif de votre candidature</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Informations Personnelles</h5>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>Modifier</Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nom complet:</span>
                          <p>{formData.firstName} {formData.lastName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p>{formData.email}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date de naissance:</span>
                          <p>{formData.dateOfBirth ? format(formData.dateOfBirth, "PPP", { locale: fr }) : "Non renseigné"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Poste actuel:</span>
                          <p>{formData.currentPosition || "Non renseigné"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Années d'expérience:</span>
                          <p>{formData.yearsExperience ?? "Non renseigné"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Parcours & Documents</h5>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>Modifier</Button>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lettre de motivation:</span>
                        <p>{formData.coverLetter ? formData.coverLetter.name : "Non fournie"}</p>
                      </div>
                      {/* Sections cachées non affichées en récapitulatif: intégrité et idée de projet */}
                      <div>
                        <span className="text-muted-foreground">Certificats:</span>
                        <p>{formData.certificates.length} fichier(s)</p>
                      </div>
                      {/* Sections cachées non affichées: lettres de recommandation */}
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Adhérence MTP au poste</h5>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)}>Modifier</Button>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Métier:</span>
                        <p className="text-xs">
                          {[formData.metier1, formData.metier2, formData.metier3].filter(Boolean).length}/3 questions répondues
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Talent:</span>
                        <p className="text-xs">
                          {[formData.talent1, formData.talent2, formData.talent3, formData.talent4, formData.talent5, formData.talent6, formData.talent7].filter(Boolean).length}/7 questions répondues
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Paradigme:</span>
                        <p className="text-xs">
                          {[formData.paradigme1, formData.paradigme2, formData.paradigme3, formData.paradigme4, formData.paradigme5, formData.paradigme6, formData.paradigme7].filter(Boolean).length}/7 questions répondues
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                    />
                    <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                      J'accepte que mes données personnelles soient traitées dans le cadre de cette candidature 
                      conformément à la politique de confidentialité de OneHCM.
                    </Label>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <Button variant="ghost" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Précédent
                    </Button>

                    {/* Step 4 context: always render the submit action here to avoid impossible comparisons */}
                    <Button
                      variant="success"
                      onClick={handleSubmit}
                      className="w-full sm:w-auto"
                      disabled={!formData.consent}
                    >
                      <span className="hidden sm:inline">Envoyer ma candidature</span>
                      <span className="sm:hidden">Envoyer</span>
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
        </div>
      </div>
      {/* Close max-w-4xl form container */}
    </div>
    {/* Close main container */}
  </div>
  {/* Close root wrapper */}
  </div>
  );
}