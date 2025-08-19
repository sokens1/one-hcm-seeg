import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Briefcase, Edit, Save, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth, SignUpMetadata } from "@/hooks/useAuth";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";

export default function RecruiterProfile() {
  const { user, updateUser, isUpdating } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata.first_name || "",
    lastName: user?.user_metadata.last_name || "",
    email: user?.email || "",
    currentPosition: user?.user_metadata.current_position || "",
    phone: user?.user_metadata.phone || "",
    bio: user?.user_metadata.bio || ""
  });

  const handleSave = async () => {
    const { firstName, lastName, currentPosition, phone, bio } = formData;
    const metadataToUpdate: Partial<SignUpMetadata> = {
      first_name: firstName,
      last_name: lastName,
      current_position: currentPosition,
      phone,
      bio,
      role: user?.user_metadata?.role
    };
    const success = await updateUser(metadataToUpdate);

    if (success) {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
      setIsEditing(false);
    } else {
      toast({
        title: "Erreur",
        description: "La mise à jour de votre profil a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.user_metadata.first_name || "",
      lastName: user?.user_metadata.last_name || "",
      email: user?.email || "",
      currentPosition: user?.user_metadata.current_position || "",
      phone: user?.user_metadata.phone || "",
      bio: user?.user_metadata.bio || ""
    });
    setIsEditing(false);
  };

  return (
    <RecruiterLayout>
    <div className="space-y-8 container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Mon profil recruteur</h2>
        <p className="text-lg text-muted-foreground">
          Gérez les informations de votre compte recruteur
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profil principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informations</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                      <X className="w-4 h-4" />
                      Annuler
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isUpdating} className="gap-2">
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      disabled={isUpdating}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.firstName}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      disabled={isUpdating}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.lastName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{formData.email}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      disabled={isUpdating}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.phone || "Non renseigné"}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="currentPosition">Poste</Label>
                  {isEditing ? (
                    <Input
                      id="currentPosition"
                      value={formData.currentPosition}
                      disabled={isUpdating}
                      onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.currentPosition || "Recruteur"}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    disabled={isUpdating}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                ) : (
                  <div className="min-h-10 px-3 py-2 border rounded-md bg-gray-50">
                    <span className="text-sm text-muted-foreground">{formData.bio || "Aucune bio"}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xl">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{formData.firstName} {formData.lastName}</h3>
                  <p className="text-muted-foreground">{formData.currentPosition || "Recruteur"}</p>
                </div>
                <Badge variant="secondary">Profil actif</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </RecruiterLayout>
  );
}
