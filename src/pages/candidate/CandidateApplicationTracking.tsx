import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CandidateLayout } from "@/components/layout/CandidateLayout";
import { ApplicationTracking } from "@/components/candidate/ApplicationTracking";
import { FullPageSpinner } from "@/components/ui/spinner";

export default function CandidateApplicationTracking() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/candidate/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <FullPageSpinner text="Chargement du suivi des candidatures..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <CandidateLayout>
      <ApplicationTracking />
    </CandidateLayout>
  );
}