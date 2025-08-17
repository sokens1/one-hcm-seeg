import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Lock, Eye } from "lucide-react";

export default function CandidateSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications par email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mises à jour de candidature</Label>
                <p className="text-sm text-muted-foreground">
                  Être notifié des changements de statut
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nouvelles offres</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les nouvelles offres correspondant à votre profil
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Confidentialité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Confidentialité et sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profil visible</Label>
                <p className="text-sm text-muted-foreground">
                  Rendre votre profil visible aux recruteurs
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <Button variant="outline" className="w-full">
              Changer le mot de passe
            </Button>
            <Button variant="outline" className="w-full">
              Télécharger mes données
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>Sauvegarder les paramètres</Button>
      </div>
    </div>
  );
}