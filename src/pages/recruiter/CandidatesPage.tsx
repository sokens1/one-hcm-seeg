import { useMemo, useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Eye, Phone, MapPin, Calendar, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecruiterApplications } from "@/hooks/useApplications";

// Types dérivés des applications
type ApplicationStatus = 'candidature' | 'incubation' | 'embauche' | 'refuse';

interface UICandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  appliedDate: string;
  status: ApplicationStatus;
  jobTitle?: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  candidature: { label: "Candidature", color: "bg-blue-100 text-blue-800 border-blue-200" },
  incubation: { label: "Incubation", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  embauche: { label: "Embauché", color: "bg-green-100 text-green-800 border-green-200" },
  refuse: { label: "Refusé", color: "bg-red-100 text-red-800 border-red-200" },
};

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const { applications, isLoading, error } = useRecruiterApplications();

  const uiCandidates: UICandidate[] = useMemo(() => {
    return (applications || []).map(app => ({
      id: app.id,
      firstName: app.users?.first_name || "",
      lastName: app.users?.last_name || "",
      email: app.users?.email || "",
      phone: app.users?.phone || undefined,
      location: app.job_offers?.location || undefined,
      appliedDate: app.created_at,
      status: app.status as ApplicationStatus,
      jobTitle: app.job_offers?.title || undefined,
    }));
  }, [applications]);

  const filteredCandidates = uiCandidates.filter(candidate => {
    const needle = searchTerm.toLowerCase();
    const name = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
    const jobTitle = (candidate.jobTitle || "").toLowerCase();
    const matchesSearch =
      name.includes(needle) ||
      candidate.email.toLowerCase().includes(needle) ||
      jobTitle.includes(needle);

    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tous les Candidats
            </h1>
            <p className="text-muted-foreground">
              Gérez et suivez tous les candidats qui ont postulé aux offres SEEG
            </p>
          </div>
          <Link to="/recruiter">
            <Button variant="outline">
              Retour au tableau de bord
            </Button>
          </Link>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Chargement des candidats...
          </div>
        )}
        {error && (
          <div className="text-center py-6 text-red-600">
            Erreur lors du chargement: {(error as Error).message}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Tous
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status as ApplicationStatus)}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        

        {/* Candidates Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Candidat</th>
                    <th className="text-left p-4 font-medium text-foreground">Poste</th>
                    <th className="text-left p-4 font-medium text-foreground">Statut</th>
                    <th className="text-left p-4 font-medium text-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-dark/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-dark" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {candidate.firstName} {candidate.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-foreground">{candidate.jobTitle || '-'}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className={statusConfig[candidate.status].color}>
                          {statusConfig[candidate.status].label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Eye className="w-4 h-4" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Détails du candidat</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Informations personnelles */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm text-muted-foreground">Nom complet</Label>
                                  <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">Email</Label>
                                  <p className="font-medium">{candidate.email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">Téléphone</Label>
                                  <p className="font-medium">{candidate.phone || 'Non fourni'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">Date de candidature</Label>
                                  <p className="font-medium">{new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}</p>
                                </div>
                              </div>
                              
                              {/* Poste et statut */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm text-muted-foreground">Poste postulé</Label>
                                  <p className="font-medium">{candidate.jobTitle || 'Non spécifié'}</p>
                                </div>
                                <div>
                                  <Label className="text-sm text-muted-foreground">Statut</Label>
                                  <Badge variant="secondary" className={statusConfig[candidate.status].color}>
                                    {statusConfig[candidate.status].label}
                                  </Badge>
                                </div>
                              </div>
                              
                              
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredCandidates.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun candidat trouvé</h3>
            <p className="text-muted-foreground mb-6">
              Aucun candidat ne correspond à vos critères de recherche.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}