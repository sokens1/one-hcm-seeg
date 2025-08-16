import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function CandidateSignup() {
  const { login } = useCandidateAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    matricule: "",
    password: "",
    confirmPassword: "",
    rgpdConsent: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas"
      });
      return;
    }

    if (!formData.rgpdConsent) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez accepter les conditions RGPD"
      });
      return;
    }

    // Simulation de création de compte
    const userData = {
      id: Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      matricule: formData.matricule || undefined
    };

    login(userData);
    
    toast({
      title: "Compte créé avec succès",
      description: "Bienvenue dans votre espace candidat"
    });
    
    navigate("/candidate/dashboard");
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Créer votre compte candidat
              </h1>
              <p className="text-muted-foreground">
                Rejoignez l'équipe dirigeante de la SEEG
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Inscription</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="matricule">Matricule SEEG (si applicable)</Label>
                    <Input
                      id="matricule"
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleInputChange}
                      placeholder="Pour prouver votre appartenance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Créer un mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rgpd"
                      checked={formData.rgpdConsent}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, rgpdConsent: checked as boolean }))
                      }
                    />
                    <Label htmlFor="rgpd" className="text-sm">
                      J'accepte les conditions de traitement des données personnelles (RGPD) *
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Créer mon compte
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Déjà un compte ?{" "}
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href="/candidate/login">Se connecter</a>
                      </Button>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}