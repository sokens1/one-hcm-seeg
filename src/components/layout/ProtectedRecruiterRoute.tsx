import { useAuth } from "@/hooks/useAuth";
import RecruiterLogin from "@/pages/recruiter/RecruiterLogin";

interface ProtectedRecruiterRouteProps {
  children: React.ReactNode;
}

export function ProtectedRecruiterRoute({ children }: ProtectedRecruiterRouteProps) {
  const { user, isLoading, isRecruiter, isAdmin } = useAuth();
  const isAuthenticated = !!user;
  // Allow recruiters and admins; role helpers already normalize 'recruteur'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !(isRecruiter || isAdmin)) {
    return <RecruiterLogin />;
  }

  return <>{children}</>;
}