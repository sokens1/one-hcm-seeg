import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useRef, useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'candidat' | 'recruteur' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isRoleLoading, isCandidate, isRecruiter, isAdmin } = useAuth();
  const hasAttemptedLoad = useRef(false);

  useEffect(() => {
    if (!isLoading && !isRoleLoading) {
      hasAttemptedLoad.current = true;
    }
  }, [isLoading, isRoleLoading]);

  // Wait for initial load to complete before making decisions
  if ((isLoading || isRoleLoading) && !hasAttemptedLoad.current) {
    return <div data-testid="loading-spinner" style={{ display: 'none' }} />;
  }

  // Only redirect if we're sure there's no user after initial load
  if (!user && hasAttemptedLoad.current) {
    return <Navigate to="/" replace />;
  }

  // Check role only if user exists and we've completed loading
  if (requiredRole && user && hasAttemptedLoad.current) {
    const hasRequiredRole = 
      (requiredRole === 'candidat' && isCandidate) ||
      (requiredRole === 'recruteur' && (isRecruiter || isAdmin)) ||
      (requiredRole === 'admin' && isAdmin);

    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}