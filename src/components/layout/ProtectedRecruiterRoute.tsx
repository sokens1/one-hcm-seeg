import { useRecruiterAuth } from "@/hooks/useRecruiterAuth";
import RecruiterLogin from "@/pages/recruiter/RecruiterLogin";

interface ProtectedRecruiterRouteProps {
  children: React.ReactNode;
}

export function ProtectedRecruiterRoute({ children }: ProtectedRecruiterRouteProps) {
  const { isAuthenticated, isLoading } = useRecruiterAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <RecruiterLogin />;
  }

  return <>{children}</>;
}