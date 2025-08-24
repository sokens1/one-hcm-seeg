import { useState } from 'react';
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Edit, Loader2, Search, LayoutGrid, List } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useJobOffers } from "@/hooks/useJobOffers";

export default function RecruiterJobs() {
  const navigate = useNavigate();
  const { user, isRecruiter } = useAuth();
  const recruiterId = user?.id;
  const { data: jobs = [], isLoading, error } = useJobOffers();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleEditJob = (jobId: string | number) => {
    navigate(`/recruiter/jobs/${jobId}/edit`);
  };

  const filteredJobs = jobs
    .filter(job => job.status === 'active' || job.status === 'draft')
    .filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Postes à pourvoir</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez toutes vos offres d'emploi et suivez les candidatures
          </p>
        </div>
        {isRecruiter && (
          <Link to="/recruiter/jobs/new" className="w-full sm:w-auto">
            <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto text-sm">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Créer une offre
            </Button>
          </Link>
        )}
      </div>

      {/* Liste des offres */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">Toutes les offres ({filteredJobs.length})</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une offre..."
                className="pl-8 sm:pl-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-12 justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Chargement des offres...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            Une erreur est survenue lors du chargement des offres.
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredJobs.map((job, index) => (
              <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <Card className="hover:shadow-medium transition-all cursor-pointer group h-full">
                  <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                    <div className="flex-1 space-y-3">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary-dark transition-colors">
                        {job.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{job.contract_type}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="bg-success-light text-success-foreground">
                          {job.candidate_count} {job.candidate_count === 1 ? 'candidat' : 'candidats'}
                        </Badge>
                        {job.new_candidates > 0 && (
                          <Badge variant="default" className="bg-warning text-warning-foreground animate-bounce-soft">
                            {job.new_candidates} {job.new_candidates === 1 ? 'nouveau' : 'nouveaux'}
                          </Badge>
                        )}
                        <Badge variant={job.status === 'active' ? 'secondary' : job.status === 'draft' ? 'warning' : 'default'}>
                          {job.status === 'active' ? 'Actif' : 'Brouillon'}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <Link to={`/recruiter/jobs/${job.id}/pipeline`} className="flex-1">
                          <Button variant="hero" size="sm" className="gap-2 w-full">
                            <Eye className="w-4 h-4" />
                            Voir le Pipeline
                          </Button>
                        </Link>
                        {isRecruiter && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 px-3"
                            onClick={() => handleEditJob(job.id)}
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre du poste</TableHead>
                  <TableHead>Candidatures</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map(job => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground">{job.location} • {job.contract_type}</div>
                    </TableCell>
                    <TableCell>{job.candidate_count}</TableCell>
                    <TableCell>
                      <Badge variant={job.status === 'active' ? 'secondary' : job.status === 'draft' ? 'warning' : 'default'}>
                        {job.status === 'active' ? 'Actif' : job.status === 'draft' ? 'Brouillon' : job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/recruiter/jobs/${job.id}/pipeline`}>
                          <Button variant="outline" size="sm">Voir</Button>
                        </Link>
                        {isRecruiter && (
                          <Button variant="outline" size="sm" onClick={() => handleEditJob(job.id)}>Modifier</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
      </div>
    </RecruiterLayout>
  );
}