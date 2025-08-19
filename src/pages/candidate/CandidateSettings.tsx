import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Shield, Eye, Mail, Globe } from "lucide-react";

export default function CandidateSettings() {
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
          <h2 className="text-3xl font-bold mb-2">Paramètres</h2>
          <p className="text-lg text-muted-foreground">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les mises à jour sur vos candidatures par email
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="application-updates">Mises à jour de candidature</Label>
                <p className="text-sm text-muted-foreground">
                  Être notifié des changements de statut de vos candidatures
                </p>
              </div>
              <Switch id="application-updates" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-jobs">Nouvelles offres</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications pour les nouvelles offres correspondantes
                </p>
              </div>
              <Switch id="new-jobs" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="interview-reminders">Rappels d'entretien</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des rappels avant vos entretiens programmés
                </p>
              </div>
              <Switch id="interview-reminders" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Confidentialité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Confidentialité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-visibility">Visibilité du profil</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux recruteurs de voir votre profil
                </p>
              </div>
              <Switch id="profile-visibility" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="contact-permission">Autoriser le contact</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux recruteurs de vous contacter directement
                </p>
              </div>
              <Switch id="contact-permission" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Préférences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="language">Langue</Label>
              <Select defaultValue="fr">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <Select defaultValue="africa/libreville">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="africa/libreville">Africa/Libreville (WAT)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email-frequency">Fréquence des emails</Label>
              <Select defaultValue="daily">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immédiat</SelectItem>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="never">Jamais</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Changer le mot de passe
            </Button>
            <Button variant="outline" className="w-full">
              Télécharger mes données
            </Button>
            <Button variant="destructive" className="w-full">
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Réinitialiser</Button>
          <Button>Sauvegarder les paramètres</Button>
        </div>
      </div>
    </CandidateLayout>
  );
}