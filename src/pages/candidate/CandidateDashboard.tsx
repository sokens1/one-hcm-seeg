import { useState } from "react";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { CandidateHeader } from "@/components/candidate/CandidateHeader";
import { DashboardMain } from "@/components/candidate/DashboardMain";
import { JobCatalog } from "@/components/candidate/JobCatalog";
import { JobDetail } from "@/components/candidate/JobDetail";
import { ApplicationTracking } from "@/components/candidate/ApplicationTracking";

// Mock data
export const jobs = [
  {
    id: 1,
    title: "Directeur Général",
    department: "Direction Générale",
    location: "Libreville",
    type: "CDI",
    description: "Assurer la direction stratégique et opérationnelle de l'entreprise",
    requirements: "15+ années d'expérience en direction générale",
    missions: [
      "Définir la stratégie de l'entreprise",
      "Superviser les opérations",
      "Piloter les équipes dirigeantes"
    ],
    competences: [
      "Leadership",
      "Gestion stratégique", 
      "Management d'équipes"
    ],
    conditions: "CDI, salaire selon expérience, avantages sociaux"
  },
  {
    id: 2,
    title: "Directeur des Ressources Humaines", 
    department: "Ressources Humaines",
    location: "Libreville",
    type: "CDI",
    description: "Piloter la stratégie RH et accompagner la transformation",
    requirements: "10+ années d'expérience en RH",
    missions: [
      "Développer la stratégie RH",
      "Gérer les talents",
      "Accompagner le changement"
    ],
    competences: [
      "Management RH",
      "Gestion des talents",
      "Communication"
    ],
    conditions: "CDI, salaire selon expérience, formation continue"
  },
  {
    id: 3,
    title: "Directeur Financier",
    department: "Finance",
    location: "Libreville", 
    type: "CDI",
    description: "Superviser la gestion financière et la stratégie d'investissement",
    requirements: "12+ années d'expérience en finance",
    missions: [
      "Piloter la stratégie financière",
      "Superviser la comptabilité",
      "Gérer les investissements"
    ],
    competences: [
      "Finance d'entreprise",
      "Analyse financière",
      "Contrôle de gestion"
    ],
    conditions: "CDI, package attractif, bonus sur performance"
  }
];

export const mockApplications = [
  {
    id: 1,
    jobTitle: "Directeur des Ressources Humaines",
    department: "Ressources Humaines",
    location: "Libreville",
    dateApplied: "15 Décembre 2024",
    status: "En cours d'évaluation"
  },
  {
    id: 2,
    jobTitle: "Directeur Financier", 
    department: "Finance",
    location: "Libreville",
    dateApplied: "10 Décembre 2024",
    status: "Protocole 1 - Adhérence MTP"
  }
];

export type ViewType = 'dashboard' | 'catalog' | 'job-detail' | 'application-tracking';

export default function CandidateDashboard() {
  const { user, logout } = useCandidateAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    navigate("/");
  };

  const handleViewJobDetail = (jobId: number) => {
    setSelectedJobId(jobId);
    setCurrentView('job-detail');
  };

  const handleViewApplicationTracking = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setCurrentView('application-tracking');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedJobId(null);
    setSelectedApplicationId(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'catalog':
        return (
          <JobCatalog 
            jobs={jobs}
            onViewJob={handleViewJobDetail}
            onBackToDashboard={handleBackToDashboard}
          />
        );
      case 'job-detail':
        if (!selectedJobId) return null;
        const selectedJob = jobs.find(job => job.id === selectedJobId);
        if (!selectedJob) return null;
        return (
          <JobDetail 
            job={selectedJob}
            onBack={handleBackToDashboard}
            onApply={() => {
              toast({
                title: "Candidature envoyée",
                description: "Votre candidature a été soumise avec succès.",
              });
              handleBackToDashboard();
            }}
          />
        );
      case 'application-tracking':
        if (!selectedApplicationId) return null;
        const selectedApplication = mockApplications.find(app => app.id === selectedApplicationId);
        if (!selectedApplication) return null;
        return (
          <ApplicationTracking 
            application={selectedApplication}
            onBack={handleBackToDashboard}
          />
        );
      default:
        return (
          <DashboardMain 
            applications={mockApplications}
            jobs={jobs}
            onViewCatalog={() => setCurrentView('catalog')}
            onViewApplicationDetail={handleViewApplicationTracking}
            onViewJobDetail={handleViewJobDetail}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CandidateHeader user={user} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-6">
        {renderCurrentView()}
      </main>
    </div>
  );
}
