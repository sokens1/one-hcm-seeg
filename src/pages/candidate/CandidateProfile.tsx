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
import { FullPageSpinner } from "@/components/ui/spinner";

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
    return <FullPageSpinner text="Chargement du profil..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <CandidateLayout>
      <div className="space-y-6 sm:space-y-8 px-3 sm:px-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Mon profil</h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Gérez vos informations personnelles et professionnelles
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm sm:text-base">Prénom</Label>
                  <Input id="firstName" defaultValue={user?.user_metadata?.first_name} className="text-sm sm:text-base" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm sm:text-base">Nom</Label>
                  <Input id="lastName" defaultValue={user?.user_metadata?.last_name} className="text-sm sm:text-base" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <Input id="email" defaultValue={user?.email} readOnly className="text-sm sm:text-base" />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm sm:text-base">Téléphone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <Input id="phone" placeholder="+241 XX XX XX XX" className="text-sm sm:text-base" />
                </div>
              </div>

              <div>
                <Label htmlFor="birthDate" className="text-sm sm:text-base">Date de naissance</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <Input id="birthDate" type="date" defaultValue={user?.user_metadata?.birth_date} className="text-sm sm:text-base" />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm sm:text-base">Adresse</Label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0 mt-2 sm:mt-3" />
                  <Textarea id="address" placeholder="Votre adresse complète" className="text-sm sm:text-base min-h-[80px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                Informations professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="matricule" className="text-sm sm:text-base">Matricule</Label>
                <Input id="matricule" defaultValue={user?.user_metadata?.matricule} disabled className="text-sm sm:text-base" />
              </div>

              <div>
                <Label htmlFor="currentPosition" className="text-sm sm:text-base">Poste actuel</Label>
                <Input id="currentPosition" defaultValue={user?.user_metadata?.current_position} className="text-sm sm:text-base" />
              </div>

              <div>
                <Label htmlFor="department" className="text-sm sm:text-base">Département</Label>
                <Input id="department" placeholder="Votre département actuel" className="text-sm sm:text-base" />
              </div>

              <div>
                <Label htmlFor="experience" className="text-sm sm:text-base">Années d'expérience</Label>
                <Input id="experience" type="number" placeholder="Nombre d'années" className="text-sm sm:text-base" />
              </div>

              <div>
                <Label htmlFor="skills" className="text-sm sm:text-base">Compétences clés</Label>
                <Textarea id="skills" placeholder="Listez vos principales compétences..." className="text-sm sm:text-base min-h-[80px]" />
              </div>

              <div>
                <Label htmlFor="education" className="text-sm sm:text-base">Formation</Label>
                <Textarea id="education" placeholder="Votre parcours de formation..." className="text-sm sm:text-base min-h-[80px]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Mes documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">CV</p>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  Télécharger un fichier
                </Button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Lettre de motivation</p>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  Télécharger un fichier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button variant="outline" className="w-full sm:w-auto text-sm">Annuler</Button>
          <Button className="w-full sm:w-auto text-sm">Sauvegarder les modifications</Button>
        </div>
      </div>
    </CandidateLayout>
  );
}