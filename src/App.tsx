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
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProtectedRecruiterRoute } from "./components/layout/ProtectedRecruiterRoute";
import { ProtectedAdminRoute } from "./components/layout/ProtectedAdminRoute";
import { Loader2 } from 'lucide-react';

// Lazily load page components
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword").then(module => ({ default: module.ResetPassword })));

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

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

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
      
      {/* Admin Routes */}
      <Route path="admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
      
      {/* Fallback routes */}
      <Route path="index" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <RouterProvider
              router={router}
            />
          </Suspense>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
