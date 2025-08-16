import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Import candidate pages
import CandidateJobs from "./pages/candidate/CandidateJobs";
import JobDetail from "./pages/candidate/JobDetail";
import CandidateSignup from "./pages/candidate/CandidateSignup";
import CandidateLogin from "./pages/candidate/CandidateLogin";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CompanyContext from "./pages/candidate/CompanyContext";

// Import recruiter pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import CreateJob from "./pages/recruiter/CreateJob";
import EditJob from "./pages/recruiter/EditJob";
import JobPipeline from "./pages/recruiter/JobPipeline";
import CandidatesPage from "./pages/recruiter/CandidatesPage";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import RecruiterPipeline from "./pages/recruiter/RecruiterPipeline";
import { ProtectedRecruiterRoute } from "./components/layout/ProtectedRecruiterRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home and Candidate Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<CandidateJobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/candidate/signup" element={<CandidateSignup />} />
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/company-context" element={<CompanyContext />} />
          
          {/* Recruiter Routes */}
          <Route path="/recruiter" element={
            <ProtectedRecruiterRoute>
              <RecruiterDashboard />
            </ProtectedRecruiterRoute>
          } />
          <Route path="/recruiter/jobs/new" element={
            <ProtectedRecruiterRoute>
              <CreateJob />
            </ProtectedRecruiterRoute>
          } />
          <Route path="/recruiter/jobs/:id/edit" element={
            <ProtectedRecruiterRoute>
              <EditJob />
            </ProtectedRecruiterRoute>
          } />
          <Route path="/recruiter/jobs/:id/pipeline" element={
            <ProtectedRecruiterRoute>
              <JobPipeline />
            </ProtectedRecruiterRoute>
          } />
          <Route path="/recruiter/candidates" element={
            <ProtectedRecruiterRoute>
              <CandidatesPage />
            </ProtectedRecruiterRoute>
          } />
          <Route path="/recruiter/jobs" element={
            <ProtectedRecruiterRoute>
              <RecruiterJobs />
            </ProtectedRecruiterRoute>
          } />
          <Route path="/recruiter/pipeline" element={
            <ProtectedRecruiterRoute>
              <RecruiterPipeline />
            </ProtectedRecruiterRoute>
          } />
          
          {/* Fallback routes */}
          <Route path="/index" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
