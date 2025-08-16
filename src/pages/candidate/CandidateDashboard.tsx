import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { FileText, User, Settings, CheckCircle, Clock, Users, Trophy, Bell, Briefcase, MapPin, Grid, List } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const jobs = [
  {
    id: 1,
    title: "Directeur Général",
    department: "Direction Générale",
    location: "Libreville",
    type: "CDI",
    description: "Assurer la direction stratégique et opérationnelle de l'entreprise",
    requirements: "15+ années d'expérience en direction générale"
  },
  {
    id: 2,
    title: "Directeur des Ressources Humaines", 
    department: "Ressources Humaines",
    location: "Libreville",
    type: "CDI",
    description: "Piloter la stratégie RH et accompagner la transformation",
    requirements: "10+ années d'expérience en RH"
  },
  {
    id: 3,
    title: "Directeur Financier",
    department: "Finance",
    location: "Libreville", 
    type: "CDI",
    description: "Superviser la gestion financière et la stratégie d'investissement",
    requirements: "12+ années d'expérience en finance"
  },
  {
    id: 4,
    title: "Directeur Technique",
    department: "Technique",
    location: "Libreville",
    type: "CDI", 
    description: "Diriger les opérations techniques et l'innovation",
    requirements: "15+ années d'expérience technique"
  },
  {
    id: 5,
    title: "Directeur Commercial",
    department: "Commercial",
    location: "Libreville",
    type: "CDI",
    description: "Développer la stratégie commerciale et les partenariats",
    requirements: "10+ années d'expérience commerciale"
  },
  {
    id: 6,
    title: "Directeur Marketing",
    department: "Marketing", 
    location: "Libreville",
    type: "CDI",
    description: "Élaborer et mettre en œuvre la stratégie marketing",
    requirements: "8+ années d'expérience en marketing"
  }
];

export default function CandidateDashboard() {
  const { user } = useCandidateAuth();
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Simulation d'une candidature en cours
  const candidatureStatus = {
    poste: "Directeur des Ressources Humaines",
    etapeActuelle: 2,
    etapeTotale: 4,
    statusText: "Analyse de votre dossier par nos recruteurs",
    progress: 50
  };

  const etapesPipeline = [
    { numero: 1, titre: "Candidature Reçue", statut: "completed", icon: CheckCircle },
    { numero: 2, titre: "Analyse en cours", statut: "current", icon: Clock },
    { numero: 3, titre: "Entretiens", statut: "pending", icon: Users },
    { numero: 4, titre: "Décision finale", statut: "pending", icon: Trophy }
  ];

  const documentsSubmis = [
    { nom: "CV_Jean_Dupont.pdf", type: "CV", taille: "245 KB" },
    { nom: "Lettre_motivation.pdf", type: "Lettre de motivation", taille: "123 KB" },
    { nom: "Certificat_formation.pdf", type: "Certificat", taille: "89 KB" }
  ];

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header avec navigation */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Bonjour {user?.firstName}
                </h1>
                <p className="text-muted-foreground">
                  Bienvenue dans votre espace candidat
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">3</Badge>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Profil
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Ma Progression avec pipeline améliorée */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Ma Progression
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Candidature pour le poste de{" "}
                      <span className="text-primary">{candidatureStatus.poste}</span>
                    </h3>
                    
                    {/* Pipeline visuelle améliorée */}
                    <div className="relative">
                      {/* Ligne de connexion */}
                      <div className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-green-400 via-blue-400 to-gray-300"></div>
                      
                      {/* Étapes */}
                      <div className="grid grid-cols-4 gap-4 relative z-10">
                        {etapesPipeline.map((etape, index) => {
                          const IconComponent = etape.icon;
                          return (
                            <div key={etape.numero} className="text-center">
                              <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center border-2 transition-all ${
                                etape.statut === "completed"
                                  ? "bg-green-500 border-green-500 text-white shadow-lg"
                                  : etape.statut === "current"
                                  ? "bg-blue-500 border-blue-500 text-white shadow-lg animate-pulse"
                                  : "bg-white border-gray-300 text-gray-400"
                              }`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <p className={`text-sm font-medium ${
                                etape.statut === "completed" || etape.statut === "current"
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}>
                                {etape.titre}
                              </p>
                              {etape.statut === "current" && (
                                <div className="mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    En cours
                                  </Badge>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm">
                        <strong>Statut actuel :</strong> {candidatureStatus.statusText}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Offres d'emploi */}
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Nos {jobs.length} postes à pourvoir
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'cards' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {viewMode === 'cards' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {jobs.map((job) => (
                        <Card key={job.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <p className="text-sm text-muted-foreground">{job.department}</p>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {job.location}
                                </span>
                                <Badge variant="outline">{job.type}</Badge>
                              </div>
                              <p className="text-sm line-clamp-2">{job.description}</p>
                              <div className="flex gap-2">
                                <Button asChild variant="outline" size="sm" className="flex-1">
                                  <Link to={`/jobs/${job.id}`}>Voir l'offre</Link>
                                </Button>
                                <Button asChild size="sm" className="flex-1">
                                  <Link to={`/jobs/${job.id}/apply`}>Postuler</Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {jobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <h3 className="font-medium">{job.title}</h3>
                                <p className="text-sm text-muted-foreground">{job.department}</p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </div>
                              <Badge variant="outline">{job.type}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/jobs/${job.id}`}>Voir l'offre</Link>
                            </Button>
                            <Button asChild size="sm">
                              <Link to={`/jobs/${job.id}/apply`}>Postuler</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Colonne latérale */}
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
                            <p className="font-medium text-sm">{doc.nom}</p>
                            <p className="text-xs text-muted-foreground">{doc.type} • {doc.taille}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Envoyé
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contexte entreprise */}
              <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">À propos de l'entreprise</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Découvrez la vision et les ambitions derrière cette campagne de recrutement exceptionnelle.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/company-context">En savoir plus</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}