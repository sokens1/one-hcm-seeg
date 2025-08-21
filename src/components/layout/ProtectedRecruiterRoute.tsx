import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRecruiterRouteProps {
  children: React.ReactNode;
}

export function ProtectedRecruiterRoute({ children }: ProtectedRecruiterRouteProps) {
  const { user, isLoading, isRecruiter } = useAuth();
  const isAuthenticated = !!user;
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isRecruiter) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}