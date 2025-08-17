import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { DashboardMain } from "@/components/candidate/DashboardMain";

export default function CandidateDashboard() {
  const { isAuthenticated, isLoading } = useCandidateAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/candidate/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <CandidateLayout>
      <DashboardMain />
    </CandidateLayout>
  );
}