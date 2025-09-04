/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
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
import { useFileUpload } from "@/hooks/useFileUpload";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Types dérivés des applications
type ApplicationStatus = 'candidature' | 'incubation' | 'embauche' | 'refuse' | 'entretien_programme';

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
          <Label className="text-sm text-muted-foreground">Poste postulé</Label>
          <p className="font-medium">{candidate.jobTitle || 'Non spécifié'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Statut:</Label>
          <Badge variant="secondary" className={statusConfig[candidate.status]?.color || "bg-gray-100 text-gray-800 border-gray-200"}>
            {statusConfig[candidate.status]?.label || "Inconnu"}
          </Badge>
        </div>
        <div className="md:col-span-2">
          <Label className="text-sm text-muted-foreground">Poste actuel</Label>
          <p className="font-medium">{candidate.currentPosition || 'Non renseigné'}</p>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <Label className="text-sm text-muted-foreground">Documents fournis</Label>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des documents...</div>
        )}
        {error && (
          <div className="text-sm text-red-600">Erreur de chargement: {(error as any).message}</div>
        )}
        {!isLoading && !error && (
          documents && documents.length > 0 ? (
            <ul className="space-y-2">
              {documents.map(doc => (
                <li key={doc.id} className="flex items-center justify-between rounded border p-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{getDocumentTypeLabel(doc.document_type)} — {doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(doc.file_size)}</p>
                  </div>
                  <a
                    href={toUrl(doc.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Ouvrir
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun document fourni.</p>
          )
        )}
      </div>
    </div>
  );
}

function CandidateDetails({ candidate, isObserver }: { candidate: UICandidate, isObserver: boolean }) {
  const { data: documents = [], isLoading, error } = useApplicationDocuments(candidate.id);

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
          <Label className="text-sm text-muted-foreground">Poste postulé</Label>
          <p className="font-medium">{candidate.jobTitle || 'Non spécifié'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Statut:</Label>
          <Badge variant="secondary" className={statusConfig[candidate.status]?.color || "bg-gray-100 text-gray-800 border-gray-200"}>
            {statusConfig[candidate.status]?.label || "Inconnu"}
          </Badge>
        </div>
        <div className="md:col-span-2">
          <Label className="text-sm text-muted-foreground">Poste actuel</Label>
          <p className="font-medium">{candidate.currentPosition || 'Non renseigné'}</p>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <Label className="text-sm text-muted-foreground">Documents fournis</Label>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des documents...</div>
        )}
        {error && (
          <div className="text-sm text-red-600">Erreur de chargement: {(error as any).message}</div>
        )}
        {!isLoading && !error && (
          documents.length > 0 ? (
            <ul className="space-y-2">
              {documents.map(doc => (
                <li key={doc.id} className="flex items-center justify-between rounded border p-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{getDocumentTypeLabel(doc.document_type)} — {doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(doc.file_size)}</p>
                  </div>
                  <a
                    href={toUrl(doc.file_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Ouvrir
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun document fourni.</p>
          )
        )}
      </div>
    </div>
  );
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  candidature: { label: "Candidat", color: "bg-blue-100 text-blue-800 border-blue-200" },
  incubation: { label: "Incubé", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  embauche: { label: "Engagé", color: "bg-green-100 text-green-800 border-green-200" },
  refuse: { label: "Refusé", color: "bg-red-100 text-red-800 border-red-200" },
  entretien_programme: { label: "Entretien-Programmé", color: "bg-purple-100 text-purple-800 border-purple-200" },
};

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>("all");
  const { applications, isLoading, error } = useRecruiterApplications();
  const { isObserver } = useAuth();
  
  console.log('[CANDIDATES PAGE DEBUG] Applications hook result:', { applications, isLoading, error });
  console.log('[CANDIDATES PAGE DEBUG] Applications count:', applications?.length);
  
  // Log current user info for debugging
  useEffect(() => {
    const logUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[CANDIDATES DEBUG] Current recruiter user:', { 
        id: user?.id, 
        email: user?.email,
        role: user?.user_metadata?.role 
      });
      
      if (user?.id) {
        const { data: userRole, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        console.log('[CANDIDATES DEBUG] Recruiter role from DB:', userRole, 'Error:', roleError);
      }
    };
    logUserInfo();
  }, []);

  const uiCandidates: UICandidate[] = useMemo(() => {
    return (applications || []).map(app => {
      const user = (app.users as any) || {};
      const profile = user?.candidate_profiles || {};
      
      // Vérifier que le statut est valide, sinon utiliser 'candidature' par défaut
      const validStatus = app.status && statusConfig[app.status as ApplicationStatus] 
        ? app.status as ApplicationStatus 
        : 'candidature';
      
      return {
        id: app.id,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || undefined,
        gender: user.gender || profile.gender || undefined,
        birthDate: user.date_of_birth || profile.birth_date || undefined,
        currentPosition: profile.current_position || user.current_position || undefined,
        location: app.job_offers?.location || undefined,
        appliedDate: app.created_at,
        status: validStatus,
        jobTitle: app.job_offers?.title || undefined,
        linkedin_url: profile.linkedin_url || user.linkedin_url || undefined,
        portfolio_url: profile.portfolio_url || user.portfolio_url || undefined,
      };
    });
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
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Toutes les Candidatures
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gérez et suivez tous les candidats qui ont postulé aux offres SEEG.
            </p>
          </div>
          <Link to="/recruiter">
            <Button variant="outline" className="text-sm sm:text-base w-full sm:w-auto">
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
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="text-xs sm:text-sm"
            >
              Tous
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status as ApplicationStatus)}
                className="text-xs sm:text-sm"
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className={`gap-2 ${isObserver ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={isObserver}
                              title={isObserver ? "Lecture seule - Mode observateur" : "Voir les détails"}
                            >
                              <Eye className="w-4 h-4" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Détails du candidat</DialogTitle>
                              <DialogDescription>
                                {isObserver ? (
                                  <span className="text-yellow-600">Mode observateur - Lecture seule</span>
                                ) : (
                                  "Consulter les informations détaillées du candidat et les documents soumis."
                                )}
                              </DialogDescription>
                            </DialogHeader>
                            <CandidateDetails candidate={candidate} isObserver={isObserver} />
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
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">Aucun candidat trouvé</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              Aucun candidat ne correspond à vos critères de recherche.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-xs sm:text-sm"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}