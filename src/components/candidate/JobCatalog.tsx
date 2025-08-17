import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Briefcase, MapPin, Grid, List } from "lucide-react";
import { useState } from "react";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

interface JobCatalogProps {
  jobs: Job[];
  onViewJob: (jobId: number) => void;
  onBackToDashboard: () => void;
}

export function JobCatalog({ jobs, onViewJob, onBackToDashboard }: JobCatalogProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  return (
    <div className="space-y-6">
      {/* En-tête avec retour */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBackToDashboard}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Catalogue des Offres</h1>
          <p className="text-muted-foreground">Découvrez toutes les opportunités disponibles</p>
        </div>
      </div>

      {/* Sélecteur de vue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{jobs.length} offres disponibles</span>
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'list')}>
          <TabsList>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Cartes
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Liste
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Affichage des offres */}
      <Tabs value={viewMode}>
        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{job.type}</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewJob(job.id)}
                      >
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{job.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {job.department}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </span>
                              <Badge variant="secondary" className="ml-2">{job.type}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewJob(job.id)}
                      >
                        Voir détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}