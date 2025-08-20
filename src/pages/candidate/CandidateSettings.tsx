import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type SignUpMetadata } from "@/hooks/useAuth";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Mail, User, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function CandidateSettings() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [matricule, setMatricule] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/candidate/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const meta = (user.user_metadata as Partial<SignUpMetadata>) || {};
    setFirstName(meta.first_name ?? "");
    setLastName(meta.last_name ?? "");
    setMatricule(meta.matricule ?? "");
  }, [user]);

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

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          matricule: matricule || null,
        },
      });
      if (error) throw error;
      toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Échec de la mise à jour";
      toast({ variant: "destructive", title: "Erreur", description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({ variant: "destructive", title: "Mot de passe invalide", description: "Au moins 6 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Incohérence", description: "Les mots de passe ne correspondent pas." });
      return;
    }
    try {
      setChangingPwd(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été mis à jour." });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Échec du changement de mot de passe";
      toast({ variant: "destructive", title: "Erreur", description: message });
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <CandidateLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Paramètres</h2>
          <p className="text-lg text-muted-foreground">
            Gérez vos informations de compte et votre mot de passe
          </p>
        </div>

        {/* Informations de compte (issus de l'inscription) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input id="email" value={user?.email || ''} readOnly />
              </div>
            </div>
            <div>
              <Label htmlFor="matricule">Matricule</Label>
              <Input id="matricule" value={matricule} onChange={(e) => setMatricule(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Changer le mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleChangePassword} disabled={changingPwd}>
                {changingPwd ? 'Modification...' : 'Changer le mot de passe'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CandidateLayout>
  );
}