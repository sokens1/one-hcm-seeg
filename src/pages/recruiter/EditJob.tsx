import { useState, useEffect } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useJobOffer } from "@/hooks/useJobOffers";
import { useCreateJobOffer } from "@/hooks/useRecruiterDashboard";

export default function EditJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: jobOffer, isLoading: isLoadingJob, error: errorJob } = useJobOffer(id as string);
  const { updateJobOffer, isUpdating } = useCreateJobOffer();

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    contract_type: "",
    description: "",
    profile: "",
  });

  useEffect(() => {
    if (jobOffer) {
      setFormData({
        title: jobOffer.title,
        location: jobOffer.location,
        contract_type: jobOffer.contract_type,
        description: jobOffer.description || '',
        profile: jobOffer.profile || '',
      });
    }
  }, [jobOffer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateJobOffer({ jobId: id, jobData: formData });
      toast({
        title: "Offre modifiée",
        description: "L'offre d'emploi a été mise à jour avec succès.",
        variant: "default",
      });
      navigate("/recruiter");
    } catch (error) {
      toast({
        title: "Erreur de mise à jour",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/recruiter">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Modifier l'offre d'emploi
            </h1>
            <p className="text-muted-foreground">
              Modifiez les détails de votre offre d'emploi
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Informations de l'offre</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du poste *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Développeur Full-Stack"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => handleInputChange("location", value)}
                    required
                  >
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contractType">Type de contrat *</Label>
                  <Select 
                    value={formData.contract_type} 
                    onValueChange={(value) => handleInputChange("contract_type", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI (Contrat à Durée Indéterminée)</SelectItem>
                      <SelectItem value="CDD">CDD (Contrat à Durée Déterminée)</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Temps partiel">Temps partiel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description du poste *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Décrivez le poste, les responsabilités, l'environnement de travail..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile">Profil recherché *</Label>
                <Textarea
                  id="profile"
                  value={formData.profile}
                  onChange={(e) => handleInputChange("profile", e.target.value)}
                  placeholder="Listez les compétences requises, l'expérience nécessaire, les diplômes..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link to="/recruiter">
                  <Button variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" variant="hero" className="gap-2" disabled={isUpdating}>
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isUpdating ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  );
}