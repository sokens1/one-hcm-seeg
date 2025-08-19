import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Calendar, Briefcase, Phone, MapPin } from "lucide-react";

export default function CandidateProfile() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/candidate/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <CandidateLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Mon profil</h2>
          <p className="text-lg text-muted-foreground">
            Gérez vos informations personnelles et professionnelles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" defaultValue={user?.user_metadata?.first_name} />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue={user?.user_metadata?.last_name} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Input id="email" defaultValue={user?.email} readOnly />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <Input id="phone" placeholder="+241 XX XX XX XX" />
                </div>
              </div>

              <div>
                <Label htmlFor="birthDate">Date de naissance</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Input id="birthDate" type="date" defaultValue={user?.user_metadata?.birth_date} />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Textarea id="address" placeholder="Votre adresse complète" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Informations professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="matricule">Matricule</Label>
                <Input id="matricule" defaultValue={user?.user_metadata?.matricule} disabled />
              </div>

              <div>
                <Label htmlFor="currentPosition">Poste actuel</Label>
                <Input id="currentPosition" defaultValue={user?.user_metadata?.current_position} />
              </div>

              <div>
                <Label htmlFor="department">Département</Label>
                <Input id="department" placeholder="Votre département actuel" />
              </div>

              <div>
                <Label htmlFor="experience">Années d'expérience</Label>
                <Input id="experience" type="number" placeholder="Nombre d'années" />
              </div>

              <div>
                <Label htmlFor="skills">Compétences clés</Label>
                <Textarea id="skills" placeholder="Listez vos principales compétences..." />
              </div>

              <div>
                <Label htmlFor="education">Formation</Label>
                <Textarea id="education" placeholder="Votre parcours de formation..." />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Mes documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">CV</p>
                <Button variant="outline" size="sm">
                  Télécharger un fichier
                </Button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Lettre de motivation</p>
                <Button variant="outline" size="sm">
                  Télécharger un fichier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Annuler</Button>
          <Button>Sauvegarder les modifications</Button>
        </div>
      </div>
    </CandidateLayout>
  );
}