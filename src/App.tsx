import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// Import candidate pages
import CandidateJobs from "./pages/candidate/CandidateJobs";
import JobDetail from "./pages/candidate/JobDetail";
import CandidateSignup from "./pages/candidate/CandidateSignup";
import CandidateLogin from "./pages/candidate/CandidateLogin";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";

import CandidateApplicationTracking from "./pages/candidate/CandidateApplicationTracking";
import CandidateApplications from "./pages/candidate/CandidateApplications";
import CandidateProfile from "./pages/candidate/CandidateProfile";
import CandidateSettings from "./pages/candidate/CandidateSettings";
import CompanyContext from "./pages/candidate/CompanyContext";
import { ResetPassword } from "./pages/ResetPassword";

// Import recruiter pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import CreateJob from "./pages/recruiter/CreateJob";
import EditJob from "./pages/recruiter/EditJob";
import JobPipeline from "./pages/recruiter/JobPipeline";
import CandidatesPage from "./pages/recruiter/CandidatesPage";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import CandidateAnalysis from "./pages/recruiter/CandidateAnalysis";
import { ProtectedRecruiterRoute } from "./components/layout/ProtectedRecruiterRoute";

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
      {/* Home and Candidate Routes */}
      <Route index element={<Index />} />
      <Route path="auth" element={<Auth />} />
      <Route path="jobs" element={<CandidateJobs />} />
      <Route path="jobs/:id" element={<JobDetail />} />
      <Route path="candidate/signup" element={<CandidateSignup />} />
      <Route path="candidate/login" element={<CandidateLogin />} />
      <Route path="candidate/dashboard" element={<ProtectedRoute requiredRole="candidat"><CandidateDashboard /></ProtectedRoute>} />
      <Route path="candidate/jobs" element={<CandidateJobs />} />
      <Route path="candidate/application/:id" element={<CandidateApplicationTracking />} />
      <Route path="candidate/applications" element={<CandidateApplications />} />
      <Route path="candidate/profile" element={<CandidateProfile />} />
      <Route path="candidate/settings" element={<CandidateSettings />} />
      <Route path="company-context" element={<CompanyContext />} />
      <Route path="reset-password" element={<ResetPassword />} />
      
      {/* Recruiter Routes */}
      <Route path="recruiter" element={<ProtectedRecruiterRoute><RecruiterDashboard /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/dashboard" element={<ProtectedRecruiterRoute><RecruiterDashboard /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/profile" element={<ProtectedRecruiterRoute><RecruiterProfile /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/jobs/new" element={<ProtectedRecruiterRoute><CreateJob /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/jobs/:id/edit" element={<ProtectedRecruiterRoute><EditJob /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/jobs/:id/pipeline" element={<ProtectedRecruiterRoute><JobPipeline /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/candidates" element={<ProtectedRecruiterRoute><CandidatesPage /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/jobs" element={<ProtectedRecruiterRoute><RecruiterJobs /></ProtectedRecruiterRoute>} />
      <Route path="recruiter/candidates/:id/analysis" element={<ProtectedRecruiterRoute><CandidateAnalysis /></ProtectedRecruiterRoute>} />
      
      {/* Fallback routes */}
      <Route path="index" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster />
            <Sonner />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
