import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { FileText, User, Settings, CheckCircle, Clock, Users, Trophy, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export default function CandidateDashboard() {
  const { user } = useCandidateAuth();

  // Simulation d'une candidature en cours
  const candidatureStatus = {
    poste: "Directeur des Ressources Humaines",
    etapeActuelle: 2,
    etapeTotale: 4,
    statusText: "Analyse de votre dossier par nos recruteurs",
    progress: 50
  };

  const etapesPipeline = [
    { numero: 1, titre: "Candidature Reçue", statut: "completed" },
    { numero: 2, titre: "Analyse en cours", statut: "current" },
    { numero: 3, titre: "Entretiens", statut: "pending" },
    { numero: 4, titre: "Décision finale", statut: "pending" }
  ];

  const documentsSubmis = [
    { nom: "CV_Jean_Dupont.pdf", type: "CV", taille: "245 KB" },
    { nom: "Lettre_motivation.pdf", type: "Lettre de motivation", taille: "123 KB" },
    { nom: "Certificat_formation.pdf", type: "Certificat", taille: "89 KB" }
  ];

  return (
    <CandidateLayout>
      <div className="p-6">
        {/* Message d'accueil */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bonjour {user?.firstName}, bienvenue dans votre espace candidat
          </h1>
          <p className="text-muted-foreground">
            Suivez l'avancement de votre candidature et gérez vos informations personnelles
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            {/* Colonne principale - Progression */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ma Progression */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Ma Progression
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Suivi de ma candidature pour le poste de{" "}
                      <span className="text-primary">{candidatureStatus.poste}</span>
                    </h3>
                    
                    {/* Barre de progression */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Étape {candidatureStatus.etapeActuelle} sur {candidatureStatus.etapeTotale}</span>
                        <span>{candidatureStatus.progress}%</span>
                      </div>
                      <Progress value={candidatureStatus.progress} className="h-3" />
                    </div>

                    {/* Pipeline visuel */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {etapesPipeline.map((etape) => (
                        <div
                          key={etape.numero}
                          className={`text-center p-3 rounded-lg border ${
                            etape.statut === "completed"
                              ? "bg-green-50 border-green-200"
                              : etape.statut === "current"
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            etape.statut === "completed"
                              ? "bg-green-500 text-white"
                              : etape.statut === "current"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}>
                            {etape.statut === "completed" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : etape.statut === "current" ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <Users className="w-4 h-4" />
                            )}
                          </div>
                          <p className="text-xs font-medium">{etape.titre}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm">
                        <strong>Statut actuel :</strong> {candidatureStatus.statusText}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mes Documents */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Mes Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documentsSubmis.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.nom}</p>
                            <p className="text-sm text-muted-foreground">{doc.type} • {doc.taille}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Envoyé
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne latérale - Informations */}
            <div className="space-y-6">
              {/* Mes Informations */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Mes Informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  {user?.matricule && (
                    <div>
                      <p className="text-sm text-muted-foreground">Matricule SEEG</p>
                      <p className="font-medium">{user.matricule}</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Modifier mes informations
                  </Button>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/candidate/jobs">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Voir toutes les offres
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/candidate/profile">
                      <Settings className="w-4 h-4 mr-2" />
                      Gérer mon profil
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
        </div>
      </div>
    </CandidateLayout>
  );
}