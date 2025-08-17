import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Badge, Calendar, Briefcase } from "lucide-react";

export default function CandidateProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" defaultValue="Jean" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" defaultValue="Dupont" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="jean.dupont@seeg.ga" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule</Label>
                <Input id="matricule" defaultValue="EMP001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Input id="birthDate" type="date" defaultValue="1985-06-15" />
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
            <div className="space-y-2">
              <Label htmlFor="currentPosition">Poste actuel</Label>
              <Input id="currentPosition" defaultValue="Ingénieur Informatique" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Input id="department" defaultValue="Informatique et Digital" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Expérience</Label>
              <Textarea 
                id="experience" 
                placeholder="Décrivez votre expérience professionnelle..."
                defaultValue="5 ans d'expérience en développement logiciel et gestion de projets IT."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Compétences</Label>
              <Textarea 
                id="skills" 
                placeholder="Listez vos compétences principales..."
                defaultValue="JavaScript, React, Node.js, Gestion de projet, Leadership"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>Mettre à jour le profil</Button>
      </div>
    </div>
  );
}