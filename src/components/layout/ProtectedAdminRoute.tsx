import { useAuth } from "@/hooks/useAuth";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isLoading, isRoleLoading, isAdmin, userStatut } = useAuth();
  const isAuthenticated = !!user;

  if (isLoading || isRoleLoading) {
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

  // Vérifier le statut de l'utilisateur
  if (userStatut && userStatut !== 'actif') {
    const statutMessages: { [key: string]: string } = {
      'en_attente': 'Votre compte est en attente de validation par notre équipe.',
      'inactif': 'Votre compte a été désactivé. Contactez l\'administrateur.',
      'bloqué': 'Votre compte a été bloqué. Contactez l\'administrateur.',
      'archivé': 'Votre compte a été archivé. Contactez l\'administrateur.'
    };
    
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Accès Restreint</h2>
            <p className="text-gray-600 mb-4">
              {statutMessages[userStatut] || 'Votre compte n\'est pas actif.'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
