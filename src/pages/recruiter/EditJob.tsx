import { useState, useEffect, Fragment } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Save, Loader2, Trash2, Send } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useJobOffer, type JobOffer } from "@/hooks/useJobOffers";
import { useCreateJobOffer } from "@/hooks/useRecruiterDashboard";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { MTPQuestionsEditor } from "@/components/forms/MTPQuestionsEditor";
import { getMetierQuestionsForTitle, defaultMTPQuestionsExternes, defaultMTPQuestionsInternes } from "@/data/metierQuestions";

// Utiliser la même interface que pour la création pour l'harmonie
interface JobFormData {
  title: string;
  location: string;
  contractType: string;
  categorieMetier: string;
  dateLimite: string;
  reportingLine: string;
  jobGrade: string;
  salaryNote: string;
  startDate: string;
  statusOfferts: string;
  campaignId: string; // ID de la campagne choisie
  responsibilities: string; 
  requirements: string;
}

export default function EditJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const jobOfferQuery = useJobOffer(id as string);
  const jobOffer = jobOfferQuery.data as JobOffer | null;
  const isLoadingJob = jobOfferQuery.isLoading;
  const errorJob = jobOfferQuery.error;
  const { updateJobOffer, isUpdating, deleteJobOffer, isDeleting } = useCreateJobOffer();

  const STORAGE_KEY = `editJobDraft_${id}`;

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    location: "",
    contractType: "",
    categorieMetier: "",
    dateLimite: "",
    reportingLine: "",
    jobGrade: "",
    salaryNote: "",
    startDate: "",
    statusOfferts: "",
    campaignId: "2", // Campagne 2 par défaut
    responsibilities: "",
    requirements: ""
  });

  // État pour activer/désactiver l'offre
  const [isActive, setIsActive] = useState(true);

  // États pour les questions MTP
  const [mtpQuestionsMetier, setMtpQuestionsMetier] = useState<string[]>([]);
  const [mtpQuestionsTalent, setMtpQuestionsTalent] = useState<string[]>([]);
  const [mtpQuestionsParadigme, setMtpQuestionsParadigme] = useState<string[]>([]);
  
  const [dataLoaded, setDataLoaded] = useState(false); // Flag pour savoir si les données ont été chargées

  // Debug: Logger l'état du formulaire à chaque changement
  useEffect(() => {
    // console.log('[EditJob DEBUG] FormData state updated:', formData);
  }, [formData]);

  useEffect(() => {
    if (jobOffer && !dataLoaded) {
      // console.log('[EditJob DEBUG] JobOffer data received:', jobOffer);
      
      // Vérifier s'il y a des modifications locales sauvegardées
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const savedTime = new Date(parsed.timestamp).getTime();
          const dbTime = new Date(jobOffer.updated_at).getTime();
          
          // Si le brouillon local est plus récent que la DB, proposer de restaurer
          if (savedTime > dbTime) {
            const confirmRestore = window.confirm(
              'Des modifications non sauvegardées ont été trouvées. Voulez-vous les restaurer ?'
            );
            
            if (confirmRestore) {
              setFormData(parsed.formData);
              setIsActive(parsed.isActive ?? true);
              setMtpQuestionsMetier(parsed.mtpQuestionsMetier || []);
              setMtpQuestionsTalent(parsed.mtpQuestionsTalent || []);
              setMtpQuestionsParadigme(parsed.mtpQuestionsParadigme || []);
              setDataLoaded(true);
              toast({
                title: "Modifications restaurées",
                description: "Vos changements non sauvegardés ont été récupérés.",
              });
              return;
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        }
      } catch (e) {
        console.warn('Erreur lors de la restauration:', e);
      }
      
      // Prioriser le contenu HTML existant (description/profile) même s'il est vide
      const responsibilitiesContent = jobOffer.description && jobOffer.description.trim() !== ""
        ? jobOffer.description
        : Array.isArray(jobOffer.responsibilities) 
          ? `<ul>${jobOffer.responsibilities.map(item => `<li>${item}</li>`).join('')}</ul>` 
          : (jobOffer.responsibilities || "");
        
      const requirementsContent = jobOffer.profile && jobOffer.profile.trim() !== ""
        ? jobOffer.profile
        : Array.isArray(jobOffer.requirements) 
          ? `<ul>${jobOffer.requirements.map(item => `<li>${item}</li>`).join('')}</ul>` 
          : (jobOffer.requirements || "");
      
      setFormData({
        title: jobOffer.title || "",
        location: Array.isArray(jobOffer.location) ? jobOffer.location[0] || "" : jobOffer.location || "",
        contractType: jobOffer.contract_type || "",
        responsibilities: responsibilitiesContent,
        requirements: requirementsContent,
        reportingLine: jobOffer.reporting_line || "",
        jobGrade: jobOffer.job_grade || "",
        salaryNote: jobOffer.salary_note || "",
        categorieMetier: jobOffer.categorie_metier || "",
        statusOfferts: jobOffer.status_offerts || "",
        campaignId: jobOffer.campaign_id ? String(jobOffer.campaign_id) : "2", // Charger le campaign_id existant
        startDate: jobOffer.start_date ? format(parseISO(jobOffer.start_date), 'yyyy-MM-dd') : "",
        dateLimite: jobOffer.date_limite ? format(parseISO(jobOffer.date_limite), 'yyyy-MM-dd') : "",
      });

      // Charger le statut actif/inactif
      setIsActive(jobOffer.status === 'active');
      
      setDataLoaded(true);

      // Charger les questions MTP
      // console.log('[EditJob DEBUG] MTP questions from DB:', {
      //   metier: jobOffer.mtp_questions_metier,
      //   talent: jobOffer.mtp_questions_talent,
      //   paradigme: jobOffer.mtp_questions_paradigme
      // });
      
      // Si les questions sont vides en base, charger depuis le code (migration)
      const hasMetierInDb = Array.isArray(jobOffer.mtp_questions_metier) && jobOffer.mtp_questions_metier.length > 0;
      const hasTalentInDb = Array.isArray(jobOffer.mtp_questions_talent) && jobOffer.mtp_questions_talent.length > 0;
      const hasParadigmeInDb = Array.isArray(jobOffer.mtp_questions_paradigme) && jobOffer.mtp_questions_paradigme.length > 0;
      
      if (!hasMetierInDb || !hasTalentInDb || !hasParadigmeInDb) {
        // console.log('[EditJob] Questions vides en base, chargement depuis le code...');
        
        // Déterminer les questions par défaut selon le statut et le titre
        let defaultQuestions;
        if (jobOffer.status_offerts === 'externe') {
          defaultQuestions = defaultMTPQuestionsExternes;
          // console.log('[EditJob] Offre externe : 7 questions Métier, 3 Talent, 3 Paradigme');
        } else {
          defaultQuestions = defaultMTPQuestionsInternes;
          // console.log('[EditJob] Offre interne : 3 questions Métier, 3 Talent, 3 Paradigme');
        }
        
        setMtpQuestionsMetier(!hasMetierInDb ? defaultQuestions.metier : jobOffer.mtp_questions_metier);
        setMtpQuestionsTalent(!hasTalentInDb ? defaultQuestions.talent : jobOffer.mtp_questions_talent);
        setMtpQuestionsParadigme(!hasParadigmeInDb ? defaultQuestions.paradigme : jobOffer.mtp_questions_paradigme);
        
        // console.log('[EditJob] Questions chargées:', {
        //   metier: defaultQuestions.metier.length,
        //   talent: defaultQuestions.talent.length,
        //   paradigme: defaultQuestions.paradigme.length
        // });
      } else {
        // Charger directement depuis la base
        setMtpQuestionsMetier(jobOffer.mtp_questions_metier);
        setMtpQuestionsTalent(jobOffer.mtp_questions_talent);
        setMtpQuestionsParadigme(jobOffer.mtp_questions_paradigme);
        // console.log('[EditJob] Questions chargées depuis la base de données');
      }
    }
  }, [jobOffer]);

  // Sauvegarde automatique dans localStorage (après chargement initial)
  useEffect(() => {
    if (!dataLoaded) return; // Ne pas sauvegarder avant le chargement initial

    const timeoutId = setTimeout(() => {
      try {
        const dataToSave = {
          formData,
          isActive,
          mtpQuestionsMetier,
          mtpQuestionsTalent,
          mtpQuestionsParadigme,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        // console.log('💾 [EditJob] Modifications auto-sauvegardées');
      } catch (e) {
        console.warn('Erreur lors de la sauvegarde auto:', e);
      }
    }, 2000); // Sauvegarde après 2 secondes d'inactivité

    return () => clearTimeout(timeoutId);
  }, [formData, isActive, mtpQuestionsMetier, mtpQuestionsTalent, mtpQuestionsParadigme, dataLoaded]);

  const handlePublish = async () => {
    if (!id) return;

    // Validation complète pour publication
    if (!formData.title || !formData.location || !formData.contractType || 
        !formData.statusOfferts || !formData.responsibilities || !formData.requirements) {
      toast({
        title: "Champs requis pour publication",
        description: "Veuillez remplir tous les champs obligatoires avant de publier.",
        variant: "destructive",
      });
      return;
    }

    // Forcer le status à 'active' lors de la publication
    await performUpdate('active');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Pour une sauvegarde normale, garder le status actuel ou utiliser le switch
    const newStatus = jobOffer?.status === 'draft' 
      ? 'draft'  // Garder en brouillon si c'était déjà un brouillon
      : (isActive ? 'active' : 'inactive'); // Sinon utiliser le switch

    await performUpdate(newStatus);
  };

  const performUpdate = async (statusToSet: string) => {
    if (!id) return;

    const jobDataToUpdate = {
      title: formData.title,
      location: formData.location,
      contract_type: formData.contractType,
      description: formData.responsibilities, // Le contenu HTML devient la description
      profile: formData.requirements, // Le contenu HTML devient le profil
      categorie_metier: formData.categorieMetier || null,
      date_limite: formData.dateLimite ? new Date(formData.dateLimite).toISOString() : null,
      reporting_line: formData.reportingLine || null,
      job_grade: formData.jobGrade || null,
      salary_note: formData.salaryNote || null,
      status_offerts: formData.statusOfferts || null,
      status: statusToSet, // Utiliser le status passé en paramètre
      start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      campaign_id: formData.campaignId ? parseInt(formData.campaignId) : null, // Campagne choisie manuellement
      // Questions MTP
      mtp_questions_metier: mtpQuestionsMetier.filter(q => q.trim() !== ''),
      mtp_questions_talent: mtpQuestionsTalent.filter(q => q.trim() !== ''),
      mtp_questions_paradigme: mtpQuestionsParadigme.filter(q => q.trim() !== ''),
      // Ne pas envoyer les champs HTML vers les colonnes array de la DB
      // responsibilities: formData.responsibilities, 
      // requirements: formData.requirements,
    };

    try {
      // Ensure we pass the string ID, not the params object
      if (typeof id !== 'string') {
        console.error("L'ID de l'offre est invalide.");
        return;
      }
      await updateJobOffer({ jobId: id, jobData: jobDataToUpdate });
      
      // Supprimer le brouillon du localStorage après sauvegarde réussie
      try {
        localStorage.removeItem(STORAGE_KEY);
        // console.log('🗑️ [EditJob] Brouillon localStorage supprimé après sauvegarde');
      } catch (e) {
        console.warn('Erreur lors de la suppression du brouillon:', e);
      }
      
      toast({
        title: "Offre modifiée",
        description: "L'offre d'emploi a été mise à jour avec succès.",
        variant: "default",
      });
      navigate("/recruiter");
    } catch (error) {
      // Log console pour diagnostic immédiat (y compris sérialisation JSON)
      const serial = (() => {
        try { return JSON.stringify(error); } catch { return String(error); }
      })();
      console.error('[EditJob] Update error:', error, serial);
      // Extraire les champs utiles de Supabase si présents
      const anyErr = error as unknown as { message?: string; details?: string; hint?: string; code?: string } | undefined;
      const parts = [anyErr?.message, anyErr?.details, anyErr?.hint, anyErr?.code].filter(Boolean);
      const message = parts.join(' | ') || (error instanceof Error ? error.message : typeof error === 'string' ? error : serial);
      toast({
        title: "Erreur de mise à jour",
        description: message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {

    // S'assurer que l'ID est bien une chaîne et non un objet de params
    if (typeof id !== 'string') {
      console.error("ID d'offre invalide pour la suppression", id);
      return;
    }

    deleteJobOffer({
      jobId: id,
      onSuccess: () => {
        toast({
          title: "Offre supprimée",
          description: "L'offre d'emploi a été supprimée avec succès.",
          variant: "default",
        });
        navigate("/recruiter");
      },
      onError: (err) => {
        // Log console pour diagnostic immédiat (y compris sérialisation JSON)
        const serial = (() => {
          try { return JSON.stringify(err); } catch { return String(err); }
        })();
        console.error('[EditJob] Delete error:', err, serial);
        // Extraire les champs utiles de Supabase si présents
        const anyErr = err as unknown as { message?: string; details?: string; hint?: string; code?: string } | undefined;
        const parts = [anyErr?.message, anyErr?.details, anyErr?.hint, anyErr?.code].filter(Boolean);
        const message = parts.join(' | ') || (err instanceof Error ? err.message : typeof err === 'string' ? err : serial);
        toast({
          title: "Erreur de suppression",
          description: message || "Une erreur est survenue. Veuillez réessayer.",
          variant: "destructive",
        });
      },
    });
  };

  const handleInputChange = (field: keyof Omit<JobFormData, 'responsibilities' | 'requirements'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuillChange = (field: 'responsibilities' | 'requirements', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoadingJob) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </RecruiterLayout>
    );
  }

  if (errorJob || !jobOffer) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Offre non trouvée</h1>
            <Link to="/recruiter">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </Link>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link to="/recruiter">
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
              Modifier l'offre d'emploi
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Modifiez les détails de votre offre d'emploi
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-4xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Informations de l'offre</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Informations de base */}
              {/* Première ligne - Intitulé du poste */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm sm:text-base">Intitulé du poste *</Label>
                <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Ex: Développeur Full-Stack" required className="text-sm sm:text-base" />
              </div>

              {/* Deuxième ligne - Ligne hiérarchique et Type de contrat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reportingLine" className="text-sm sm:text-base">Ligne hiérarchique directe</Label>
                  <Input id="reportingLine" value={formData.reportingLine} onChange={(e) => handleInputChange("reportingLine", e.target.value)} placeholder="Ex: Chef de Département Support" className="text-sm sm:text-base" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType" className="text-sm sm:text-base">Type de contrat *</Label>
                  <Select value={formData.contractType} onValueChange={(value) => handleInputChange("contractType", value)} required>
                    <SelectTrigger className="text-sm sm:text-base"><SelectValue placeholder="Type de contrat" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI avec période d'essai">CDI avec période d'essai</SelectItem>
                      <SelectItem value="CDI">CDI (Contrat à Durée Indéterminée)</SelectItem>
                      <SelectItem value="CDD">CDD (Contrat à Durée Déterminée)</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Troisième ligne - Catégorie et Salaire brut */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="categorieMetier">Catégorie *</Label>
                  <Select value={formData.categorieMetier} onValueChange={(value) => handleInputChange("categorieMetier", value)} required>
                    <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cadre">Cadre</SelectItem>
                      <SelectItem value="Cadre directeur">Cadre de Direction </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryNote">Salaire brut</Label>
                  <Input id="salaryNote" value={formData.salaryNote} onChange={(e) => handleInputChange("salaryNote", e.target.value)} placeholder="Ex: Selon grille salariale SEEG" />
                </div>
              </div>

              {/* Ligne Statut - Interne/Externe et Campagne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="statusOfferts">Statut de l'offre *</Label>
                  <Select value={formData.statusOfferts} onValueChange={(value) => handleInputChange("statusOfferts", value)} required>
                    <SelectTrigger><SelectValue placeholder="Choisir le statut" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interne">Interne</SelectItem>
                      <SelectItem value="externe">Externe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignId">Campagne de recrutement *</Label>
                  <Select value={formData.campaignId} onValueChange={(value) => handleInputChange("campaignId", value)} required>
                    <SelectTrigger><SelectValue placeholder="Choisir une campagne" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Campagne 1</SelectItem>
                      <SelectItem value="2">Campagne 2</SelectItem>
                      <SelectItem value="3">Campagne 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ligne Activation */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="isActive">Activer l'offre</Label>
                  <div className="flex items-center gap-3 h-10">
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <span className="text-sm text-muted-foreground">
                      {isActive ? "✓ Offre active (visible)" : "✗ Offre inactive (masquée)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quatrième ligne - Date d'embauche et Lieu de travail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date d'embauche</Label>
                  <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleInputChange("startDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu de travail *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)} required>
                    <SelectTrigger><SelectValue placeholder="Choisir une ville" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Libreville">Libreville</SelectItem>
                      <SelectItem value="Port-Gentil">Port-Gentil</SelectItem>
                      <SelectItem value="Franceville">Franceville</SelectItem>
                      <SelectItem value="Oyem">Oyem</SelectItem>
                      <SelectItem value="Moanda">Moanda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cinquième ligne - Date limite */}
              <div className="space-y-2">
                <Label htmlFor="dateLimite">Date limite de candidature</Label>
                <Input id="dateLimite" type="date" value={formData.dateLimite} onChange={(e) => handleInputChange("dateLimite", e.target.value)} />
              </div>

              {/* Missions principales */}
              <div className="space-y-2">
                <Label htmlFor="responsibilities">Missions principales *</Label>
                <ReactQuill theme="snow" value={formData.responsibilities} onChange={(value) => handleQuillChange("responsibilities", value)} className="bg-white quill-editor-container" />
              </div>

              {/* Connaissance savoir et requis */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Connaissance savoir et requis *</Label>
                <ReactQuill theme="snow" value={formData.requirements} onChange={(value) => handleQuillChange("requirements", value)} className="bg-white quill-editor-container" />
              </div>

              {/* Questions MTP */}
              <MTPQuestionsEditor
                metierQuestions={mtpQuestionsMetier}
                talentQuestions={mtpQuestionsTalent}
                paradigmeQuestions={mtpQuestionsParadigme}
                onMetierChange={setMtpQuestionsMetier}
                onTalentChange={setMtpQuestionsTalent}
                onParadigmeChange={setMtpQuestionsParadigme}
                statusOfferts={formData.statusOfferts}
              />

              {/* Actions */}
              <div className="flex justify-between items-center gap-4 pt-6">
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2" disabled={isDeleting}>
                        <Trash2 className="w-4 h-4" />
                        Supprimer l'offre
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. L'offre d'emploi sera marquée comme "fermée" et ne sera plus visible par les candidats.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? (
                            <Fragment>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Suppression...
                            </Fragment>
                          ) : 'Confirmer la suppression'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="flex gap-2">
                  <Link to="/recruiter">
                    <Button variant="outline">Annuler</Button>
                  </Link>
                  <Button type="submit" variant="outline" className="gap-2" disabled={isUpdating || isDeleting}>
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  {jobOffer?.status === 'draft' && (
                    <Button 
                      type="button" 
                      variant="success" 
                      className="gap-2" 
                      onClick={handlePublish}
                      disabled={isUpdating || isDeleting || !formData.title || !formData.location || !formData.contractType || !formData.statusOfferts || !formData.responsibilities || !formData.requirements}
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Publier l'offre
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  );
}