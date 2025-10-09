import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateJobOffer } from "@/hooks/useRecruiterDashboard";
import { useToast } from "@/components/ui/use-toast";
import { MTPQuestionsEditor } from "@/components/forms/MTPQuestionsEditor";
import { getMetierQuestionsForTitle, defaultMTPQuestionsExternes } from "@/data/metierQuestions";
import { useEffect } from "react";

interface JobFormData {
  title: string;
  reportingLine: string;
  contractType: string;
  categorieMetier: string;
  salaryNote: string;
  startDate: string;
  location: string;
  dateLimite: string;
  statusOfferts: string;
  responsibilities: string;
  requirements: string;
}

export default function CreateJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createJobOffer, isCreating } = useCreateJobOffer();

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    reportingLine: "",
    contractType: "",
    categorieMetier: "",
    salaryNote: "",
    startDate: "",
    location: "",
    dateLimite: "",
    statusOfferts: "",
    responsibilities: "",
    requirements: ""
  });

  // États pour les questions MTP
  const [mtpQuestionsMetier, setMtpQuestionsMetier] = useState<string[]>([]);
  const [mtpQuestionsTalent, setMtpQuestionsTalent] = useState<string[]>([]);
  const [mtpQuestionsParadigme, setMtpQuestionsParadigme] = useState<string[]>([]);

  // Charger automatiquement les questions par défaut au changement du statut ou titre
  useEffect(() => {
    // Ne charger que si les questions sont vides (pas encore modifiées par l'utilisateur)
    if (mtpQuestionsMetier.length === 0 && mtpQuestionsTalent.length === 0 && mtpQuestionsParadigme.length === 0) {
      let defaultQuestions;
      
      if (formData.statusOfferts === 'externe') {
        // Offre externe : 3 questions par catégorie
        defaultQuestions = defaultMTPQuestionsExternes;
        console.log('[CreateJob] Chargement questions externes (3 par catégorie)');
      } else if (formData.title) {
        // Offre interne : questions basées sur le titre
        defaultQuestions = getMetierQuestionsForTitle(formData.title);
        console.log('[CreateJob] Chargement questions pour:', formData.title);
      } else {
        // Pas encore de titre ou statut, ne rien faire
        return;
      }
      
      setMtpQuestionsMetier(defaultQuestions.metier);
      setMtpQuestionsTalent(defaultQuestions.talent);
      setMtpQuestionsParadigme(defaultQuestions.paradigme);
      
      console.log('[CreateJob] Questions pré-remplies:', {
        metier: defaultQuestions.metier.length,
        talent: defaultQuestions.talent.length,
        paradigme: defaultQuestions.paradigme.length
      });
    }
  }, [formData.statusOfferts, formData.title, mtpQuestionsMetier.length, mtpQuestionsTalent.length, mtpQuestionsParadigme.length]);

  // Aperçu supprimé

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    await handleSubmit('draft');
  };

  const handlePublish = async () => {
    await handleSubmit('published');
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    // console.log('[CreateJob] Starting submission with status:', status);
    // console.log('[CreateJob] Form data:', formData);

    // Validate required fields for DB NOT NULL constraints
    if (!formData.title || !formData.location || !formData.contractType || !formData.statusOfferts || !formData.responsibilities || !formData.requirements) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    // Validate contract type against DB CHECK constraint
    const allowedContracts = ['CDI avec période d\'essai', 'CDI', 'CDD', 'Stage', 'Freelance'];
    if (!allowedContracts.includes(formData.contractType)) {
      toast({
        title: "Type de contrat invalide",
        description: "Le type de contrat doit être CDI avec période d'essai, CDI, CDD, Stage ou Freelance.",
        variant: "destructive",
      });
      return;
    }


    const mappedStatus = status === 'published' ? 'active' : 'draft';

    const jobData = {
      title: formData.title,
      location: formData.location,
      contract_type: formData.contractType,
      description: formData.responsibilities, // MISSIONS PRINCIPALES devient la description
      profile: formData.requirements, // CONNAISSANCES SAVOIR ET REQUIS devient le profil
      categorie_metier: formData.categorieMetier || null,
      date_limite: formData.dateLimite ? new Date(formData.dateLimite).toISOString() : null,
      reporting_line: formData.reportingLine || null,
      salary_note: formData.salaryNote || null,
      status_offerts: formData.statusOfferts || null,
      start_date: formData.startDate || null,
      // Questions MTP
      mtp_questions_metier: mtpQuestionsMetier.filter(q => q.trim() !== ''),
      mtp_questions_talent: mtpQuestionsTalent.filter(q => q.trim() !== ''),
      mtp_questions_paradigme: mtpQuestionsParadigme.filter(q => q.trim() !== ''),
      // Ne pas envoyer les champs HTML vers les colonnes array de la DB
      // responsibilities: formData.responsibilities,
      // requirements: formData.requirements,
    };

    // console.log('[CreateJob] Prepared job data:', jobData);

    try {
      const result = await createJobOffer({ jobData, status: mappedStatus });
      // console.log('[CreateJob] Creation successful:', result);
      
      toast({
        title: "Offre d'emploi sauvegardée",
        description: `L'offre a été ${status === 'published' ? 'publiée' : 'sauvegardée comme brouillon'} avec succès.`,
        variant: "default",
      });
      navigate("/recruiter");
    } catch (error) {
      console.error('[CreateJob] Creation failed:', error);
      
      toast({
        title: "Erreur lors de la sauvegarde",
        description: error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Aperçu supprimé

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
              <Link to="/recruiter">
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Créer une nouvelle offre</h1>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  Remplissez les informations pour attirer les meilleurs talents
                </p>
              </div>
            </div>
            {/* Bouton Aperçu supprimé */}
          </div>

          {/* Form */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg lg:text-xl">Informations de l'offre</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6 sm:space-y-8">
                {/* Première ligne - Intitulé du poste */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm sm:text-base font-medium">Intitulé du poste *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Développeur Full-Stack"
                    className="text-sm sm:text-base"
                    required
                  />
                </div>
                {/* Deuxième ligne - Ligne hiérarchique et Type de contrat */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="reportingLine" className="text-sm sm:text-base font-medium">Ligne hiérarchique directe</Label>
                    <Input
                      id="reportingLine"
                      value={formData.reportingLine}
                      onChange={(e) => handleInputChange("reportingLine", e.target.value)}
                      placeholder="Ex: Chef de Département Support"
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractType" className="text-sm sm:text-base font-medium">Type de contrat *</Label>
                    <Select value={formData.contractType} onValueChange={(value) => handleInputChange("contractType", value)} required>
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue placeholder="Type de contrat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CDI avec période d'essai">CDI avec période d'essai</SelectItem>
                        <SelectItem value="CDI">CDI </SelectItem>
                        <SelectItem value="CDD">CDD </SelectItem>
                        {/* <SelectItem value="Stage">Stage</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>*/}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              {/* Troisième ligne - Catégorie et Salaire brut */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="categorieMetier" className="text-sm sm:text-base font-medium">Catégorie *</Label>
                  <Select value={formData.categorieMetier} onValueChange={(value) => handleInputChange("categorieMetier", value)} required>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cadre">Cadre</SelectItem>
                      <SelectItem value="Cadre directeur">Cadre de Direction </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryNote" className="text-sm sm:text-base font-medium">Salaire brut</Label>
                  <Input
                    id="salaryNote"
                    value={formData.salaryNote}
                    onChange={(e) => handleInputChange("salaryNote", e.target.value)}
                    placeholder="Ex: Selon grille salariale SEEG"
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Ligne Statut - Interne/Externe */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="statusOfferts" className="text-sm sm:text-base font-medium">Statut de l'offre *</Label>
                  <Select value={formData.statusOfferts} onValueChange={(value) => handleInputChange("statusOfferts", value)} required>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Choisir le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interne">Interne</SelectItem>
                      <SelectItem value="externe">Externe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quatrième ligne - Date d'embauche et Lieu de travail */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm sm:text-base font-medium">Date d'embauche</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm sm:text-base font-medium">Lieu de travail *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)} required>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Choisir une ville" />
                    </SelectTrigger>
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
                <Label htmlFor="dateLimite" className="text-sm sm:text-base font-medium">Date limite de candidature</Label>
                <Input
                  id="dateLimite"
                  type="date"
                  value={formData.dateLimite}
                  onChange={(e) => handleInputChange("dateLimite", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-sm sm:text-base"
                />
              </div>

              {/* Missions principales */}
              <div className="space-y-2">
                <Label htmlFor="responsibilities" className="text-sm sm:text-base font-medium">Missions principales *</Label>
                <ReactQuill
                  theme="snow"
                  value={formData.responsibilities}
                  onChange={(content) => handleInputChange("responsibilities", content)}
                  placeholder={"Saisissez une mission par ligne\nEx:\n- Définir et piloter la politique RH\n- Élaborer et superviser la gestion administrative du personnel"}
                  className="bg-card quill-editor-container"
                />
              </div>

              {/* Connaissance savoir et requis */}
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-sm sm:text-base font-medium">Connaissance savoir et requis *</Label>
                <ReactQuill
                  theme="snow"
                  value={formData.requirements}
                  onChange={(content) => handleInputChange("requirements", content)}
                  placeholder={"Saisissez un requis par ligne\nEx:\n- Bac+5 en RH, Droit social, Psychologie du travail\n- Expérience managériale de X années"}
                  className="bg-card quill-editor-container"
                />
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end pt-6 border-t gap-3 sm:gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleSave}
                  disabled={isCreating || !formData.title || !formData.location || !formData.contractType || !formData.statusOfferts || !formData.responsibilities || !formData.requirements}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  {isCreating ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  )}
                  {isCreating ? 'Sauvegarde...' : 'Sauvegarder le brouillon'}
                </Button>
                <Button 
                  variant="success" 
                  onClick={handlePublish}
                  disabled={isCreating || !formData.title || !formData.location || !formData.contractType || !formData.statusOfferts || !formData.responsibilities || !formData.requirements}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  {isCreating ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  )}
                  {isCreating ? 'Publication...' : "Publier l'offre"}
                </Button>
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RecruiterLayout>
  );
}