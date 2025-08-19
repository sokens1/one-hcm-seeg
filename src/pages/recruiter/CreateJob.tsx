import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Eye, Send, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateJobOffer } from "@/hooks/useRecruiterDashboard";
import { useToast } from "@/components/ui/use-toast";

interface JobFormData {
  title: string;
  location: string;
  contractType: string;
  description: string;
  profile: string;
}

export default function CreateJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createJobOffer, isCreating } = useCreateJobOffer();

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    location: "",
    contractType: "",
    description: "",
    profile: ""
  });

  const [isPreview, setIsPreview] = useState(false);

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
    if (!formData.title || !formData.location || !formData.contractType || !formData.description) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir Titre, Lieu, Type de contrat et Description avant de continuer.",
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

    const jobData = {
      title: formData.title,
      location: formData.location,
      contract_type: formData.contractType,
      description: formData.description,
      profile: formData.profile,
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

  if (isPreview) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="outline" 
                onClick={() => setIsPreview(false)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'édition
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSave} disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isCreating ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                <Button variant="success" onClick={handlePublish}>
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isCreating ? 'Publication...' : "Publier l'offre"}
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="space-y-3">
                      <CardTitle className="text-3xl">{formData.title || "Titre du poste"}</CardTitle>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{formData.location || "Lieu"}</span>
                        <span>•</span>
                        <span>{formData.contractType || "Type de contrat"}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Description du poste</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-foreground">
                      {formData.description || "Description du poste à définir..."}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Profil recherché</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-foreground">
                      {formData.profile || "Profil recherché à définir..."}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-primary-dark/20">
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-semibold">Prêt à postuler ?</h3>
                    <p className="text-muted-foreground text-sm">
                      Rejoignez notre équipe et contribuez à notre succès.
                    </p>
                    <Button variant="hero" size="lg" className="w-full" disabled>
                      Postuler maintenant
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Aperçu - Le bouton sera actif après publication
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </Button>
            </div>
          </div>

          {/* Form */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Informations de l'offre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Titre du poste *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Développeur React.js"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">Lieu *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Libreville">Libreville</SelectItem>
                      <SelectItem value="Port-Gentil">Port-Gentil</SelectItem>
                      <SelectItem value="Franceville">Franceville</SelectItem>
                      <SelectItem value="Oyem">Oyem</SelectItem>
                      <SelectItem value="Moanda">Moanda</SelectItem>
                      <SelectItem value="Lambaréné">Lambaréné</SelectItem>
                      <SelectItem value="Télétravail">Télétravail</SelectItem>
                      <SelectItem value="Hybride">Hybride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contractType">Type de contrat *</Label>
                  <Select value={formData.contractType} onValueChange={(value) => handleInputChange("contractType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
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

              {/* Job Description */}
              <div>
                <Label htmlFor="description">Description du poste *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Décrivez le poste, les missions principales, l'environnement de travail..."
                  className="min-h-[200px]"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Décrivez les missions, responsabilités et l'environnement de travail
                </p>
              </div>

              {/* Profile Requirements */}
              <div>
                <Label htmlFor="profile">Profil recherché *</Label>
                <Textarea
                  id="profile"
                  value={formData.profile}
                  onChange={(e) => handleInputChange("profile", e.target.value)}
                  placeholder="Expérience requise, compétences techniques, qualités personnelles..."
                  className="min-h-[200px]"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Précisez l'expérience, les compétences techniques et les qualités recherchées
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button variant="outline" onClick={() => setIsPreview(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSave}
                    disabled={isCreating || !formData.title || !formData.location || !formData.contractType || !formData.description}
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
                    disabled={isCreating || !formData.title || !formData.location || !formData.contractType || !formData.description}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </RecruiterLayout>
  );
}