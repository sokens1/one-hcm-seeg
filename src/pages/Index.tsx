import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-primary">SEEG</h1>
            <p className="text-xl text-muted-foreground mb-8">Société d'Énergie et d'Eau du Gabon</p>
            <p className="text-lg text-muted-foreground">Découvrez nos {jobs.length} opportunités de carrière au sein du comité de direction</p>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
                Nos postes à pourvoir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link to={`/jobs/${job.id}`}>Voir l'offre</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
