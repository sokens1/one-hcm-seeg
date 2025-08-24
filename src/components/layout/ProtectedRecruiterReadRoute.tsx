import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRecruiterReadRouteProps {
  children: React.ReactNode;
}

export function ProtectedRecruiterReadRoute({ children }: ProtectedRecruiterReadRouteProps) {
  const { user, isLoading, isRoleLoading, isRecruiter, isObserver } = useAuth();
  const isAuthenticated = !!user;
  const location = useLocation();

  if (isLoading || isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !(isRecruiter || isObserver)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
