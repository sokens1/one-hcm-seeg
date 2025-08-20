import { useAuth } from "@/hooks/useAuth";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Accès administrateur requis</h1>
          <p className="text-muted-foreground">Vous devez être connecté en tant qu'administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
