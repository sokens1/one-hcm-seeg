import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateJobOffer } from "@/hooks/useRecruiterDashboard";
import { useToast } from "@/components/ui/use-toast";

interface JobFormData {
  title: string;
  reportingLine: string;
  contractType: string;
  categorieMetier: string;
  salaryNote: string;
  startDate: string;
  location: string;
  dateLimite: string;
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
    responsibilities: "",
    requirements: ""
  });

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
    // Validate required fields for DB NOT NULL constraints
    if (!formData.title || !formData.location || !formData.contractType || !formData.responsibilities || !formData.requirements) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    // Validate contract type against DB CHECK constraint
    const allowedContracts = ['CDI', 'CDD', 'Stage', 'Freelance'];
    if (!allowedContracts.includes(formData.contractType)) {
      toast({
        title: "Type de contrat invalide",
        description: "Le type de contrat doit être CDI, CDD, Stage ou Freelance.",
        variant: "destructive",
      });
      return;
    }

    const toList = (text: string) =>
      text
        .split(/\r?\n|\u2022|-/) // newline or bullet separators
        .map(s => s.trim())
        .filter(Boolean);

    const jobData = {
      title: formData.title,
      location: formData.location,
      contract_type: formData.contractType,
      description: formData.responsibilities, // MISSIONS PRINCIPALES devient la description
      profile: formData.requirements, // CONNAISSANCES SAVOIR ET REQUIS devient le profil
      categorie_metier: formData.categorieMetier || null,
      date_limite: formData.dateLimite ? new Date(formData.dateLimite).toISOString() : null,
      reporting_line: formData.reportingLine || undefined,
      salary_note: formData.salaryNote || undefined,
      start_date: formData.startDate || undefined,
      responsibilities: formData.responsibilities ? toList(formData.responsibilities) : undefined,
      requirements: formData.requirements ? toList(formData.requirements) : undefined,
    };
    const mappedStatus = status === 'published' ? 'active' : 'draft';

    try {
      await createJobOffer({ jobData, status: mappedStatus });
      toast({
        title: "Offre d'emploi sauvegardée",
        description: `L'offre a été ${status === 'published' ? 'publiée' : 'sauvegardée comme brouillon'} avec succès.`,
        variant: "default",
      });
      navigate("/recruiter");
    } catch (error) {
      toast({
        title: "Erreur lors de la sauvegarde",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Aperçu supprimé

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/recruiter">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Créer une nouvelle offre</h1>
                <p className="text-muted-foreground">
                  Remplissez les informations pour attirer les meilleurs talents
                </p>
              </div>
            </div>
            {/* Bouton Aperçu supprimé */}
          </div>

          {/* Form */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Informations de l'offre</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                {/* Première ligne - Intitulé du poste */}
                <div className="space-y-2">
                  <Label htmlFor="title">Intitulé du poste *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Développeur Full-Stack"
                    required
                  />
                </div>
                {/* Deuxième ligne - Ligne hiérarchique et Type de contrat */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="reportingLine">Ligne hiérarchique directe</Label>
                    <Input
                      id="reportingLine"
                      value={formData.reportingLine}
                      onChange={(e) => handleInputChange("reportingLine", e.target.value)}
                      placeholder="Ex: Chef de Département Support"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Type de contrat *</Label>
                    <Select value={formData.contractType} onValueChange={(value) => handleInputChange("contractType", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de contrat" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cadre">Cadre</SelectItem>
                      <SelectItem value="Cadre directeur">Cadre directeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryNote">Salaire brut</Label>
                  <Input
                    id="salaryNote"
                    value={formData.salaryNote}
                    onChange={(e) => handleInputChange("salaryNote", e.target.value)}
                    placeholder="Ex: Selon grille salariale SEEG"
                  />
                </div>
              </div>

              {/* Quatrième ligne - Date d'embauche et Lieu de travail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date d'embauche</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu de travail *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)} required>
                    <SelectTrigger>
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
                <Label htmlFor="dateLimite">Date limite de candidature</Label>
                <Input
                  id="dateLimite"
                  type="date"
                  value={formData.dateLimite}
                  onChange={(e) => handleInputChange("dateLimite", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Missions principales */}
              <div className="space-y-2">
                <Label htmlFor="responsibilities">Missions principales *</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                  placeholder={"Saisissez une mission par ligne\nEx:\n- Définir et piloter la politique RH\n- Élaborer et superviser la gestion administrative du personnel"}
                  className="min-h-[180px]"
                  required
                />
              </div>

              {/* Connaissance savoir et requis */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Connaissance savoir et requis *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder={"Saisissez un requis par ligne\nEx:\n- Bac+5 en RH, Droit social, Psychologie du travail\n- Expérience managériale de X années"}
                  className="min-h-[180px]"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 border-t">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSave}
                    disabled={isCreating || !formData.title || !formData.location || !formData.contractType || !formData.responsibilities || !formData.requirements}
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isCreating ? 'Sauvegarde...' : 'Sauvegarder le brouillon'}
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={handlePublish}
                    disabled={isCreating || !formData.title || !formData.location || !formData.contractType || !formData.responsibilities || !formData.requirements}
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isCreating ? 'Publication...' : "Publier l'offre"}
                  </Button>
                </div>
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RecruiterLayout>
  );
}