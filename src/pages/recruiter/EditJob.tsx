import { useState, useEffect, Fragment } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Save, Loader2, Trash2, CalendarIcon } from "lucide-react";
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

// Utiliser la même interface que pour la création pour l'harmonie
interface JobFormData {
  title: string;
  location: string;
  contractType: string;
  description: string;
  profile: string;
  categorieMetier: string;
  dateLimite: string;
  reportingLine: string;
  jobGrade: string;
  salaryNote: string;
  startDate: string;
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

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    location: "",
    contractType: "",
    description: "",
    profile: "",
    categorieMetier: "",
    dateLimite: "",
    reportingLine: "",
    jobGrade: "",
    salaryNote: "",
    startDate: "",
    responsibilities: "",
    requirements: ""
  });

  useEffect(() => {
    if (jobOffer) {
      setFormData({
        title: jobOffer.title || "",
        location: jobOffer.location || "",
        contractType: jobOffer.contract_type || "",
        description: jobOffer.description || "",
        profile: jobOffer.profile || "",
        responsibilities: (jobOffer.responsibilities || []).join("\n"),
        requirements: (jobOffer.requirements || []).join("\n"),
        reportingLine: jobOffer.reporting_line || "",
        jobGrade: jobOffer.job_grade || "",
        salaryNote: jobOffer.salary_note || "",
        categorieMetier: jobOffer.categorie_metier || "",
        startDate: jobOffer.start_date ? format(parseISO(jobOffer.start_date), 'yyyy-MM-dd') : "",
        dateLimite: jobOffer.date_limite ? format(parseISO(jobOffer.date_limite), 'yyyy-MM-dd') : "",
      });
    }
  }, [jobOffer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const toList = (text: string) => text.split(/\r?\n|\u2022|-/).map(s => s.trim()).filter(Boolean);

    const jobDataToUpdate = {
      title: formData.title,
      location: formData.location,
      contract_type: formData.contractType,
      description: formData.description,
      profile: formData.profile,
      categorie_metier: formData.categorieMetier || null,
      date_limite: formData.dateLimite ? new Date(formData.dateLimite).toISOString() : null,
      reporting_line: formData.reportingLine || null,
      job_grade: formData.jobGrade || null,
      salary_note: formData.salaryNote || null,
      start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      responsibilities: toList(formData.responsibilities),
      requirements: toList(formData.requirements),
    };

    try {
      // Ensure we pass the string ID, not the params object
      if (typeof id !== 'string') {
        console.error("L'ID de l'offre est invalide.");
        return;
      }
      await updateJobOffer({ jobId: id, jobData: jobDataToUpdate });
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

  const handleInputChange = (field: keyof JobFormData, value: string) => {
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
                      <SelectItem value="Cadre directeur">Cadre directeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryNote">Salaire brut</Label>
                  <Input id="salaryNote" value={formData.salaryNote} onChange={(e) => handleInputChange("salaryNote", e.target.value)} placeholder="Ex: Selon grille salariale SEEG" />
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
                <Input id="dateLimite" type="date" value={formData.dateLimite} onChange={(e) => handleInputChange("dateLimite", e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>

              {/* Missions principales */}
              <div className="space-y-2">
                <Label htmlFor="responsibilities">Missions principales *</Label>
                <Textarea id="responsibilities" value={formData.responsibilities} onChange={(e) => handleInputChange("responsibilities", e.target.value)} placeholder={"Saisissez une mission par ligne\nEx:\n- Définir et piloter la politique RH\n- Élaborer et superviser la gestion administrative du personnel"} className="min-h-[180px]" required />
              </div>

              {/* Connaissance savoir et requis */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Connaissance savoir et requis *</Label>
                <Textarea id="requirements" value={formData.requirements} onChange={(e) => handleInputChange("requirements", e.target.value)} placeholder={"Saisissez un requis par ligne\nEx:\n- Bac+5 en RH, Droit social, Psychologie du travail\n- Expérience managériale de X années"} className="min-h-[180px]" required />
              </div>

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
                <div className="flex gap-4">
                  <Link to="/recruiter">
                    <Button variant="outline">Annuler</Button>
                  </Link>
                  <Button type="submit" variant="hero" className="gap-2" disabled={isUpdating || isDeleting || !formData.title || !formData.location || !formData.contractType || !formData.categorieMetier || !formData.responsibilities || !formData.requirements}>
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  );
}