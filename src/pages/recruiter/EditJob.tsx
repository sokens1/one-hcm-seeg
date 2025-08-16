import { useState, useEffect } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Mock data pour simuler les données de l'offre
const mockJobData = {
  1: {
    title: "Développeur React.js",
    location: "Libreville",
    contractType: "CDI",
    description: "Nous recherchons un développeur React.js expérimenté pour rejoindre notre équipe technique...",
    requirements: "- 3+ années d'expérience en React.js\n- Maîtrise de TypeScript\n- Connaissance de Redux",
    salary: "800000-1200000"
  },
  2: {
    title: "Chef de Projet Digital",
    location: "Port-Gentil", 
    contractType: "CDI",
    description: "Poste de chef de projet pour la transformation digitale de nos processus...",
    requirements: "- 5+ années d'expérience en gestion de projet\n- Certifications PMP/Agile\n- Leadership",
    salary: "1000000-1500000"
  },
  3: {
    title: "Analyste Financier",
    location: "Libreville",
    contractType: "CDD", 
    description: "Analyste financier pour l'équipe finance et contrôle de gestion...",
    requirements: "- Diplôme en finance/comptabilité\n- Maîtrise d'Excel avancé\n- Rigueur analytique",
    salary: "600000-900000"
  }
};

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    contractType: "",
    description: "",
    requirements: "",
    salary: ""
  });

  useEffect(() => {
    // Charger les données de l'offre à modifier
    if (id && mockJobData[id as "1" | "2" | "3"]) {
      const jobData = mockJobData[id as "1" | "2" | "3"];
      setFormData(jobData);
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ici, vous implementeriez la logique de sauvegarde
    console.log("Modification de l'offre", id, formData);
    
    toast({
      title: "Offre modifiée",
      description: "L'offre d'emploi a été mise à jour avec succès.",
    });
    
    // Redirection vers le dashboard
    navigate("/recruiter");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!id || !mockJobData[id as "1" | "2" | "3"]) {
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
                    value={formData.contractType} 
                    onValueChange={(value) => handleInputChange("contractType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI - Contrat à Durée Indéterminée</SelectItem>
                      <SelectItem value="CDD">CDD - Contrat à Durée Déterminée</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Freelance">Freelance/Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Fourchette salariale (FCFA)</Label>
                  <Input
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => handleInputChange("salary", e.target.value)}
                    placeholder="Ex: 800000-1200000"
                  />
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
                <Label htmlFor="requirements">Exigences et qualifications *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
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
                <Button type="submit" variant="hero" className="gap-2">
                  <Save className="w-4 h-4" />
                  Sauvegarder les modifications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  );
}