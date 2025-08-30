/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { ObserverLayout } from "@/components/layout/ObserverLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Eye, 
  Download, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  FileText,
  ExternalLink,
  Filter,
  Loader2
} from "lucide-react";
import { useRecruiterApplications } from "@/hooks/useApplications";
import { useApplicationDocuments, getDocumentTypeLabel, formatFileSize } from "@/hooks/useDocuments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Types dérivés des applications
type ApplicationStatus = 'candidature' | 'incubation' | 'embauche' | 'refuse';

interface UICandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  currentPosition?: string;
  location?: string;
  appliedDate: string;
  status: ApplicationStatus;
  jobTitle?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

interface CandidateModalProps {
  candidate: UICandidate;
  isOpen: boolean;
  onClose: () => void;
}

function CandidateModal({ candidate, isOpen, onClose }: CandidateModalProps) {
  console.log('[CANDIDATE MODAL DEBUG] Opening modal for candidate:', candidate);
  console.log('[CANDIDATE MODAL DEBUG] Using applicationId:', candidate.id);
  
  const { data: documents, isLoading, error } = useApplicationDocuments(candidate.id);
  console.log('[CANDIDATE MODAL DEBUG] Documents from hook:', documents);

  const toUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const { data } = supabase.storage.from('application-documents').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
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
          <Label className="text-sm text-muted-foreground">Sexe</Label>
          <p className="font-medium">{candidate.gender || 'Non renseigné'}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Date de naissance</Label>
          <p className="font-medium">{candidate.birthDate ? format(new Date(candidate.birthDate), 'PPP', { locale: fr }) : 'Non renseignée'}</p>
        </div>
      </div>

      {/* Poste et statut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Poste actuel</Label>
          <p className="font-medium">{candidate.currentPosition || 'Non renseigné'}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Localisation</Label>
          <p className="font-medium">{candidate.location || 'Non renseignée'}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Poste candidaté</Label>
          <p className="font-medium">{candidate.jobTitle || 'Non renseigné'}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Date de candidature</Label>
          <p className="font-medium">{format(new Date(candidate.appliedDate), 'PPP', { locale: fr })}</p>
        </div>
      </div>

      {/* Liens externes */}
      {(candidate.linkedin_url || candidate.portfolio_url) && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Liens externes</Label>
          <div className="flex gap-2">
            {candidate.linkedin_url && (
              <a 
                href={candidate.linkedin_url.startsWith('http') ? candidate.linkedin_url : `https://${candidate.linkedin_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                LinkedIn
              </a>
            )}
            {candidate.portfolio_url && (
              <a 
                href={candidate.portfolio_url.startsWith('http') ? candidate.portfolio_url : `https://${candidate.portfolio_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Portfolio
              </a>
            )}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">Documents de candidature</Label>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des documents...
          </div>
        ) : error ? (
          <p className="text-sm text-red-500">Erreur lors du chargement des documents</p>
        ) : documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {getDocumentTypeLabel(doc.document_type)} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(toUrl(doc.file_path), '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = toUrl(doc.file_path);
                      link.download = doc.filename;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun document disponible</p>
        )}
      </div>

      {/* Note d'information pour les observateurs */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Mode Observateur</h4>
            <p className="text-sm text-blue-700">
              Vous êtes en mode observateur. Vous pouvez consulter toutes les informations des candidats 
              mais vous ne pouvez pas modifier leur statut, ajouter des commentaires ou effectuer des évaluations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ObserverCandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [selectedCandidate, setSelectedCandidate] = useState<UICandidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: applications, isLoading, error } = useRecruiterApplications();

  // Transformer les applications en candidats pour l'interface
  const candidates: UICandidate[] = useMemo(() => {
    if (!applications) return [];
    
    return applications.map(app => ({
      id: app.id,
      firstName: app.users?.first_name || 'N/A',
      lastName: app.users?.last_name || 'N/A',
      email: app.users?.email || 'N/A',
      phone: app.users?.phone as string,
      gender: (app.users as any)?.sexe || (app.users as any)?.gender,
      birthDate: (app.users as any)?.candidate_profiles?.birth_date,
      currentPosition: (app.users as any)?.candidate_profiles?.current_position,
      location: (app.users as any)?.candidate_profiles?.address,
      appliedDate: app.created_at,
      status: app.status,
      jobTitle: app.job_offers?.title,
      linkedin_url: (app.users as any)?.candidate_profiles?.linkedin_url,
      portfolio_url: (app.users as any)?.candidate_profiles?.portfolio_url,
    }));
  }, [applications]);

  // Filtrer les candidats
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const matchesSearch = 
        candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchTerm, statusFilter]);

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case 'candidature': return 'default';
      case 'incubation': return 'secondary';
      case 'embauche': return 'success';
      case 'refuse': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'candidature': return 'Candidature';
      case 'incubation': return 'En incubation';
      case 'embauche': return 'Embauché';
      case 'refuse': return 'Refusé';
      default: return status;
    }
  };

  if (error) {
    return (
      <ObserverLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur lors du chargement: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </ObserverLayout>
    );
  }

  return (
    <ObserverLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Candidats - Mode Observateur</h1>
          <p className="text-muted-foreground">
            Consultez la liste des candidats et leurs informations (lecture seule)
          </p>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, email ou poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "all")}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="candidature">Candidature</SelectItem>
                <SelectItem value="incubation">En incubation</SelectItem>
                <SelectItem value="embauche">Embauché</SelectItem>
                <SelectItem value="refuse">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>{filteredCandidates.length} candidat(s) trouvé(s)</span>
          </div>
        </div>

        {/* Liste des candidats */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(candidate.status)}>
                          {getStatusLabel(candidate.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{candidate.email}</span>
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                        {candidate.currentPosition && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span>{candidate.currentPosition}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{format(new Date(candidate.appliedDate), 'dd/MM/yyyy', { locale: fr })}</span>
                        </div>
                      </div>
                      
                      {candidate.jobTitle && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          <span>Poste candidaté : {candidate.jobTitle}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog open={isModalOpen && selectedCandidate?.id === candidate.id} onOpenChange={(open) => {
                        if (open) {
                          setSelectedCandidate(candidate);
                          setIsModalOpen(true);
                        } else {
                          setIsModalOpen(false);
                          setSelectedCandidate(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Détails du candidat</DialogTitle>
                            <DialogDescription>
                              Informations complètes de {candidate.firstName} {candidate.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          <CandidateModal 
                            candidate={candidate} 
                            isOpen={isModalOpen} 
                            onClose={() => {
                              setIsModalOpen(false);
                              setSelectedCandidate(null);
                            }} 
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Message si aucun candidat trouvé */}
        {!isLoading && filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Aucun candidat ne correspond aux critères de recherche"
                : "Aucun candidat trouvé"
              }
            </div>
            {(searchTerm || statusFilter !== "all") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        )}
      </div>
    </ObserverLayout>
  );
}
