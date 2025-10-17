/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/SafeSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Upload, CheckCircle, User, FileText, Send, X, Users, Edit, AlertCircle, Plus, Mail, Phone, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApplications } from "@/hooks/useApplications";
import { useFileUpload, UploadedFile } from "@/hooks/useFileUpload";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useApplicationDraft } from "@/hooks/useApplicationDraft";
import { DraftSaveIndicator, DraftRestoreNotification } from "@/components/ui/DraftSaveIndicator";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { isApplicationClosed } from "@/utils/applicationUtils";
import { isPreLaunch } from "@/utils/launchGate";
import { getMTPQuestionsFromJobOffer, MTPQuestions } from '@/data/metierQuestions';
import { useJobOffer } from '@/hooks/useJobOffers';
import { Spinner } from "@/components/ui/spinner";
import { useMemo } from 'react';
import { useCampaignEligibility } from "@/hooks/useCampaignEligibility";
import { CampaignEligibilityAlert } from "@/components/ui/CampaignEligibilityAlert";
// Import supprimé car l'envoi d'email est désactivé
// import { EMAIL_CONFIG } from "@/config/email";
// import { getCandidateEmail, isValidEmail, getEmailErrorMessage } from "@/utils/emailValidation";

interface ApplicationFormProps {
  jobTitle: string;
  jobId?: string; // required for create
  onBack: () => void;
  onSubmit?: () => void;
  applicationId?: string; // used in edit mode
  mode?: 'create' | 'edit';
  initialStep?: number;
  offerStatus?: string | null; // interne | externe - pour conditionner l'affichage des références
}

interface Reference {
  id: string;
  fullName: string;
  email: string;
  contact: string;
  company: string;
}

// Composant pour gérer les recommandations
function ReferenceSection({
  references,
  onAddReference,
  onEditReference,
  onDeleteReference,
}: {
  references: Reference[];
  onAddReference: (reference: Reference) => void;
  onEditReference: (id: string, reference: Reference) => void;
  onDeleteReference: (id: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<Reference | null>(null);
  const [formRef, setFormRef] = useState<Reference>({
    id: '',
    fullName: '',
    email: '',
    contact: '',
    company: '',
  });

  const minReferences = 2;
  const maxReferences = 5;

  const handleOpenModal = (reference?: Reference) => {
    if (reference) {
      setEditingReference(reference);
      setFormRef(reference);
    } else {
      setEditingReference(null);
      setFormRef({
        id: crypto.randomUUID(),
        fullName: '',
        email: '',
        contact: '',
        company: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReference(null);
    setFormRef({
      id: '',
      fullName: '',
      email: '',
      contact: '',
      company: '',
    });
  };

  const handleSaveReference = () => {
    // Validation
    if (!formRef.fullName.trim() || !formRef.email.trim() || !formRef.contact.trim() || !formRef.company.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formRef.email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    if (editingReference) {
      onEditReference(editingReference.id, formRef);
      toast.success('Recommandation mise à jour');
    } else {
      onAddReference(formRef);
      toast.success('Recommandation ajoutée');
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec badge */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recommandations professionnelles
            </h4>
            <Badge 
              variant={references.length >= minReferences ? "default" : "destructive"}
              className="text-xs"
            >
              {references.length}/{minReferences} minimum
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Ajoutez {minReferences} à {maxReferences} personnes qui peuvent attester de votre parcours professionnel.
          </p>
        </div>
      </div>

      {/* Liste des recommandations */}
      {references.length > 0 && (
        <div className="grid gap-3">
          {references.map((reference, index) => (
            <div
              key={reference.id}
              className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              {/* Badge numéro */}
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                {index + 1}
              </div>

              {/* Contenu */}
              <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nom complet</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{reference.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entreprise</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{reference.company}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{reference.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contact</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{reference.contact}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenModal(reference)}
                  className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDeleteReference(reference.id);
                    toast.success('Recommandation supprimée');
                  }}
                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucune recommandation */}
      {references.length === 0 && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Aucune recommandation ajoutée
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Cliquez sur le bouton ci-dessous pour ajouter votre première recommandation
          </p>
        </div>
      )}

      {/* Bouton ajouter */}
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOpenModal()}
        disabled={references.length >= maxReferences}
        className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une recommandation {references.length < minReferences && `(${minReferences - references.length} minimum requis)`}
      </Button>

      {references.length < minReferences && (
        <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Vous devez ajouter au moins {minReferences} recommandations pour continuer
        </p>
      )}

      {/* Modal pour ajouter/éditer une recommandation */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              {editingReference ? 'Modifier la recommandation' : 'Ajouter une recommandation'}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations d'une personne qui peut attester de votre parcours professionnel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modal-fullName">Nom et prénom *</Label>
              <Input
                id="modal-fullName"
                value={formRef.fullName}
                onChange={(e) => setFormRef({ ...formRef, fullName: e.target.value })}
                placeholder="Ex: Jean Dupont"
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-company">Administration / Entreprise / Organisation *</Label>
              <Input
                id="modal-company"
                value={formRef.company}
                onChange={(e) => setFormRef({ ...formRef, company: e.target.value })}
                placeholder="Ex: SEEG"
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-email">Email professionnel *</Label>
              <Input
                id="modal-email"
                type="email"
                value={formRef.email}
                onChange={(e) => setFormRef({ ...formRef, email: e.target.value })}
                placeholder="exemple@domaine.com"
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-contact">Numéro de téléphone *</Label>
              <Input
                id="modal-contact"
                value={formRef.contact}
                onChange={(e) => setFormRef({ ...formRef, contact: e.target.value })}
                placeholder="+241 01 23 45 67"
                className="border-2"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveReference}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingReference ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  matricule: string;
  phone: string;
  gender: string;
  dateOfBirth: Date | null;
  currentPosition: string;
  address: string;
  cv: UploadedFile | null;
  coverLetter: UploadedFile | null;
  yearsOfExperience: string;
  certificates: UploadedFile[];
  additionalCertificates: UploadedFile[];
  references: Reference[]; // Nouvelle structure pour plusieurs recommandations
  referenceFullName: string; // Conservé pour compatibilité
  referenceEmail: string;
  referenceContact: string;
  referenceCompany: string;
  hasBeenManager: boolean | null; // Pour les candidatures internes uniquement
  // Partie Métier
  metier1: string;
  metier2: string;
  metier3: string;
  metier4: string;
  metier5: string;
  metier6: string;
  metier7: string;
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

export function ApplicationForm({ jobTitle, jobId, onBack, onSubmit, applicationId, mode = 'create', initialStep, offerStatus }: ApplicationFormProps) {
  const navigate = useNavigate();
  const preLaunch = isPreLaunch();
  const applicationsClosed = isApplicationClosed();
  const preLaunchToast = () => toast.info("Les candidatures seront disponibles à partir du lundi 25 août 2025.");
  const { isEligible } = useCampaignEligibility();
  
  // Déterminer si l'offre est externe (références de recommandation uniquement pour les offres externes)
  const isExternalOffer = offerStatus === 'externe';
  // Déterminer si l'offre est interne (question sur l'expérience de manager uniquement pour les offres internes)
  const isInternalOffer = offerStatus === 'interne';
  
  // Hook pour gérer les brouillons (seulement en mode création)
  const {
    draftData,
    isDraftLoaded,
    isSaving,
    lastSaved,
    saveDraft,
    clearDraft,
    enableAutoSave,
    disableAutoSave
  } = useApplicationDraft(jobId || '');
  
  // État pour gérer la notification de restauration
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof initialStep === 'number' && initialStep >= 1) return initialStep;
    try {
      const jid = jobId || 'no-job';
      const raw = localStorage.getItem(`application_form_shared_${jid}_ui`);
      if (raw) {
        const saved = JSON.parse(raw);
        const step = Number(saved?.currentStep);
        if (step >= 1) return step;
      }
    } catch { /* ignore */ }
    return (mode === 'edit' ? 4 : 1);
  });
  const [activeTab, setActiveTab] = useState<'metier' | 'talent' | 'paradigme'>(() => {
    try {
      const jid = jobId || 'no-job';
      const raw = localStorage.getItem(`application_form_shared_${jid}_ui`);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.activeTab === 'metier' || saved?.activeTab === 'talent' || saved?.activeTab === 'paradigme') {
          return saved.activeTab;
        }
      }
    } catch { /* ignore */ }
    return 'metier';
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitApplication } = useApplications();
  const { uploadFile, isUploading, getFileUrl, deleteFile } = useFileUpload();
  const { user } = useAuth();
  // Clé de persistance unique par utilisateur et offre
  const storageKey = useMemo(() => {
    const uid = user?.id || 'guest';
    const jid = jobId || 'no-job';
    return `application_form_${uid}_${jid}`;
  }, [user?.id, jobId]);
  // Shared fallback key (job-scoped), used when auth is not yet restored on refresh
  const sharedKey = useMemo(() => {
    const jid = jobId || 'no-job';
    return `application_form_shared_${jid}`;
  }, [jobId]);

  const [formData, setFormData] = useState<FormData>(() => {
    // Essayer de recharger l'état depuis le stockage local
    try {
      let raw = localStorage.getItem(storageKey);
      if (!raw) raw = localStorage.getItem(sharedKey);
      if (raw) {
        const parsed = JSON.parse(raw) as FormData;
        // Restaurer Date et s'assurer que les tableaux sont définis
        return {
          ...parsed,
          dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth as unknown as string) : null,
          certificates: parsed.certificates || [],
          references: parsed.references || [],
          additionalCertificates: parsed.additionalCertificates || [],
        };
      }
    } catch { /* ignore */ }
    return {
    firstName: "",
    lastName: "",
    email: "",
    matricule: "",
    phone: "",
    gender: "",
    dateOfBirth: null,
    currentPosition: "",
    address: "",
    cv: null,
    coverLetter: null,
    yearsOfExperience: "",
    certificates: [],
    additionalCertificates: [],
    references: [],
    referenceFullName: "",
    referenceEmail: "",
    referenceContact: "",
    referenceCompany: "",
    hasBeenManager: null,
    // Partie Métier
    metier1: "",
    metier2: "",
    metier3: "",
    metier4: "",
    metier5: "",
    metier6: "",
    metier7: "",
    // Partie Talent
    talent1: "", talent2: "", talent3: "", talent4: "", talent5: "", talent6: "", talent7: "",
    // Partie Paradigme
    paradigme1: "", paradigme2: "", paradigme3: "", paradigme4: "", paradigme5: "", paradigme6: "", paradigme7: "",
    consent: false
    };
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
            .select('first_name, last_name, email, matricule, phone')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('candidate_profiles')
            .select('current_position, gender, years_experience, address, birth_date')
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

        setFormData((prev) => {
          const next = {
          ...prev,
          firstName: prev.firstName || dbUser?.first_name || metaFirst || '',
          lastName: prev.lastName || dbUser?.last_name || metaLast || '',
          email: prev.email || dbUser?.email || user.email || '',
          matricule: prev.matricule || dbUser?.matricule || '',
          phone: prev.phone || dbUser?.phone || '',
          dateOfBirth: prev.dateOfBirth || (profile?.birth_date ? new Date(profile.birth_date) : null),
          currentPosition: prev.currentPosition || profile?.current_position || '',
          gender: prev.gender || profile?.gender || '',
          yearsOfExperience: prev.yearsOfExperience || (profile?.years_experience ? String(profile.years_experience) : ''),
          address: prev.address || profile?.address || '',
          };
          try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
          return next;
        });
      } catch (e: any) {
        console.error('Prefill error:', e);
        // Ne bloque pas l'utilisateur, informe simplement en silencieux
      }
    };

    prefill();
    return () => {
      isMounted = false;
    };
  }, [user, user?.id, user?.email, storageKey]);

  // Gérer la restauration des brouillons
  useEffect(() => {
    if (mode === 'create' && isDraftLoaded && draftData && Object.keys(draftData.form_data).length > 0) {
      // Liste des champs pré-remplis automatiquement (à exclure de la vérification)
      const prefilledFields = ['firstName', 'lastName', 'email', 'phone', 'gender', 'currentPosition', 'matricule'];
      
      // Vérifier s'il y a des données significatives dans le brouillon
      // (c'est-à-dire des champs remplis manuellement par l'utilisateur)
      const hasSignificantData = Object.entries(draftData.form_data).some(([key, value]) => {
        // Ignorer les champs pré-remplis
        if (prefilledFields.includes(key)) return false;
        
        // Ignorer les valeurs vides, null, undefined, false, ou tableaux vides
        if (!value) return false;
        if (value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        
        // Si c'est un objet (comme les fichiers), vérifier s'il est vide
        if (typeof value === 'object' && !Array.isArray(value)) {
          return Object.keys(value).length > 0;
        }
        
        return true;
      });
      
      console.log('🔍 [Draft Check] Données significatives trouvées:', hasSignificantData);
      console.log('🔍 [Draft Check] Données du brouillon:', draftData.form_data);
      
      if (hasSignificantData) {
        setShowDraftRestore(true);
      }
    }
  }, [mode, isDraftLoaded, draftData]);

  // Fonctions de gestion des brouillons
  const restoreDraft = () => {
    if (draftData) {
      // Restaurer les données du formulaire
      setFormData(prevData => ({
        ...prevData,
        ...draftData.form_data
      }));
      
      // Restaurer l'état de l'UI
      if (draftData.ui_state.currentStep) {
        setCurrentStep(draftData.ui_state.currentStep);
      }
      if (draftData.ui_state.activeTab) {
        setActiveTab(draftData.ui_state.activeTab as 'metier' | 'talent' | 'paradigme');
      }
      
      setShowDraftRestore(false);
      toast.success('Brouillon restauré avec succès !');
    }
  };

  const ignoreDraft = () => {
    setShowDraftRestore(false);
    
    // Supprimer le brouillon de la base de données
    clearDraft();
    
    // Supprimer également du localStorage
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(sharedKey);
      const uiKey = `application_form_shared_${jobId}_ui`;
      localStorage.removeItem(uiKey);
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
    
    // Réinitialiser le formulaire avec les données de base (nom, prénom, email)
    setFormData(prevData => ({
      firstName: prevData.firstName,
      lastName: prevData.lastName,
      email: prevData.email,
      matricule: prevData.matricule || "",
      phone: prevData.phone || "",
      gender: prevData.gender || "",
      dateOfBirth: null,
      currentPosition: prevData.currentPosition || "",
      address: "",
      cv: null,
      coverLetter: null,
      yearsOfExperience: "",
      certificates: [],
      additionalCertificates: [],
      references: [],
      referenceFullName: "",
      referenceEmail: "",
      referenceContact: "",
      referenceCompany: "",
      hasBeenManager: null,
      metier1: "",
      metier2: "",
      metier3: "",
      metier4: "",
      metier5: "",
      metier6: "",
      metier7: "",
      talent1: "",
      talent2: "",
      talent3: "",
      talent4: "",
      talent5: "",
      talent6: "",
      talent7: "",
      paradigme1: "",
      paradigme2: "",
      paradigme3: "",
      paradigme4: "",
      paradigme5: "",
      paradigme6: "",
      paradigme7: "",
      consent: false
    }));
    
    // Réinitialiser l'étape à 1
    setCurrentStep(1);
    setActiveTab('metier');
    
    console.log('🗑️ [Draft] Brouillon supprimé et formulaire réinitialisé');
    toast.success('Formulaire réinitialisé');
  };

  // Auto-save des brouillons
  useEffect(() => {
    if (mode === 'create' && isDraftLoaded && !showDraftRestore) {
      const uiState = {
        currentStep,
        activeTab,
        completedSections: [], // Vous pouvez ajouter la logique pour tracker les sections complétées
        lastActiveField: '' // Vous pouvez tracker le dernier champ actif
      };
      
      // Activer l'auto-save avec les données actuelles
      enableAutoSave(formData, uiState);
    }
    
    return () => {
      disableAutoSave();
    };
  }, [mode, isDraftLoaded, showDraftRestore, formData, currentStep, activeTab, enableAutoSave, disableAutoSave]);

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
        
        // Pré-remplissage MTP et références indépendamment des données profil/utilisateur
        const mtp = (data as any).mtp_answers as { metier?: string[]; talent?: string[]; paradigme?: string[] } | null;
        const refFullName = (data as any).reference_full_name ?? "";
        const refEmail = (data as any).reference_email ?? "";
        const refContact = (data as any).reference_contact ?? "";
        const refCompany = (data as any).reference_company ?? "";

        // Reconstruire les recommandations depuis les listes ordonnées
        const reconstructedReferences = (() => {
          try {
            const names = (() => {
              if (!refFullName) return [];
              if (Array.isArray(refFullName)) return refFullName;
              if (typeof refFullName === 'string') {
                try {
                  return JSON.parse(refFullName);
                } catch {
                  return [refFullName];
                }
              }
              return [];
            })();

            const emails = (() => {
              if (!refEmail) return [];
              if (Array.isArray(refEmail)) return refEmail;
              if (typeof refEmail === 'string') {
                try {
                  return JSON.parse(refEmail);
                } catch {
                  return [refEmail];
                }
              }
              return [];
            })();

            const contacts = (() => {
              if (!refContact) return [];
              if (Array.isArray(refContact)) return refContact;
              if (typeof refContact === 'string') {
                try {
                  return JSON.parse(refContact);
                } catch {
                  return [refContact];
                }
              }
              return [];
            })();

            const companies = (() => {
              if (!refCompany) return [];
              if (Array.isArray(refCompany)) return refCompany;
              if (typeof refCompany === 'string') {
                try {
                  return JSON.parse(refCompany);
                } catch {
                  return [refCompany];
                }
              }
              return [];
            })();

            // Reconstruire les recommandations
            const maxLength = Math.max(names.length, emails.length, contacts.length, companies.length);
            const references = [];

            for (let i = 0; i < maxLength; i++) {
              if (names[i] || emails[i] || contacts[i] || companies[i]) {
                references.push({
                  id: `ref-${i + 1}`,
                  fullName: names[i] || '',
                  email: emails[i] || '',
                  contact: contacts[i] || '',
                  company: companies[i] || ''
                });
              }
            }

            return references;
          } catch (error) {
            console.error('❌ Erreur reconstruction références:', error);
            return [];
          }
        })();

        setFormData(prev => {
          const next = {
          ...prev,
          // Références reconstruites
          references: reconstructedReferences,
          // Anciens champs pour compatibilité
          referenceFullName: refFullName || prev.referenceFullName,
          referenceEmail: refEmail || prev.referenceEmail,
          referenceContact: refContact || prev.referenceContact,
          referenceCompany: refCompany || prev.referenceCompany,
          metier1: mtp?.metier?.[0] ?? prev.metier1,
          metier2: mtp?.metier?.[1] ?? prev.metier2,
          metier3: mtp?.metier?.[2] ?? prev.metier3,
          metier4: mtp?.metier?.[3] ?? prev.metier4,
          metier5: mtp?.metier?.[4] ?? prev.metier5,
          metier6: mtp?.metier?.[5] ?? prev.metier6,
          metier7: mtp?.metier?.[6] ?? prev.metier7,
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
          };
          try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
          return next;
        });

        // Récupérer les informations utilisateur et profil séparément (enrichissement, non bloquant)
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

          setFormData(prev => {
            const next = {
            ...prev,
            // Informations personnelles depuis la candidature existante
            firstName: userData?.first_name || prev.firstName,
            lastName: userData?.last_name || prev.lastName,
            email: userData?.email || prev.email,
            dateOfBirth: userData?.date_of_birth ? new Date(userData.date_of_birth) : prev.dateOfBirth,
            gender: profileData?.gender || prev.gender,
            currentPosition: profileData?.current_position || prev.currentPosition,
            };
            try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
            return next;
          });
        }
      } catch (e) {
        console.warn('Chargement de la candidature (édition) échoué:', (e as any)?.message || e);
      }
    };
    loadExisting();
    return () => { aborted = true; };
  }, [mode, applicationId, storageKey]);

  // Prefill documents from existing application when editing
  useEffect(() => {
    let cancelled = false;
    const loadDocuments = async () => {
      if (mode !== 'edit' || !applicationId) return;
      try {
        const { data, error } = await supabase
          .from('application_documents')
          .select('document_type, file_name, file_url, file_size')
          .eq('application_id', applicationId);
        if (error) throw error;
        if (cancelled || !data) return;

        const makeUploaded = (d: any): UploadedFile => ({
          path: d.file_url,
          name: d.file_name,
          size: d.file_size ?? 0,
          type: ''
        });

        const cv = data.find(d => d.document_type === 'cv');
        const cover = data.find(d => d.document_type === 'cover_letter');
                const certificates = data.filter(d => d.document_type === 'diploma').map(makeUploaded);
        const additionalCertificates = data.filter(d => d.document_type === 'certificate').map(makeUploaded);

        setFormData(prev => {
          const next = {
          ...prev,
          cv: cv ? makeUploaded(cv) : prev.cv,
          coverLetter: cover ? makeUploaded(cover) : prev.coverLetter,
          certificates: certificates.length ? certificates : prev.certificates,
          additionalCertificates: additionalCertificates.length ? additionalCertificates : prev.additionalCertificates,
          };
          try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
          return next;
        });
      } catch (e) {
        console.warn('Chargement des documents échoué:', (e as any)?.message || e);
      }
    };
    loadDocuments();
    return () => { cancelled = true; };
  }, [mode, applicationId, storageKey]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  // Récupérer l'offre complète pour obtenir les questions MTP dynamiques
  const { data: jobOfferData } = useJobOffer(jobId);
  const mtpQuestions = useMemo(() => {
    if (jobOfferData) {
      // Utiliser les questions MTP de l'offre (ou fallback vers les questions par défaut)
      return getMTPQuestionsFromJobOffer(jobOfferData);
    }
    // Fallback si l'offre n'est pas encore chargée (utilise le titre)
    return getMTPQuestionsFromJobOffer({ title: jobTitle });
  }, [jobOfferData, jobTitle]);

  // Migrate guest data to user-specific key after login (one-time per job)
  useEffect(() => {
    const uid = user?.id;
    const jid = jobId || 'no-job';
    if (!uid) return;
    const userKey = `application_form_${uid}_${jid}`;
    const guestKey = `application_form_guest_${jid}`;
    const userUiKey = userKey + '_ui';
    const guestUiKey = guestKey + '_ui';
    try {
      const hasUserData = !!localStorage.getItem(userKey);
      const guestData = localStorage.getItem(guestKey);
      if (!hasUserData && guestData) {
        localStorage.setItem(userKey, guestData);
        const guestUi = localStorage.getItem(guestUiKey);
        if (guestUi && !localStorage.getItem(userUiKey)) {
          localStorage.setItem(userUiKey, guestUi);
        }
        // Optionally keep guest data; do not remove to allow anonymous continuation in other sessions
      }
    } catch { /* ignore */ }
  }, [user?.id, jobId]);

  // Persist form data locally and to server (if authenticated) whenever it changes
  const saveTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    try {
      // Always persist locally
      const payload = JSON.stringify(formData);
      localStorage.setItem(storageKey, payload);
      // also write shared key to survive auth-late refresh
      localStorage.setItem(sharedKey, payload);
    } catch { /* ignore */ }

    // Debounced server sync for cross-device persistence
    if (user?.id && jobId) {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(async () => {
        try {
          await supabase.from('application_drafts').upsert({
            user_id: user.id,
            job_offer_id: jobId,
            form_data: formData,
            ui_state: { currentStep, activeTab },
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,job_offer_id' });
        } catch (e) {
          console.warn('Draft sync failed (non-blocking):', (e as any)?.message || e);
        }
      }, 600);
    }

    return () => { if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current); };
  }, [formData, storageKey, sharedKey, user?.id, jobId, currentStep, activeTab]);

  // Load saved UI state (step and active tab) when available
  useEffect(() => {
    const load = async () => {
      // 1) Try server draft first if authenticated
      let restored = false;
      if (user?.id && jobId) {
        try {
          const { data, error } = await supabase
            .from('application_drafts')
            .select('form_data, ui_state')
            .eq('user_id', user.id)
            .eq('job_offer_id', jobId)
            .maybeSingle();
          if (!error && data) {
            const srvForm = (data as any).form_data as Partial<FormData> | undefined;
            const srvUi = (data as any).ui_state as { currentStep?: number; activeTab?: 'metier' | 'talent' | 'paradigme' } | undefined;
            if (srvForm) {
              setFormData(prev => {
                const merged = {
                  ...prev,
                  ...srvForm,
                  dateOfBirth: srvForm.dateOfBirth ? new Date(srvForm.dateOfBirth as any) : prev.dateOfBirth,
                } as FormData;
                try {
                  localStorage.setItem(storageKey, JSON.stringify(merged));
                  localStorage.setItem(sharedKey, JSON.stringify(merged));
                } catch (e) {
                  if (import.meta.env.DEV) {
                    console.warn('Local draft persist failed (non-blocking):', (e as any)?.message || e);
                  }
                }
                return merged;
              });
              restored = true;
            }
            if (srvUi) {
              if (typeof srvUi.currentStep === 'number' && srvUi.currentStep >= 1 && srvUi.currentStep <= totalSteps && typeof initialStep !== 'number') {
                setCurrentStep(srvUi.currentStep);
              }
              if (srvUi.activeTab === 'metier' || srvUi.activeTab === 'talent' || srvUi.activeTab === 'paradigme') {
                setActiveTab(srvUi.activeTab);
              }
              try {
                localStorage.setItem(storageKey + '_ui', JSON.stringify(srvUi));
                localStorage.setItem(sharedKey + '_ui', JSON.stringify(srvUi));
              } catch (e) {
                if (import.meta.env.DEV) {
                  console.warn('Local UI persist failed (non-blocking):', (e as any)?.message || e);
                }
              }
            }
          }
        } catch {
          // ignore server load errors
        }
      }

      // 2) Fallback to local UI state
      try {
        let raw = localStorage.getItem(storageKey + '_ui');
        if (!raw) raw = localStorage.getItem(sharedKey + '_ui');
        if (!restored && raw) {
          const saved = JSON.parse(raw) as { currentStep?: number; activeTab?: 'metier' | 'talent' | 'paradigme' };
          if (typeof initialStep !== 'number') {
            const step = Number(saved.currentStep);
            if (step >= 1 && step <= totalSteps) setCurrentStep(step);
          }
          if (saved.activeTab === 'metier' || saved.activeTab === 'talent' || saved.activeTab === 'paradigme') {
            setActiveTab(saved.activeTab);
          }
        }
      } catch { /* ignore */ }
    };
    load();
  }, [storageKey, sharedKey, initialStep, totalSteps, user?.id, jobId]);

  // Persist UI state to localStorage
  useEffect(() => {
    try {
      const payload = JSON.stringify({ currentStep, activeTab });
      localStorage.setItem(storageKey + '_ui', payload);
      // also persist to shared to survive auth-late refresh
      localStorage.setItem(sharedKey + '_ui', payload);
    } catch { /* ignore */ }
  }, [currentStep, activeTab, storageKey, sharedKey]);

  // Validation functions for each step
  const validateStep1 = () => {
    // Validation de l'email avec nos utilitaires
            // const isEmailValid = isValidEmail(formData.email); // DÉSACTIVÉ
        const isEmailValid = true; // Validation d'email désactivée (forcer vrai sans condition constante)
    
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      isEmailValid &&
      formData.gender.trim() !== '' &&
      formData.dateOfBirth !== null &&
      formData.currentPosition.trim() !== '' &&
      formData.yearsOfExperience.trim() !== ''
    );
  };

  const validateStep2 = () => {
    const basicDocsValid = (
      formData.cv !== null &&
      formData.coverLetter !== null &&
      formData.certificates && formData.certificates.length > 0  // At least one diploma is required
    );
    
    // Les références sont requises uniquement pour les offres externes (minimum 2)
    if (isExternalOffer) {
      return basicDocsValid && formData.references && formData.references.length >= 2;
    }
    
    // Le champ hasBeenManager est requis uniquement pour les offres internes
    if (isInternalOffer) {
      return basicDocsValid && formData.hasBeenManager !== null;
    }
    
    return basicDocsValid;
  };

  const validateStep3 = () => {
    // Validate Métier tab (3 questions)
    const metierValid = mtpQuestions.metier.every((_, i) => formData[`metier${i + 1}`].trim() !== '');
    
    const talentValid = mtpQuestions.talent.every((_, i) => formData[`talent${i + 1}`].trim() !== '');
    const paradigmeValid = mtpQuestions.paradigme.every((_, i) => formData[`paradigme${i + 1}`].trim() !== '');

    return metierValid && talentValid && paradigmeValid;
  };

  const isNextButtonDisabled = () => {
    switch (currentStep) {
      case 1:
        return !validateStep1();
      case 2:
        return !validateStep2();
      case 3:
        return !validateStep3();
      default:
        return false;
    }
  };

  const getValidationMessage = () => {
    switch (currentStep) {
      case 1:
        if (!validateStep1()) {
          const missing = [];
          if (!formData.firstName.trim()) missing.push("Prénom");
          if (!formData.lastName.trim()) missing.push("Nom");
          
          // Validation spécifique pour l'email
          if (!formData.email.trim()) {
            missing.push("Email");
          } else {
            // Validation d'email désactivée (ne pas pousser d'erreur)
            // const emailFormatValid = isValidEmail(formData.email);
            const emailFormatValid = true;
            if (!emailFormatValid) {
              missing.push("Email (format invalide)");
            }
          }
          
          if (!formData.gender.trim()) missing.push("Sexe");
          if (!formData.dateOfBirth) missing.push("Date de naissance");
          if (!formData.currentPosition.trim()) missing.push("Poste actuel");
          if (!formData.yearsOfExperience.trim()) missing.push("Années d'expérience");
          return missing.length > 0 ? `Veuillez renseigner: ${missing.join(', ')}` : '';
        }
        return '';
      case 2:
        if (!validateStep2()) {
          const missing = [];
          if (!formData.cv) missing.push("CV");
          if (!formData.coverLetter) missing.push("Lettre de motivation");
          if (!formData.certificates || formData.certificates.length === 0) missing.push("Au moins un diplôme");
          // Vérifier les références uniquement pour les offres externes (minimum 2)
          if (isExternalOffer) {
            const refCount = formData.references ? formData.references.length : 0;
            if (refCount < 2) {
              missing.push(`Au moins 2 recommandations (${refCount}/2)`);
            }
          }
          // Vérifier la question manager uniquement pour les offres internes
          if (isInternalOffer && formData.hasBeenManager === null) {
            missing.push("Expérience en tant que chef/manager");
          }
          return missing.length > 0 ? `Documents requis: ${missing.join(', ')}` : '';
        }
        return '';
      case 3:
        if (!validateStep3()) {
          const missingTabs = [];
          if (!mtpQuestions.metier.every((_, i) => formData[`metier${i + 1}`].trim() !== '')) missingTabs.push(`Métier (${mtpQuestions.metier.length})`);
          if (!mtpQuestions.talent.every((_, i) => formData[`talent${i + 1}`].trim() !== '')) missingTabs.push(`Talent (${mtpQuestions.talent.length})`);
          if (!mtpQuestions.paradigme.every((_, i) => formData[`paradigme${i + 1}`].trim() !== '')) missingTabs.push(`Paradigme (${mtpQuestions.paradigme.length})`);
          
          return missingTabs.length > 0 ? `Compléter les onglets: ${missingTabs.join(', ')}` : '';
        }
        return '';
      default:
        return '';
    }
  };

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
    setIsSubmitting(true);
    try {
      const isCreateMode = mode === 'create';
      let applicationIdForDocs: string | undefined;

      if (mode === 'edit' && applicationId) {
        // Préparer les données de références - chaque champ reçoit une liste ordonnée
        const referenceNames = formData.references.map(ref => ref.fullName);
        const referenceEmails = formData.references.map(ref => ref.email);
        const referenceContacts = formData.references.map(ref => ref.contact);
        const referenceCompanies = formData.references.map(ref => ref.company);
        
        const { error: updError } = await supabase
          .from('applications')
          .update({
            reference_full_name: JSON.stringify(referenceNames),
            reference_email: JSON.stringify(referenceEmails),
            reference_contact: JSON.stringify(referenceContacts),
            reference_company: JSON.stringify(referenceCompanies),
            has_been_manager: formData.hasBeenManager,
            mtp_answers: {
              metier: mtpQuestions.metier.map((_, i) => formData[`metier${i + 1}`]),
              talent: mtpQuestions.talent.map((_, i) => formData[`talent${i + 1}`]),
              paradigme: mtpQuestions.paradigme.map((_, i) => formData[`paradigme${i + 1}`]),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId);
        if (updError) throw updError;

        // Mettre à jour aussi le profil candidat en mode édition
        if (user?.id) {
          const profilePayload: Record<string, unknown> = {
            user_id: user.id,
          };
          
          if (formData.gender) profilePayload.gender = formData.gender;
          if (formData.currentPosition) profilePayload.current_position = formData.currentPosition;
          if (formData.yearsOfExperience) profilePayload.years_of_experience = parseInt(formData.yearsOfExperience) || 0;

          const { error: profileError } = await supabase
            .from('candidate_profiles')
            .upsert(profilePayload, { onConflict: 'user_id' });

          if (profileError) {
            console.error('Erreur lors de la mise à jour du profil candidat:', profileError);
          }
        }

        applicationIdForDocs = applicationId;
      } else {
        if (!jobId) throw new Error('Job ID manquant.');
        // Préparer les données de références - chaque champ reçoit une liste ordonnée
        const referenceNames = formData.references.map(ref => ref.fullName);
        const referenceEmails = formData.references.map(ref => ref.email);
        const referenceContacts = formData.references.map(ref => ref.contact);
        const referenceCompanies = formData.references.map(ref => ref.company);
        
        const application = await submitApplication({
          job_offer_id: jobId as string,
          ref_contacts: undefined, // legacy removed
          reference_full_name: JSON.stringify(referenceNames),
          reference_email: JSON.stringify(referenceEmails),
          reference_contact: JSON.stringify(referenceContacts),
          reference_company: JSON.stringify(referenceCompanies),
          has_been_manager: formData.hasBeenManager,
          mtp_answers: {
            metier: mtpQuestions.metier.map((_, i) => formData[`metier${i + 1}`]),
            talent: mtpQuestions.talent.map((_, i) => formData[`talent${i + 1}`]),
            paradigme: mtpQuestions.paradigme.map((_, i) => formData[`paradigme${i + 1}`]),
          },
          profile_data: {
            gender: formData.gender,
            current_position: formData.currentPosition,
            years_of_experience: formData.yearsOfExperience,
            date_of_birth: formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : undefined,
            address: formData.address,
          },
          user_data: {
            matricule: formData.matricule,
            phone: formData.phone,
          },
        });
        applicationIdForDocs = application.id as string;
      }

      // Gérer les documents lors de l'édition ou création
      if (mode === 'edit' && applicationIdForDocs) {
        // En mode édition, supprimer d'abord tous les anciens documents
        await supabase
          .from('application_documents')
          .delete()
          .eq('application_id', applicationIdForDocs);
      }

      const docsPayload: Array<{ application_id: string; document_type: string; file_name: string; file_url: string; file_size: number | null; }> = [];
      
      const toFileUrl = (p: string) => (isPublicUrl(p)) ? p : getFileUrl(p);

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
            file_url: toFileUrl(file.path),
            file_size: file.size ?? null,
          });
        }
      }

      for (const cert of formData.certificates) {
        docsPayload.push({
          application_id: applicationIdForDocs as string,
          document_type: 'diploma',
          file_name: cert.name,
          file_url: toFileUrl(cert.path),
          file_size: cert.size ?? null,
        });
      }

      for (const cert of formData.additionalCertificates) {
        docsPayload.push({
          application_id: applicationIdForDocs as string,
          document_type: 'certificate',
          file_name: cert.name,
          file_url: toFileUrl(cert.path),
          file_size: cert.size ?? null,
        });
      }

      // Les recommandations sont désormais masquées et non traitées

      if (docsPayload.length > 0) {
        const { error: docsError } = await supabase
          .from('application_documents')
          .insert(docsPayload);
        if (docsError) throw docsError;
      }

      // Send confirmation email (non-blocking) - DÉSACTIVÉ
      // try {
      //   // Récupération robuste de l'email du candidat
      //   let toEmail = '';
      //   
      //   // Priorité 1: Email du formulaire
      //   if (formData.email && formData.email.trim()) {
      //     toEmail = formData.email.trim();
      //   }
      //   // Priorité 2: Email de l'utilisateur authentifié
      //   else if (user?.email && user.email.trim()) {
      //     toEmail = user.email.trim();
      //   }
      //   // Priorité 3: Email depuis la base de données
      //   else if (user?.id) {
      //     try {
      //       const { data: dbUser } = await supabase
      //         .from('users')
      //         .select('email')
      //         .eq('id', user.id)
      //         .maybeSingle();
      //     
      //       if (dbUser?.email && dbUser.email.trim()) {
      //         toEmail = dbUser.email.trim();
      //       }
      //     } catch (dbError) {
      //       console.warn('Failed to fetch user email from database:', dbError);
      //     }
      //   }

      //   if (toEmail) {
      //     // L'email est déjà validé par getCandidateEmail

      //     await supabase.functions.invoke('send_application_confirmation', {
      //       body: {
      //       to: toEmail,
      //       firstName: formData.firstName,
      //       jobTitle,
      //       applicationId: applicationIdForDocs,
      //       },
      //     });
      //     
      //     // Afficher une confirmation que l'email a été envoyé
      //     toast.success(`Email de confirmation envoyé à ${toEmail} depuis ${EMAIL_CONFIG.SUPPORT_EMAIL}`, {
      //       duration: 5000,
      //       closeButton: true,
      //     });
      //     
      //     console.log('Confirmation email sent successfully to:', toEmail);
      //   } else {
      //     console.warn('Confirmation email skipped: no valid recipient email found');
      //     toast.warning("Candidature envoyée avec succès, mais aucun email valide n'a été trouvé pour l'envoi de confirmation.", {
      //       duration: 8000,
      //       closeButton: true,
      //     });
      //   }
      // } catch (mailErr) {
      //   console.warn('Failed to send confirmation email (non-blocking):', (mailErr as any)?.message || mailErr);
      //   // Afficher un avertissement si l'email n'a pas pu être envoyé
      //   toast.warning("Candidature envoyée avec succès, mais l'email de confirmation n'a pas pu être envoyé.", {
      //       duration: 8000,
      //       closeButton: true,
      //     });
      //   }

      if (user?.id && isCreateMode) {
        try {
          await supabase.rpc('create_application_notification', {
            p_user_id: user.id,
            p_job_title: jobTitle
          });
        } catch (notificationError) {
          console.warn('Failed to create notification:', notificationError);
          // Do not block submission flow for notification failure
        }
      }

      setIsSubmitted(true);
      toast.success(mode === 'edit' ? "Candidature modifiée avec succès!" : "Candidature envoyée avec succès!", {
        duration: Infinity,
        closeButton: true,
      });
      // Information additionnelle: non-modifiabilité après envoi
      toast.info("Votre candidature a été envoyée et ne sera plus modifiable.", {
        duration: 8000,
        closeButton: true,
      });
      
      // Supprimer le brouillon après un envoi réussi
      if (mode === 'create') {
        try {
          await clearDraft();
          console.log('✅ Brouillon supprimé après soumission réussie');
        } catch (e) {
          console.warn('Failed to delete draft after submit (non-blocking):', (e as any)?.message || e);
        }
      }
      
      // Appeler onSubmit si fourni après un délai
      setTimeout(() => {
        onSubmit?.();
      }, 2000);
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi: " + error.message, {
        duration: Infinity,
        closeButton: true,
      });
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'coverLetter' | 'certificates' | 'additional_certificates') => {
    const files = e.target.files;
    if (!files) return;

    // Validation stricte : seuls les fichiers PDF sont acceptés
    const filesArray = Array.from(files);
    const invalidFiles = filesArray.filter(file => 
      !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
    );
    
    if (invalidFiles.length > 0) {
      toast.error(`Seuls les fichiers PDF sont acceptés. ${invalidFiles.length} fichier(s) invalide(s) détecté(s).`, {
        duration: 5000,
        closeButton: true,
      });
      // Réinitialiser l'input
      e.target.value = '';
      return;
    }

    try {
      if (type === 'cv') {
        const uploadedFile = await uploadFile(files[0], 'cv');
        setFormData({ ...formData, cv: uploadedFile });
        toast.success("CV uploadé avec succès!");
      } else if (type === 'coverLetter') {
        const uploadedFile = await uploadFile(files[0], 'cover-letters');
        setFormData({ ...formData, coverLetter: uploadedFile });
        toast.success("Lettre de motivation uploadée avec succès!");
      } else if (type === 'certificates') {
        const uploadPromises = Array.from(files).map(file => uploadFile(file, 'certificates'));
        const uploadedFiles = await Promise.all(uploadPromises);
        setFormData({ ...formData, certificates: [...formData.certificates, ...uploadedFiles] });
        toast.success("Diplômes uploadés avec succès!");
      } else if (type === 'additional_certificates') {
        const uploadPromises = Array.from(files).map(file => uploadFile(file, 'additional-certificates'));
        const uploadedFiles = await Promise.all(uploadPromises);
        setFormData({ ...formData, additionalCertificates: [...formData.additionalCertificates, ...uploadedFiles] });
        toast.success("Certificats uploadés avec succès!");
      }
    } catch (error: any) {
      toast.error("Erreur lors de l'upload: " + error.message, {
        duration: Infinity,
        closeButton: true,
      });
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
          <div className="max-w-md sm:max-w-lg mx-auto text-center space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success rounded-full flex items-center justify-center mx-auto animate-bounce-soft">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Candidature envoyée !</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2 sm:px-4 leading-relaxed">
              Merci, <strong>{formData.firstName}</strong> ! Nous avons bien reçu votre candidature pour le poste de{" "}
              <strong>{jobTitle}</strong> et nous reviendrons vers vous très prochainement.
            </p>
            <div className="space-y-2 sm:space-y-3 px-2 sm:px-4">
              <Button variant="hero" onClick={onBack} className="w-full bg-white text-blue-600 text-sm sm:text-base py-2 sm:py-3">
                Retour à l'offre
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-sm sm:text-base py-2 sm:py-3"
                onClick={() => navigate('/candidate/applications')}
              >
                Voir mes candidatures
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Si l'utilisateur n'est pas éligible, afficher l'alerte et empêcher la candidature
  if (!isEligible) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
          <div className="max-w-2xl mx-auto">
            <CampaignEligibilityAlert className="mb-6" />
            <div className="text-center">
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'offre
              </Button>
            </div>
          </div>
        </div>
      </div>
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
            className="mb-3 sm:mb-4 text-blue-600 bg-white text-sm sm:text-base"
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
              Découvrez un processus de candidature innovant qui valorise vos compétences, 
              votre potentiel et votre ambition.
            </p>
            
            {/* Indicateur de sauvegarde pour les brouillons */}
            {mode === 'create' && (
              <div className="flex justify-center mt-4">
                <DraftSaveIndicator 
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                  className="bg-white/20 text-white border-white/30"
                />
              </div>
            )}
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

        {/* Notification de restauration de brouillon */}
        {showDraftRestore && lastSaved && (
          <div className="max-w-4xl mx-auto mb-6">
            <DraftRestoreNotification
              onRestore={restoreDraft}
              onIgnore={ignoreDraft}
              lastSaved={lastSaved}
            />
          </div>
        )}

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
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Guide de candidature</h3>
                    <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      <p className="mb-2 whitespace-nowrap">Ce formulaire se déroule en 4 étapes :</p>
                      <ul className="list-disc list-inside space-y-1 text-left inline-block">
                        <li>Renseignez vos informations ;</li>
                        <li>Ajoutez vos documents clés ;</li>
                        <li>Indiquez votre adhérence MTP (Métier, Talent, Paradigme) ;</li>
                        <li>Vérifiez et soumettez votre candidature.</li>
                      </ul>
                    </div>
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
                <div className="space-y-4 animate-fade-in py-2">
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
                      onChange={(e) => {
                        const email = e.target.value;
                        setFormData({ ...formData, email });
                        // Validation du format email
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (email && !emailRegex.test(email)) {
                          e.target.setCustomValidity('Veuillez entrer une adresse email valide');
                        } else {
                        e.target.setCustomValidity('');
                        }
                      }}
                      onBlur={(e) => {
                        // Validation supplémentaire lors de la perte de focus - DÉSACTIVÉ
                        // const email = e.target.value.trim();
                        // if (email) {
                        //   const errorMessage = getEmailErrorMessage(email);
                        //   e.target.setCustomValidity(errorMessage || '');
                        // }
                        // Validation désactivée
                      }}
                      placeholder="votre.email@exemple.com"
                      required
                      aria-describedby="email-help"
                    />
                    <p id="email-help" className="text-xs text-muted-foreground mt-1">
                      Cet email sera utilisé pour votre profil (envoi de confirmation désactivé)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().slice(0, 10) : ""}
                      max="2007-12-31"
                      min="1900-01-01"
                      onChange={(e) => {
                        const val = e.target.value;
                        const birthDate = val ? new Date(val) : null;
                        
                        // Contrôle d'âge minimum 18 ans (année <= 2007)
                        if (birthDate && birthDate.getFullYear() > 2007) {
                          e.target.setCustomValidity('Vous devez avoir au moins 18 ans');
                        } else {
                          e.target.setCustomValidity('');
                        }
                        
                        setFormData({ ...formData, dateOfBirth: birthDate });
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
                  <div>
                    <Label htmlFor="yearsOfExperience">Années d'expérience à la SEEG ou dans un secteur similaire *</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      min="0"
                      max="60"
                      value={formData.yearsOfExperience}
                      onChange={(e) => {
                        const val = e.target.value;
                        const numVal = val === '' ? '' : Math.max(0, Math.min(60, parseInt(val) || 0)).toString();
                        setFormData({ ...formData, yearsOfExperience: numVal });
                      }}
                      placeholder="Ex: 5"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Experience & Documents */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in pt-4">
                  <div>
                    <Label htmlFor="coverLetter">Lettre de motivation *</Label>
                    <div className="mt-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary transition-colors" aria-busy={isUploading} aria-live="polite">
                        {isUploading ? (
                          <Spinner size="lg" text="Upload en cours..." />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              {formData.coverLetter ? formData.coverLetter.name : "Glissez votre lettre de motivation ici ou cliquez pour parcourir"}
                            </p>
                            <p className="text-xs text-orange-500">Format accepté : PDF uniquement</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e, 'coverLetter')}
                          className="hidden"
                          id="cover-letter-upload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => document.getElementById('cover-letter-upload')?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Upload..." : "Choisir un fichier"}
                        </Button>
                        {formData.coverLetter && (
                          <div className="mt-3 flex items-center justify-between bg-muted p-2 rounded text-sm">
                            <span>{formData.coverLetter.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                await safeDeleteStorageFile(formData.coverLetter?.path);
                                setFormData({ ...formData, coverLetter: null });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cv">Votre CV *</Label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary transition-colors" aria-busy={isUploading} aria-live="polite">
                        {isUploading ? (
                          <Spinner size="lg" text="Upload en cours..." />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              {formData.cv ? formData.cv.name : "Glissez votre CV ici ou cliquez pour parcourir"}
                            </p>
                            <p className="text-xs text-orange-500">Format accepté : PDF uniquement</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf"
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

                  <div>
                    <Label htmlFor="diplomas">Diplômes *</Label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary transition-colors" aria-busy={isUploading} aria-live="polite">
                        {isUploading ? (
                          <Spinner size="lg" text="Upload en cours..." />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Glissez vos diplômes ici ou cliquez pour parcourir (plusieurs fichiers acceptés)
                            </p>
                            <p className="text-xs text-orange-500">Format accepté : PDF uniquement</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'certificates')}
                          className="hidden"
                          id="diplomas-upload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => document.getElementById('diplomas-upload')?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Upload..." : "Choisir des fichiers"}
                        </Button>
                        {formData.certificates && formData.certificates.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {formData.certificates.map((cert, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                                <span>{cert.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    await safeDeleteStorageFile(cert.path);
                                    const newCerts = formData.certificates.filter((_, i) => i !== index);
                                    setFormData({ ...formData, certificates: newCerts });
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalCertificates">Certificats supplémentaires (facultatif)</Label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary transition-colors" aria-busy={isUploading} aria-live="polite">
                        {isUploading ? (
                          <Spinner size="lg" text="Upload en cours..." />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Certificats professionnels, formations, etc. (plusieurs fichiers acceptés)
                            </p>
                            <p className="text-xs text-orange-500">Format accepté : PDF uniquement</p>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'additional_certificates')}
                          className="hidden"
                          id="additional-certificates-upload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => document.getElementById('additional-certificates-upload')?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Upload..." : "Choisir des fichiers"}
                        </Button>
                        {formData.additionalCertificates && formData.additionalCertificates.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {formData.additionalCertificates.map((cert, index) => (
                              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                                <span>{cert.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    await safeDeleteStorageFile(cert.path);
                                    const newCerts = formData.additionalCertificates.filter((_, i) => i !== index);
                                    setFormData({ ...formData, additionalCertificates: newCerts });
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section Expérience de manager - uniquement pour les offres internes */}
                  {isInternalOffer && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Expérience professionnelle</h4>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium leading-relaxed">
                          Avez vous déjà eu, pour ce métier, l'une des expériences suivantes :
                        </Label>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Chef de service ;</li>
                          <li>• Chef de division ou équivalent ;</li>
                          <li>• Directeur ;</li>
                          <li>• Senior/Expert avec au moins 5 ans d'expérience ?</li>
                        </ul>
                        
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="hasBeenManager"
                              value="true"
                              checked={formData.hasBeenManager === true}
                              onChange={(e) => setFormData({ ...formData, hasBeenManager: e.target.value === 'true' ? true : null })}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">Oui</span>
                          </label>
                          
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="hasBeenManager"
                              value="false"
                              checked={formData.hasBeenManager === false}
                              onChange={(e) => setFormData({ ...formData, hasBeenManager: e.target.value === 'false' ? false : null })}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">Non</span>
                          </label>
                        </div>
                      </div>
                      {formData.hasBeenManager === null && (
                        <p className="text-xs text-orange-600 mt-2">
                          ⚠️ Veuillez répondre à cette question pour continuer
                        </p>
                      )}
                    </div>
                  )}

                  {/* Section Recommandations - uniquement pour les offres externes */}
                  {isExternalOffer && (
                    <ReferenceSection
                      references={formData.references}
                      onAddReference={(newReference) => {
                        setFormData({
                          ...formData,
                          references: [...formData.references, newReference]
                        });
                      }}
                      onEditReference={(id, updatedReference) => {
                        setFormData({
                          ...formData,
                          references: formData.references ? formData.references.map(ref =>
                            ref.id === id ? updatedReference : ref
                          ) : []
                        });
                      }}
                      onDeleteReference={(id) => {
                        setFormData({
                          ...formData,
                          references: formData.references ? formData.references.filter(ref => ref.id !== id) : []
                        });
                      }}
                    />
                  )}
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
                            whitespace-nowrap py-2 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[120px]`}
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
                            whitespace-nowrap py-2 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[120px]`}
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
                            whitespace-nowrap py-2 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[120px]`}
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
                          Métier
                        </h4>
                        <div className="space-y-3 sm:space-y-4">
                          {mtpQuestions.metier.map((q, i) => (
                            <div key={i}>
                              <Label htmlFor={`metier${i + 1}`} className="text-sm sm:text-base">{q}</Label>
                              <Textarea
                                id={`metier${i + 1}`}
                                value={formData[`metier${i + 1}`]}
                                onChange={(e) => setFormData({ ...formData, [`metier${i + 1}`]: e.target.value })}
                                placeholder="Votre réponse..."
                                className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Onglet Talent */}
                    {activeTab === 'talent' && (
                      <div className="bg-green-50 rounded-lg p-3 sm:p-4 lg:p-6 border border-green-200 animate-fade-in">
                        <h4 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4 flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">T</div>
                          Talent
                        </h4>
                        
                        <div className="space-y-3 sm:space-y-4">
                          {mtpQuestions.talent.map((q, i) => (
                            <div key={i}>
                              <Label htmlFor={`talent${i + 1}`} className="text-sm sm:text-base">{q}</Label>
                              <Textarea
                                id={`talent${i + 1}`}
                                value={formData[`talent${i + 1}`]}
                                onChange={(e) => setFormData({ ...formData, [`talent${i + 1}`]: e.target.value })}
                                placeholder="Votre réponse..."
                                className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Onglet Paradigme */}
                    {activeTab === 'paradigme' && (
                      <div className="bg-purple-50 rounded-lg p-3 sm:p-4 lg:p-6 border border-purple-200 animate-fade-in">
                        <h4 className="text-base sm:text-lg font-semibold text-purple-800 mb-3 sm:mb-4 flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">P</div>
                          Paradigme
                        </h4>
                        
                        <div className="space-y-3 sm:space-y-4">
                          {mtpQuestions.paradigme.map((q, i) => (
                            <div key={i}>
                              <Label htmlFor={`paradigme${i + 1}`} className="text-sm sm:text-base">{q}</Label>
                              <Textarea
                                id={`paradigme${i + 1}`}
                                value={formData[`paradigme${i + 1}`]}
                                onChange={(e) => setFormData({ ...formData, [`paradigme${i + 1}`]: e.target.value })}
                                placeholder="Votre réponse..."
                                className="min-h-[60px] sm:min-h-[80px] mt-1 sm:mt-2 text-sm sm:text-base"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
  
              {/* Navigation pour étapes 1 à 3 */}
              {currentStep < 4 && (
                <div className="mt-6">
                  {/* Message de validation si des champs manquent */}
                  {isNextButtonDisabled() && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 flex items-center gap-2">
                        <span className="text-orange-600">⚠️</span>
                        {getValidationMessage()}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
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
                      disabled={isNextButtonDisabled()}
                    >
                      Suivant
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
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
                          <span className="text-muted-foreground">Sexe:</span>
                          <p>{formData.gender || "Non renseigné"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Poste actuel:</span>
                          <p>{formData.currentPosition || "Non renseigné"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Années d'expérience:</span>
                          <p>{formData.yearsOfExperience || "Non renseigné"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Parcours & Documents</h5>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>Modifier</Button>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CV:</span>
                        <p>{formData.cv ? formData.cv.name : "Non fourni"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lettre de motivation:</span>
                        <p>{formData.coverLetter ? formData.coverLetter.name : "Non fournie"}</p>
                      </div>
                      {/* Sections cachées non affichées en récapitulatif: intégrité et idée de projet */}
                      <div>
                        <span className="text-muted-foreground">Diplômes:</span>
                        <p>{formData.certificates ? formData.certificates.length : 0} fichier(s)</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Certificats</span>
                        <p>{formData.additionalCertificates ? formData.additionalCertificates.length : 0} fichier(s)</p>
                      </div>
                      {/* Sections cachées non affichées: lettres de recommandation */}
                    </div>

                    {/* Expérience de manager - uniquement pour les offres internes */}
                    {isInternalOffer && (
                      <div className="bg-muted rounded-lg p-4 mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">Expérience professionnelle</h5>
                          <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>Modifier</Button>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Avez-vous déjà été chef/manager ?</span>
                          <p className="font-medium mt-1">
                            {formData.hasBeenManager === true && "✅ Oui"}
                            {formData.hasBeenManager === false && "❌ Non"}
                            {formData.hasBeenManager === null && "Non renseigné"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Recommandations - uniquement pour les offres externes */}
                    {isExternalOffer && (
                    <div className="bg-muted rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Recommandations</h5>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>Modifier</Button>
                      </div>
                      <div className="text-sm">
                        {formData.references && formData.references.length > 0 ? (
                          <div className="space-y-3">
                            {formData.references.map((ref) => (
                              <div key={ref.id} className="p-3 bg-white rounded border space-y-1">
                                <div className="font-medium text-base">{ref.fullName}</div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {ref.email}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {ref.contact}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {ref.company}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Aucune recommandation renseignée</p>
                        )}
                      </div>
                    </div>
                    )}

                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Adhérence MTP au poste</h5>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)}>Modifier</Button>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Métier:</span>
                        <p className="text-xs">
                          {mtpQuestions.metier.map((_, i) => formData[`metier${i+1}`]).filter(Boolean).length}/{mtpQuestions.metier.length} questions répondues
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Talent:</span>
                        <p className="text-xs">
                          {mtpQuestions.talent.map((_, i) => formData[`talent${i+1}`]).filter(Boolean).length}/{mtpQuestions.talent.length} questions répondues
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Paradigme:</span>
                        <p className="text-xs">
                          {mtpQuestions.paradigme.map((_, i) => formData[`paradigme${i+1}`]).filter(Boolean).length}/{mtpQuestions.paradigme.length} questions répondues
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
                      conformément à la <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-blue-700 hover:text-blue-800">politique de confidentialité</Link>.
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
                      disabled={!formData.consent || isApplicationClosed()}
                      title={isApplicationClosed() ? "Les candidatures sont closes" : ""}
                    >
                      {isApplicationClosed() ? (
                        <span className="hidden sm:inline">Candidatures closes</span>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Envoyer ma candidature</span>
                          <span className="sm:hidden">Envoyer</span>
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
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



