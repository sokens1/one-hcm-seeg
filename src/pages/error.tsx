import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import type { FallbackProps } from 'react-error-boundary';

type ErrorBoundaryProps = FallbackProps & {
  error?: Error;
  resetErrorBoundary?: () => void;
};

export function ErrorPage({ error, resetErrorBoundary }: ErrorBoundaryProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
          <p className="text-muted-foreground">
            {error?.message || "Une erreur inattendue s'est produite. Veuillez réessayer."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {resetErrorBoundary ? (
            <Button onClick={resetErrorBoundary}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          ) : (
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recharger la page
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Page d'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}

// Error boundary component
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorPage 
      error={error} 
      resetErrorBoundary={resetErrorBoundary}
    />
  );
}

export default ErrorPage;
