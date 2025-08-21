/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Briefcase, Edit, Save, X, Loader2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth, SignUpMetadata } from "@/hooks/useAuth";
import { useApplications } from "@/hooks/useApplications";
import { useCandidateDocuments, getDocumentTypeLabel, formatFileSize } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";

export function CandidateProfile() {
  const { user, updateUser, isUpdating } = useAuth();
  const { data: applications, isLoading: isLoadingApplications } = useApplications();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const { data: documents = [] } = useCandidateDocuments();
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata.first_name || "",
    lastName: user?.user_metadata.last_name || "",
    email: user?.email || "",
    matricule: user?.user_metadata.matricule || "",
    birthDate: user?.user_metadata.birth_date || "",
    currentPosition: user?.user_metadata.current_position || "",
    phone: user?.user_metadata.phone || "",
    gender: (user?.user_metadata as any)?.gender || "",
    bio: user?.user_metadata.bio || ""
  });

  // Merge missing fields from DB (users and candidate_profiles)
  useEffect(() => {
    const loadFromDb = async () => {
      if (!user) return;
      try {
        const [{ data: userRow }, { data: profileRow }] = await Promise.all([
          supabase.from('users').select('phone, date_of_birth, current_position').eq('id', user.id).maybeSingle(),
          supabase.from('candidate_profiles').select('gender, birth_date, current_position').eq('user_id', user.id).maybeSingle(),
        ]);

        setFormData(prev => ({
          ...prev,
          phone: prev.phone || (userRow?.phone ?? ""),
          birthDate: prev.birthDate || (userRow?.date_of_birth || profileRow?.birth_date || ""),
          currentPosition: prev.currentPosition || (userRow?.current_position || profileRow?.current_position || ""),
          gender: prev.gender || (profileRow?.gender || ""),
        }));
      } catch {
        // silencieux: ne bloque pas l'affichage si RLS empêche la lecture
      }
    };
    loadFromDb();
    // re-run if user changes
  }, [user]);

  const handleSave = async () => {
    const { firstName, lastName, birthDate, currentPosition, phone, bio, matricule, gender } = formData;
    const metadataToUpdate: Partial<SignUpMetadata> = {
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      current_position: currentPosition,
      phone,
      gender,
      bio,
      matricule,
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
      matricule: user?.user_metadata.matricule || "",
      birthDate: user?.user_metadata.birth_date || "",
      currentPosition: user?.user_metadata.current_position || "",
      phone: user?.user_metadata.phone || "",
      gender: (user?.user_metadata as any)?.gender || "",
      bio: user?.user_metadata.bio || ""
    });
    setIsEditing(false);
  };

  const calculateProfileCompletion = () => {
    const fields = ["firstName", "lastName", "email", "matricule", "birthDate", "currentPosition", "phone", "gender"];
    const completedFields = fields.filter((field) => formData[field] !== "");
    return Math.round((completedFields.length / fields.length) * 100);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Mon profil</h2>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
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
                  <Label htmlFor="matricule">Matricule</Label>
                  {isEditing ? (
                    <Input
                      id="matricule"
                      value={formData.matricule}
                      disabled={isUpdating}
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
                      disabled={isUpdating}
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

              {/* Téléphone et Sexe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      value={formData.phone}
                      disabled={isUpdating}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: +241 06 00 00 00"
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.phone || "Non renseigné"}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Sexe</Label>
                  {isEditing ? (
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Homme">Homme</SelectItem>
                        <SelectItem value="Femme">Femme</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-gray-50">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.gender || "Non renseigné"}</span>
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
                    disabled={isUpdating}
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

          {/* Mes documents */}
          <Card>
            <CardHeader>
              <CardTitle>Mes documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Vous n'avez pas encore ajouté de documents.</p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border rounded-md p-3">
                    <div className="space-y-0.5">
                      <div className="font-medium text-sm">{getDocumentTypeLabel(doc.document_type)}</div>
                      <div className="text-xs text-muted-foreground">{doc.file_name} · {formatFileSize(doc.file_size)}</div>
                    </div>
                    <a href={doc.file_path} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" /> Télécharger
                      </Button>
                    </a>
                  </div>
                ))
              )}
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
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Candidatures envoyées</span>
                {isLoadingApplications ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="font-medium">{applications?.length ?? 0}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profil complété</span>
                <span className="font-medium">{calculateProfileCompletion()}%</span>
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