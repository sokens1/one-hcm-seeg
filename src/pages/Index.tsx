import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { useRecruiterAuth } from "@/hooks/useRecruiterAuth";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Building2 } from "lucide-react";
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

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated: candidateAuth } = useCandidateAuth();
  const { isAuthenticated: recruiterAuth } = useRecruiterAuth();

  useEffect(() => {
    // Rediriger si déjà connecté
    if (candidateAuth) {
      navigate("/candidate/dashboard");
    } else if (recruiterAuth) {
      navigate("/recruiter");
    }
  }, [navigate, candidateAuth, recruiterAuth]);

  // Ne pas afficher la page d'accueil si l'utilisateur est connecté
  if (candidateAuth || recruiterAuth) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Building2 className="w-12 h-12" />
              <h1 className="text-5xl font-bold">SEEG</h1>
            </div>
            <p className="text-xl mb-8">Société d'Énergie et d'Eau du Gabon</p>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Rejoignez notre équipe de direction et participez au développement énergétique du Gabon
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/candidate/login")}
              >
                Postuler maintenant
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-primary"
                onClick={() => navigate("/candidate/signup")}
              >
                Créer un compte
              </Button>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos Opportunités de Carrière</h2>
            <p className="text-lg text-muted-foreground">
              Découvrez {jobs.length} postes de direction disponibles
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{job.department}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                  <p className="text-sm line-clamp-3">{job.description}</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="w-full">
                      <Link to={`/jobs/${job.id}`}>Voir l'offre</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
