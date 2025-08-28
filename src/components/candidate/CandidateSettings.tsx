import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Globe, Palette, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export function CandidateSettings() {
  const { signOut: logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    applicationUpdates: true,
    marketingEmails: false,
    language: "fr",
    theme: "light"
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = async () => {
    try {
      const { error } = await logout();
      if (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la déconnexion",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      // Force une navigation complète pour éviter les problèmes de cache
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-3 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Paramètres</h2>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
          Configurez vos préférences
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="email-notifications" className="text-sm sm:text-base">Notifications par email</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Recevez des notifications par email pour les mises à jour importantes
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                className="self-start sm:self-center"
              />
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="sms-notifications" className="text-sm sm:text-base">Notifications SMS</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Recevez des SMS pour les étapes critiques de votre candidature
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                className="self-start sm:self-center"
              />
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="application-updates" className="text-sm sm:text-base">Mises à jour de candidature</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Soyez informé des changements de statut de vos candidatures
                </p>
              </div>
              <Switch
                id="application-updates"
                checked={settings.applicationUpdates}
                onCheckedChange={(checked) => handleSettingChange("applicationUpdates", checked)}
                className="self-start sm:self-center"
              />
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="marketing-emails" className="text-sm sm:text-base">Emails marketing</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Recevez des informations sur de nouvelles opportunités
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleSettingChange("marketingEmails", checked)}
                className="self-start sm:self-center"
              />
            </div>
          </CardContent>
        </Card>

        {/* Préférences d'affichage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="language" className="text-sm sm:text-base">Langue</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Choisissez votre langue préférée
                </p>
              </div>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="theme" className="text-sm sm:text-base">Thème</Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sélectionnez votre thème d'affichage
                </p>
              </div>
              <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="auto">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Button variant="outline" className="w-full justify-start text-sm sm:text-base">
              Changer le mot de passe
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm sm:text-base">
              Historique des connexions
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm sm:text-base">
              Gérer les sessions actives
            </Button>
          </CardContent>
        </Card>

        {/* Actions du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Actions du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Button variant="outline" className="w-full justify-start text-sm sm:text-base">
              Télécharger mes données
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 text-sm sm:text-base">
              Supprimer mon compte
            </Button>
            <Separator />
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full gap-2 text-sm sm:text-base"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}