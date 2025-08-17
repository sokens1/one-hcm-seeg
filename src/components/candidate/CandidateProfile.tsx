import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Briefcase, Edit, Save, X } from "lucide-react";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";

export function CandidateProfile() {
  const { user, updateUser } = useCandidateAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    matricule: user?.matricule || "",
    birthDate: user?.birthDate || "",
    currentPosition: user?.currentPosition || "",
    phone: "",
    bio: ""
  });

  const handleSave = () => {
    if (user) {
      updateUser({
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        matricule: formData.matricule,
        birthDate: formData.birthDate,
        currentPosition: formData.currentPosition
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      matricule: user?.matricule || "",
      birthDate: user?.birthDate || "",
      currentPosition: user?.currentPosition || "",
      phone: "",
      bio: ""
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Mon profil</h2>
        <p className="text-lg text-muted-foreground">
          Gérez vos informations personnelles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profil principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informations personnelles</CardTitle>
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
                    <Button size="sm" onClick={handleSave} className="gap-2">
                      <Save className="w-4 h-4" />
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
                  <Label htmlFor="matricule">Matricule</Label>
                  {isEditing ? (
                    <Input
                      id="matricule"
                      value={formData.matricule}
                      onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.matricule || "Non renseigné"}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  {isEditing ? (
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.birthDate || "Non renseigné"}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="currentPosition">Poste actuel</Label>
                {isEditing ? (
                  <Input
                    id="currentPosition"
                    value={formData.currentPosition}
                    onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{formData.currentPosition || "Non renseigné"}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar et status */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xl">
                    {formData.firstName[0]}{formData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{formData.firstName} {formData.lastName}</h3>
                  <p className="text-muted-foreground">{formData.currentPosition || "Candidat"}</p>
                </div>
                <Badge variant="secondary">
                  Profil actif
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Candidatures envoyées</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profil complété</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dernière connexion</span>
                <span className="font-medium">Aujourd'hui</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}