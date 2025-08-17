import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { FileText, MapPin, Calendar, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// Mock data pour les candidatures
const mockApplications = [
  {
    id: 1,
    title: "Directeur des Ressources Humaines",
    department: "Ressources Humaines",
    location: "Libreville",
    dateDepot: "15 Décembre 2024",
    status: "En cours d'analyse"
  },
  {
    id: 2,
    title: "Directeur Technique",
    department: "Technique",
    location: "Libreville",
    dateDepot: "12 Décembre 2024",
    status: "Documents vérifiés"
  },
];

export function DashboardMain() {
  const { user } = useCandidateAuth();
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredApplications = mockApplications.filter(app => {
    if (departmentFilter !== "all" && app.department !== departmentFilter) return false;
    if (locationFilter !== "all" && app.location !== locationFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Section d'Accueil */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Tableau de bord</h2>
        <p className="text-lg text-muted-foreground">
          Bonjour {user?.firstName}, voici le suivi de votre parcours de recrutement avec nous.
        </p>
      </div>

      {/* Indicateurs clés (Save bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Candidatures en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{mockApplications.length}</div>
            <p className="text-sm text-muted-foreground">
              {mockApplications.length > 1 ? "candidatures actives" : "candidature active"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Offres correspondantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">17</div>
            <p className="text-sm text-muted-foreground">
              nouveaux postes disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section "Mes Candidatures" */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Accès rapide à mes candidatures</CardTitle>
          
          {/* Filtres */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                <SelectItem value="Ressources Humaines">Ressources Humaines</SelectItem>
                <SelectItem value="Technique">Technique</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lieu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les lieux</SelectItem>
                <SelectItem value="Libreville">Libreville</SelectItem>
                <SelectItem value="Port-Gentil">Port-Gentil</SelectItem>
                <SelectItem value="Franceville">Franceville</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type de poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Vue Carte des Candidatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{application.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{application.department}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {application.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Candidature déposée le {application.dateDepot}
                  </div>
                  <div className="pt-2">
                    <Badge variant="secondary" className="mb-3">
                      {application.status}
                    </Badge>
                  </div>
                  <Button asChild className="w-full gap-2">
                    <Link to={`/candidate/application/${application.id}`}>
                      <Eye className="w-4 h-4" />
                      Voir le suivi détaillé
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune candidature ne correspond aux filtres sélectionnés.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setDepartmentFilter("all");
                  setLocationFilter("all");
                  setTypeFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}