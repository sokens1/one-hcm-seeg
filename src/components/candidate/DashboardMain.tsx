import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Eye, Calendar, Filter } from "lucide-react";
import { useState } from "react";

interface Application {
  id: number;
  jobTitle: string;
  department: string;
  location: string;
  dateApplied: string;
  status: string;
}

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

interface DashboardMainProps {
  applications: Application[];
  jobs: Job[];
  onViewCatalog: () => void;
  onViewApplicationDetail: (applicationId: number) => void;
  onViewJobDetail: (jobId: number) => void;
}

export function DashboardMain({ 
  applications, 
  jobs, 
  onViewCatalog, 
  onViewApplicationDetail,
  onViewJobDetail 
}: DashboardMainProps) {
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Obtenir la liste unique des départements, lieux et types
  const departments = [...new Set(jobs.map(job => job.department))];
  const locations = [...new Set(jobs.map(job => job.location))];
  const types = [...new Set(jobs.map(job => job.type))];

  // Filtrer les candidatures
  const filteredApplications = applications.filter(app => {
    const job = jobs.find(j => j.title === app.jobTitle);
    if (!job) return true;
    
    return (
      (departmentFilter === "all" || job.department === departmentFilter) &&
      (locationFilter === "all" || job.location === locationFilter) &&
      (typeFilter === "all" || job.type === typeFilter)
    );
  });

  // Calculer les offres correspondant au profil (exemple: basé sur les candidatures existantes)
  const matchingJobsCount = jobs.filter(job => 
    applications.some(app => app.department === job.department)
  ).length;

  return (
    <div className="space-y-6">
      {/* Titre principal */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-muted-foreground">Gérez vos candidatures et découvrez de nouvelles opportunités</p>
      </div>

      {/* Indicateurs clés (Save bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatures en cours</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              Postes auxquels vous avez postulé
            </p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offres correspondantes</CardTitle>
            <Eye className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{matchingJobsCount}</div>
            <p className="text-xs text-muted-foreground">
              Selon votre profil
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={onViewCatalog}>
              Voir le catalogue
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Section "Mes Candidatures" */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Accès rapide à mes candidatures
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filtres
            </div>
          </div>
          
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lieu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les lieux</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type de poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune candidature ne correspond aux filtres sélectionnés</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{application.jobTitle}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {application.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {application.location}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3" />
                          <span>Candidature du {application.dateApplied}</span>
                        </div>
                        <Badge variant="secondary">{application.status}</Badge>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => onViewApplicationDetail(application.id)}
                      >
                        Voir le suivi détaillé
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}