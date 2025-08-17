import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { CheckCircle, Clock, Users, Trophy, Bell, Briefcase, MapPin, ChevronDown, ChevronUp, User, FileText, LogOut, Calendar, MessageSquare, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  },
  {
    id: 7,
    title: "Chef de Projet Digital",
    department: "Digital",
    location: "Libreville",
    type: "CDI",
    description: "Piloter les projets de transformation digitale",
    requirements: "5+ années d'expérience en gestion de projet digital"
  },
  {
    id: 8,
    title: "Responsable Qualité",
    department: "Qualité",
    location: "Port-Gentil",
    type: "CDI",
    description: "Assurer le contrôle qualité et l'amélioration continue",
    requirements: "6+ années d'expérience en qualité"
  },
  {
    id: 9,
    title: "Manager HSE",
    department: "HSE",
    location: "Libreville",
    type: "CDI",
    description: "Gérer la politique Hygiène, Sécurité et Environnement",
    requirements: "8+ années d'expérience HSE"
  },
  {
    id: 10,
    title: "Analyste Financier Senior",
    department: "Finance",
    location: "Libreville",
    type: "CDI",
    description: "Analyser les performances financières et préparer les budgets",
    requirements: "5+ années d'expérience en analyse financière"
  },
  {
    id: 11,
    title: "Gestionnaire de Paie",
    department: "Ressources Humaines",
    location: "Libreville",
    type: "CDI",
    description: "Gérer la paie et les déclarations sociales",
    requirements: "3+ années d'expérience en paie"
  },
  {
    id: 12,
    title: "Ingénieur Maintenance",
    department: "Technique",
    location: "Port-Gentil",
    type: "CDI",
    description: "Assurer la maintenance préventive et corrective",
    requirements: "4+ années d'expérience en maintenance industrielle"
  },
  {
    id: 13,
    title: "Responsable Achats",
    department: "Achats",
    location: "Libreville",
    type: "CDI",
    description: "Optimiser les achats et négocier avec les fournisseurs",
    requirements: "6+ années d'expérience en achats"
  },
  {
    id: 14,
    title: "Chef Comptable",
    department: "Finance",
    location: "Libreville",
    type: "CDI",
    description: "Superviser la comptabilité générale et analytique",
    requirements: "7+ années d'expérience comptable"
  },
  {
    id: 15,
    title: "Responsable Communication",
    department: "Communication",
    location: "Libreville",
    type: "CDI",
    description: "Développer la stratégie de communication interne et externe",
    requirements: "5+ années d'expérience en communication"
  },
  {
    id: 16,
    title: "Juriste d'Entreprise",
    department: "Juridique",
    location: "Libreville",
    type: "CDI",
    description: "Conseiller sur les aspects juridiques et gérer les contrats",
    requirements: "4+ années d'expérience juridique"
  },
  {
    id: 17,
    title: "Data Analyst",
    department: "Digital",
    location: "Libreville",
    type: "CDI",
    description: "Analyser les données et produire des reportings",
    requirements: "3+ années d'expérience en analyse de données"
  },
  {
    id: 18,
    title: "Responsable Logistique",
    department: "Logistique",
    location: "Port-Gentil",
    type: "CDI",
    description: "Organiser et optimiser la chaîne logistique",
    requirements: "6+ années d'expérience en logistique"
  },
  {
    id: 19,
    title: "Assistant de Direction",
    department: "Direction Générale",
    location: "Libreville",
    type: "CDI",
    description: "Assister la direction dans ses tâches administratives",
    requirements: "3+ années d'expérience en assistanat de direction"
  }
];

export default function CandidateDashboard() {
  const { user, logout } = useCandidateAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpportunityOpen, setIsOpportunityOpen] = useState(false);

  // État de candidature - simulation d'une candidature en cours
  const [hasApplied] = useState(true);
  const candidatureStatus = {
    poste: "Directeur des Ressources Humaines",
    etapeActuelle: 2,
    etapeTotale: 4,
    statusText: "Votre dossier est en cours d'analyse par notre équipe de recrutement. Vous recevrez une notification dès que nous aurons avancé. Estimation : 5 jours ouvrés.",
    dateDepot: "15 Décembre 2024"
  };

  const etapesPipeline = [
    { numero: 1, titre: "Candidature Reçue", statut: "completed", icon: CheckCircle },
    { numero: 2, titre: "Analyse du dossier", statut: "current", icon: Clock },
    { numero: 3, titre: "Entretiens", statut: "pending", icon: Users },
    { numero: 4, titre: "Décision Finale", statut: "pending", icon: Trophy }
  ];

  // Entretien planifié (conditionnel)
  const prochainEntretien = null; // Sera défini quand entretien planifié

  // Messages récents
  const messagesRecents = [
    {
      id: 1,
      titre: "Confirmation de votre candidature",
      contenu: "Nous avons bien reçu votre candidature pour le poste de Directeur des Ressources Humaines.",
      date: "15 Décembre 2024",
      lu: true
    },
    {
      id: 2,
      titre: "Analyse en cours",
      contenu: "Votre dossier est actuellement en cours d'examen par notre équipe de recrutement.",
      date: "16 Décembre 2024",
      lu: true
    }
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/");
  };

  const otherJobs = jobs.filter(job => job.title !== candidatureStatus.poste);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header épuré */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo SEEG */}
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">SEEG</h1>
            </div>

            {/* Actions à droite */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="w-4 h-4" />
                <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">3</Badge>
              </Button>

              {/* Profil utilisateur avec dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {user?.firstName} ▼
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">Mon Profil</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Informations personnelles
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Mes documents
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Corps de la page */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Section d'Accueil */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Bonjour {user?.firstName},</h2>
            <p className="text-lg text-muted-foreground">
              Voici le suivi de votre parcours de recrutement avec nous.
            </p>
          </div>

          {/* Section Principale : Ma Progression */}
          {hasApplied && (
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">
                  Suivi de ma candidature : {candidatureStatus.poste}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pipeline Horizontale */}
                <div className="relative">
                  {/* Ligne de connexion */}
                  <div className="absolute top-6 left-6 right-6 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-gray-300 rounded-full"></div>
                  
                  {/* Étapes */}
                  <div className="grid grid-cols-4 gap-4 relative z-10">
                    {etapesPipeline.map((etape) => {
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

                {/* Statut Détaillé */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Statut actuel :</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Étape {candidatureStatus.etapeActuelle}/{candidatureStatus.etapeTotale}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">{candidatureStatus.statusText}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section Secondaire : Mes Prochaines Étapes & Communications */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Vos prochaines étapes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Entretien planifié (conditionnel) */}
              {prochainEntretien ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Entretien planifié</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Date :</strong> Lundi 25 Septembre à 14:30</p>
                    <p><strong>Avec :</strong> M. Diallo, Directeur des Ressources Humaines</p>
                    <p><strong>Lieu :</strong> Visioconférence (Lien de connexion)</p>
                  </div>
                  <Button size="sm" className="mt-3">
                    Ajouter à mon calendrier
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aucun entretien planifié pour le moment. Nous vous tiendrons informé.
                  </p>
                </div>
              )}

              {/* Centre de Messages */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Derniers messages
                </h3>
                <div className="space-y-2">
                  {messagesRecents.map((message) => (
                    <div key={message.id} className="bg-white border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium">{message.titre}</h4>
                        <span className="text-xs text-muted-foreground">{message.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.contenu}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Tertiaire : Opportunités (Accordéon) */}
          <Card className="shadow-lg">
            <Collapsible open={isOpportunityOpen} onOpenChange={setIsOpportunityOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Explorer les {otherJobs.length} autres opportunités au sein du comité de direction
                    </span>
                    {isOpportunityOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-2">
                    {otherJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
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
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/jobs/${job.id}`}>Voir l'offre & Postuler</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </div>
  );
}