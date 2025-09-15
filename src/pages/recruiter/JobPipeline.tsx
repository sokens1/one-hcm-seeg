/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router-dom";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Eye, Loader2, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecruiterApplications } from "@/hooks/useApplications";
import { useState } from "react";
import { formatLocalDate } from "@/utils/dateUtils";
import { useSynthesisData } from "@/hooks/useSynthesisData";

// Types pour les candidats
interface Candidate {
  id: string;
  name: string;
  statusLabel: string;
  phone: string;
  experience: string;
  status: 'candidature' | 'incubation' | 'embauche' | 'refuse' | 'entretien_programme';
  score: number;
  applicationDate: string;
  email: string;
  interviewDate?: string; // Date de l'entretien programmé
  globalScore?: number; // Score global de la synthèse

  gender?: string;
  birthDate?: string;
}

// Composant pour afficher le score global d'un candidat
const CandidateScoreDisplay = ({ applicationId }: { applicationId: string }) => {
  const { synthesisData } = useSynthesisData(applicationId);
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs sm:text-sm text-muted-foreground">Score</span>
      <Badge variant="outline" className="text-xs sm:text-sm">
        {Math.round(synthesisData.globalScore)}%
      </Badge>
    </div>
  );
};

// Fonction pour normaliser les statuts corrompus
const normalizeStatus = (status: string): string => {
  if (!status) return 'candidature';
  
  // Si le statut contient des noms ou des dates, considérer comme candidature
  if (status.includes(' ') || status.includes('-') || status.includes('@') || status.includes(':')) {
    return 'candidature';
  }
  
  // Statuts valides
  const validStatuses = ['candidature', 'incubation', 'embauche', 'refuse', 'entretien_programme', 'simulation_programmee'];
  if (validStatuses.includes(status.toLowerCase())) {
    return status.toLowerCase();
  }
  
  // Par défaut, considérer comme candidature
  return 'candidature';
};

const getStatusLabel = (status: string) => {
  const normalizedStatus = normalizeStatus(status);
  switch (normalizedStatus) {
    case 'candidature': return 'Candidats';
    case 'incubation': return 'Incubés';
    case 'embauche': return 'Engagés';
    case 'refuse': return 'Refusés';
    case 'entretien_programme': return 'Entretiens';
    case 'simulation_programmee': return 'Simulations';
    default: return 'Candidats';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'candidature': return 'border-blue-500';
    case 'incubation': return 'border-warning';
    case 'embauche': return 'border-success';
    case 'refuse': return 'border-red-500';
    case 'entretien_programme': return 'border-purple-500';
    case 'simulation_programmee': return 'border-blue-600';
    default: return 'border-muted';
  }
};

export default function JobPipeline() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, isLoading, error, updateApplicationStatus } = useRecruiterApplications(id);

  // Transform applications to candidates format
  // Fonction helper pour valider et formater une date
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  // Fonction helper pour formater une date d'affichage
  const formatDisplayDate = (dateValue: any): string => {
    if (!dateValue) return 'Non définie';
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleDateString('fr-FR');
  };

  const candidates: Candidate[] = applications.map(app => {
    console.log('Application data received in JobPipeline:', app);
    console.log('Raw interview_date from DB:', app.interview_date);
    
    const normalizedStatus = normalizeStatus(app.status);
    
    const candidate = {
      id: app.id,
      name: `${app.users?.first_name || ''} ${app.users?.last_name || ''}`.trim(),
      statusLabel: getStatusLabel(app.status),
      phone: app.users?.phone || 'Non fourni',
      experience: '', // Placeholder for future use
      status: normalizedStatus, // Utiliser le statut normalisé
      score: 0, // TODO: Calculate from evaluations
      applicationDate: formatDate(app.created_at),
      email: app.users?.email || '',
      interviewDate: app.interview_date, // Assuming interview_date is available in the application data
      simulationDate: app.simulation_date, // Date de la simulation programmée

      gender: (app.users as any)?.sexe,
      birthDate: formatDate(app.users?.date_of_birth)
    };
    
    if (app.interview_date) {
      console.log('🔍 Interview date for', candidate.name, ':', app.interview_date);
    }
    
    return candidate;
  });

  const jobTitle = applications[0]?.job_offers?.title || "Offre d'emploi";
  const getCandidatesByStatus = (status: string) => {
    if (status === 'candidature') {
      // Inclure les candidats avec statut 'candidature' ET 'entretien_programme'
      return candidates.filter(candidate => 
        candidate.status === 'candidature' || candidate.status === 'entretien_programme'
      );
    }
    if (status === 'incubation') {
      // Inclure les candidats avec statut 'incubation' ET ceux avec simulation programmée
      return candidates.filter(candidate => 
        candidate.status === 'incubation' || 
        candidate.status === 'simulation_programmee' ||
        (candidate.status === 'incubation' && candidate.simulationDate)
      );
    }
    return candidates.filter(candidate => candidate.status === status);
  };

  const statuses = [
    { key: 'candidature', label: 'Candidats', color: 'border-blue-500' },
    { key: 'incubation', label: 'Incubés', color: 'border-warning' },
    { key: 'embauche', label: 'Engagés', color: 'border-success' },
    { key: 'refuse', label: 'Refusés', color: 'border-red-500' }
  ];

  const handleAnalyzeCandidate = (candidateId: string) => {
    const jobId = id; // current job offer id from route params
    const suffix = jobId ? `?jobId=${jobId}` : "";
    console.log(`Navigating to analysis for candidate ${candidateId} with job ${jobId}`);
    navigate(`/recruiter/candidates/${candidateId}/analysis${suffix}`);
  };

  if (error) {
    return (
      <RecruiterLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur lors du chargement: {error.message}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Link to="/recruiter/jobs">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Retour aux postes</span>
                <span className="sm:hidden">Retour</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 break-words">
            Pipeline pour : {jobTitle}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
            Gérez le flux de tous les candidats pour ce poste de manière visuelle et interactive
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col sm:flex-row justify-center items-center py-8 sm:py-12 gap-2 sm:gap-4">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
            <span className="text-sm sm:text-base">Chargement du pipeline...</span>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune candidature trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Il n'y a actuellement aucune candidature pour cette offre d'emploi.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Actualiser
            </Button>
          </div>
        ) : (
          <>

            {/* Vue Kanban */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {statuses.map((status) => {
                const statusCandidates = getCandidatesByStatus(status.key);
                
                return (
                  <div key={status.key}>
                    <Card className={`border-t-4 ${status.color} h-full`}>
                      <CardHeader className="pb-2 sm:pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base sm:text-lg font-semibold truncate">{status.label}</CardTitle>
                                                     <Badge variant="secondary" className="text-xs sm:text-sm flex-shrink-0">
                             {statusCandidates.length}
                           </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 min-h-[300px] sm:min-h-[400px]">
                        {statusCandidates.map((candidate) => (
                          <Card key={candidate.id} className="p-3 sm:p-4 hover:shadow-medium transition-all cursor-pointer group">
                            <div className="space-y-2 sm:space-y-3">
                              <div className="space-y-1">
                                                                 <h4 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                   {candidate.name}
                                 </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate" title={candidate.email}>
                                  {candidate.email}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {candidate.phone}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Candidature : {formatDisplayDate(candidate.applicationDate)}
                                </p>
                                {/* Date de l'entretien si programmé */}
                                {candidate.status === 'entretien_programme' && candidate.interviewDate && (
                                  <div className="flex items-center gap-1 text-xs text-purple-600 whitespace-nowrap">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">
                                      Entretien : {(() => {
                                        // Utiliser formatage manuel pour éviter tout décalage
                                        const date = new Date(candidate.interviewDate);
                                        const day = date.getDate().toString().padStart(2, '0');
                                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                        const year = date.getFullYear();
                                        const hours = date.getHours().toString().padStart(2, '0');
                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                        
                                        return `${day}/${month}/${year} à ${hours}:${minutes}`;
                                      })()}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Date de la simulation si programmée */}
                                {candidate.simulationDate && (
                                  <div className="flex items-center gap-1 text-xs text-blue-600 whitespace-nowrap">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">
                                      Simulation : {(() => {
                                        // Utiliser formatage manuel pour éviter tout décalage
                                        const date = new Date(candidate.simulationDate);
                                        const day = date.getDate().toString().padStart(2, '0');
                                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                        const year = date.getFullYear();
                                        const hours = date.getHours().toString().padStart(2, '0');
                                        const minutes = date.getMinutes().toString().padStart(2, '0');
                                        
                                        return `${day}/${month}/${year} à ${hours}:${minutes}`;
                                      })()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Afficher le score uniquement pour les candidats évalués (incubés, embauchés, refusés) */}
                              {candidate.status !== 'candidature' && candidate.status !== 'entretien_programme' && candidate.status !== 'simulation_programmee' && (
                                <CandidateScoreDisplay applicationId={candidate.id} />
                              )}
                              
                              <Button 
                                size="sm" 
                                className="w-full gap-1 sm:gap-2 text-xs sm:text-sm"
                                variant="hero"
                                onClick={() => handleAnalyzeCandidate(candidate.id)}
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Analyser</span>
                                <span className="sm:hidden">Voir</span>
                              </Button>
                            </div>
                          </Card>
                        ))}
                        
                        {statusCandidates.length === 0 && (
                          <div className="text-center py-6 sm:py-8 text-muted-foreground">
                            <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs sm:text-sm">Aucun candidat</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </RecruiterLayout>
  );
}