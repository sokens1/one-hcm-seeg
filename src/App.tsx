import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
// import { AzureAuthProvider } from "@/hooks/useAzureAuth"; // Azure API - Commenté temporairement
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CampaignProvider } from "@/contexts/CampaignContext";
import { ProtectedRecruiterRoute } from "./components/layout/ProtectedRecruiterRoute";
import { ProtectedAdminRoute } from "./components/layout/ProtectedAdminRoute";
import { ProtectedRecruiterReadRoute } from "./components/layout/ProtectedRecruiterReadRoute";
import { Loader2 } from 'lucide-react';
import { MAINTENANCE_MODE, MAINTENANCE_HOURS } from '@/config/maintenance';
import './index.css';
import { ErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ui/ErrorFallback';

//Maintenance page
const Maintenance = lazy(() => import("./pages/maintenance"));

// Error pages
const NotFoundPage = lazy(() => import("./pages/404"));
const ErrorPage = lazy(() => import("./pages/error").then(module => ({ default: module.ErrorFallback })));

// Lazily load page components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword").then(module => ({ default: module.ResetPassword })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Candidate pages
const CandidateJobs = lazy(() => import("./pages/candidate/CandidateJobs"));
const JobDetail = lazy(() => import("./pages/candidate/JobDetail"));
const ApplyToJob = lazy(() => import("./pages/candidate/ApplyToJob"));
const CandidateSignup = lazy(() => import("./pages/candidate/CandidateSignup"));
const CandidateLogin = lazy(() => import("./pages/candidate/CandidateLogin"));
const CandidateDashboard = lazy(() => import("./pages/candidate/CandidateDashboard"));
const CandidateApplicationTracking = lazy(() => import("./pages/candidate/CandidateApplicationTracking"));
const CandidateApplications = lazy(() => import("./pages/candidate/CandidateApplications"));
const CandidateProfile = lazy(() => import("./pages/candidate/CandidateProfile"));
const CandidateSettings = lazy(() => import("./pages/candidate/CandidateSettings"));
const CompanyContext = lazy(() => import("./pages/candidate/CompanyContext"));
const EditApplication = lazy(() => import("./pages/candidate/EditApplication"));

// Recruiter pages
const RecruiterDashboard = lazy(() => import("./pages/recruiter/RecruiterDashboard"));
const CreateJob = lazy(() => import("./pages/recruiter/CreateJob"));
const EditJob = lazy(() => import("./pages/recruiter/EditJob"));
const JobPipeline = lazy(() => import("./pages/recruiter/JobPipeline"));
const CandidatesPage = lazy(() => import("./pages/recruiter/CandidatesPage"));
const RecruiterJobs = lazy(() => import("./pages/recruiter/RecruiterJobs"));
const RecruiterProfile = lazy(() => import("./pages/recruiter/RecruiterProfile"));
const CandidateAnalysis = lazy(() => import("./pages/recruiter/CandidateAnalysis"));
const Traitements_IA = lazy(() => import("./pages/recruiter/Traitements_IA"));
const AccessRequests = lazy(() => import("./pages/recruiter/AccessRequests"));

// Observer pages
const ObserverDashboard = lazy(() => import("./pages/observer/ObserverDashboard"));
const ObserverCandidatesPage = lazy(() => import("./pages/observer/ObserverCandidatesPage"));
const ObserverCandidateAnalysis = lazy(() => import("./pages/observer/ObserverCandidateAnalysis"));
const ObserverTraitements_IA = lazy(() => import("./pages/observer/Traitements_IA"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

// AI Analysis page
const AIAnalysisPage = lazy(() => import("./pages/ai-analysis/AIAnalysisPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      {/* Maintenance page */}
      <Route path="maintenance" element={<Maintenance />} />
      {/* Home and Candidate Routes */}
      <Route index element={<Index />} />
      <Route path="auth" element={<Auth />} />
      <Route path="jobs" element={<CandidateJobs />} />
      <Route path="jobs/:id" element={<JobDetail />} />
      <Route path="jobs/:id/apply" element={<ProtectedRoute requiredRole="candidat"><ApplyToJob /></ProtectedRoute>} />
      <Route path="candidate/signup" element={<CandidateSignup />} />
      <Route path="candidate/login" element={<CandidateLogin />} />
      <Route path="candidate/dashboard" element={<ProtectedRoute requiredRole="candidat"><CandidateDashboard /></ProtectedRoute>} />
      <Route path="candidate/jobs" element={<CandidateJobs />} />
      <Route path="candidate/application/:id" element={<CandidateApplicationTracking />} />
      <Route path="candidate/applications" element={<CandidateApplications />} />
      <Route path="candidate/applications/:id/edit" element={<ProtectedRoute requiredRole="candidat"><EditApplication /></ProtectedRoute>} />
      <Route path="candidate/profile" element={<CandidateProfile />} />
      <Route path="candidate/settings" element={<CandidateSettings />} />
      <Route path="company-context" element={<CompanyContext />} />
      <Route path="privacy-policy" element={<PrivacyPolicy />} />
      <Route path="reset-password" element={<ResetPassword />} />
      
      {/* Recruiter Routes */}
      <Route path="recruiter" element={<ProtectedRecruiterReadRoute><RecruiterDashboard /></ProtectedRecruiterReadRoute>} />
      <Route path="recruiter/dashboard" element={<ProtectedRecruiterReadRoute><RecruiterDashboard /></ProtectedRecruiterReadRoute>} />
      <Route path="recruiter/profile" element={<ProtectedRecruiterReadRoute><RecruiterProfile /></ProtectedRecruiterReadRoute>} />
      <Route path="recruiter/jobs/new" element={<ProtectedRecruiterRoute><CreateJob /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/jobs/:id/edit" element={<ProtectedRecruiterRoute><EditJob /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/jobs/:id/pipeline" element={<ProtectedRecruiterReadRoute><JobPipeline /></ProtectedRecruiterReadRoute>} />
      <Route path="recruiter/candidates" element={<ProtectedRecruiterReadRoute><CandidatesPage /></ProtectedRecruiterReadRoute>} />
      <Route path="recruiter/access-requests" element={<ProtectedRecruiterReadRoute><AccessRequests /></ProtectedRecruiterReadRoute>} />
      <Route path="recruiter/jobs" element={<ProtectedRecruiterReadRoute><RecruiterJobs /></ProtectedRecruiterReadRoute>} />
      <Route path="recruiter/candidates/:id/analysis" element={<ProtectedRecruiterReadRoute><CandidateAnalysis /></ProtectedRecruiterReadRoute>} />
      <Route path="recruiter/traitements-ia" element={<ProtectedRecruiterReadRoute><Traitements_IA /></ProtectedRecruiterReadRoute>} />
      
      {/* Observer Routes */}
      <Route path="observer/dashboard" element={<ProtectedRecruiterReadRoute><ObserverDashboard /></ProtectedRecruiterReadRoute>} />
      <Route path="observer/candidates" element={<ProtectedRecruiterReadRoute><ObserverCandidatesPage /></ProtectedRecruiterReadRoute>} />
      <Route path="observer/candidates/:id/analysis" element={<ProtectedRecruiterReadRoute><ObserverCandidateAnalysis /></ProtectedRecruiterReadRoute>} />
      <Route path="observer/traitements-ia" element={<ProtectedRecruiterReadRoute><ObserverTraitements_IA /></ProtectedRecruiterReadRoute>} />
      
      {/* Admin Routes */}
      <Route path="admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
      
      {/* AI Analysis Route */}
      <Route path="ai-analysis" element={<ProtectedRecruiterReadRoute><AIAnalysisPage /></ProtectedRecruiterReadRoute>} />
      
      {/* Fallback routes */}
      {/* Error handling routes */}
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
  )
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Vérifier si nous sommes en période de maintenance
const isMaintenanceTime = () => {
  // Vérifier si on est dans la plage horaire de maintenance
  const now = new Date();
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const startTimeInMinutes = MAINTENANCE_HOURS.start.hour * 60 + MAINTENANCE_HOURS.start.minute;
  const endTimeInMinutes = MAINTENANCE_HOURS.end.hour * 60 + MAINTENANCE_HOURS.end.minute;
  
  // Déterminer si on est dans la plage de maintenance (00h00-00h40)
  const isInMaintenanceWindow = startTimeInMinutes < endTimeInMinutes
    ? currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes
    : currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes;
  
  // Si MAINTENANCE_MODE est défini, on suit sa valeur
  // Sinon, on suit la plage horaire
  if (typeof MAINTENANCE_MODE !== 'undefined') {
    return MAINTENANCE_MODE && isInMaintenanceWindow;
  }
  
  return isInMaintenanceWindow;
};

// Créer un wrapper pour les routes protégées par maintenance
const withMaintenanceCheck = (element: React.ReactNode) => {
  const isMaintenance = isMaintenanceTime();
  const isOnMaintenancePage = window.location.pathname === '/maintenance';
  
  if (isMaintenance && !isOnMaintenancePage) {
    // Rediriger vers la page de maintenance si nécessaire
    window.location.href = '/maintenance';
    return <LoadingFallback />;
  } else if (!isMaintenance && isOnMaintenancePage) {
    // Rediriger vers la page d'accès si on est sur la page de maintenance mais qu'elle n'est plus nécessaire
    window.location.href = '/';
    return <LoadingFallback />;
  }
  
  return element;
};

function App() {
  // Composant de secours personnalisé pour ErrorBoundary
  const CustomErrorFallback = (props: FallbackProps) => {
    return <ErrorFallback error={props.error} onRetry={props.resetErrorBoundary} />;
  };

  return (
    <ErrorBoundary FallbackComponent={CustomErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CampaignProvider>
            {/* <AzureAuthProvider> Azure API - Commenté temporairement */}
              <TooltipProvider>
                <Suspense fallback={<LoadingFallback />}>
                  {withMaintenanceCheck(
                    <>
                      <RouterProvider router={router} />
                      <Toaster />
                      <Sonner />
                    </>
                  )}
                </Suspense>
              </TooltipProvider>
            {/* </AzureAuthProvider> */}
          </CampaignProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
