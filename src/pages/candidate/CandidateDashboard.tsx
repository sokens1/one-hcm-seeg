import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Trophy, 
  Bell, 
  User, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Briefcase
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

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
  }
];

export default function CandidateDashboard() {
  const { user, logout } = useCandidateAuth();
  const navigate = useNavigate();
  const [showOpportunities, setShowOpportunities] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Prochaine étape simulée
  const nextInterview = {
    date: "Lundi 25 Septembre à 14:30",
    interviewer: "M. Diallo, Directeur des Ressources Humaines",
    location: "Visioconférence",
    link: "https://meet.google.com/abc-defg-hij"
  };

  const messages = [
    {
      id: 1,
      title: "Confirmation de votre entretien",
      date: "Aujourd'hui",
      preview: "Votre entretien avec M. Diallo est confirmé pour..."
    },
    {
      id: 2,
      title: "Document reçu",
      date: "Hier",
      preview: "Nous avons bien reçu votre certificat de formation..."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header épuré */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo SEEG */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">SEEG</h1>
            </div>
            
            {/* Actions à droite */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="w-4 h-4" />
                <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">3</Badge>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {user?.firstName}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    Informations personnelles
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Mes documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Section d'Accueil */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Bonjour {user?.firstName},</h2>
            <p className="text-muted-foreground">Voici le suivi de votre parcours de recrutement avec nous.</p>
          </div>

          {/* Section Principale : Ma Progression */}
          {hasApplied && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  Suivi de ma candidature : {candidatureStatus.poste}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Pipeline Horizontal Visuel */}
                <div className="relative">
                  {/* Ligne de connexion */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-green-400 via-blue-400 to-gray-300"></div>
                  
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statut Détaillé */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Statut actuel :</h4>
                  <p className="text-sm text-blue-700">{candidatureStatus.statusText}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section Secondaire : Mes Prochaines Étapes & Communications */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Prochaines Étapes */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Vos prochaines étapes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Entretien planifié</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Date :</strong> {nextInterview.date}</p>
                    <p><strong>Avec :</strong> {nextInterview.interviewer}</p>
                    <p><strong>Lieu :</strong> {nextInterview.location}</p>
                  </div>
                  <Button className="w-full mt-3" size="sm">
                    Ajouter à mon calendrier
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Centre de Messages */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Centre de Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="border-l-4 border-blue-500 pl-3 py-2">
                      <h5 className="font-medium text-sm">{message.title}</h5>
                      <p className="text-xs text-muted-foreground">{message.date}</p>
                      <p className="text-sm mt-1">{message.preview}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section Tertiaire : Opportunités (Accordéon) */}
          <Card className="shadow-lg">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowOpportunities(!showOpportunities)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Explorer les {jobs.length} autres opportunités au sein du comité de direction
                </span>
                {showOpportunities ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </CardTitle>
            </CardHeader>
            
            {showOpportunities && (
              <CardContent>
                <div className="space-y-2">
                  {jobs.map((job) => (
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
                          <Badge variant="outline">{job.type}</Badge>
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
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}