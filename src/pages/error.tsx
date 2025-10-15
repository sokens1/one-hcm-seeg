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

  // Détecter le type d'erreur spécifique
  const getErrorInfo = () => {
    if (!error) return { title: "Erreur inconnue", message: "Une erreur inattendue s'est produite. Veuillez réessayer." };
    
    const message = error.message.toLowerCase();
    
    // Erreur removeChild spécifique
    if (message.includes('removechild') || message.includes('notfounderror')) {
      return {
        title: "Erreur d'affichage",
        message: "Un problème d'affichage s'est produit. Cette erreur est généralement temporaire et se résout en rechargeant la page."
      };
    }
    
    // Erreurs de chargement de modules
    if (message.includes('chunk') || message.includes('loading') || message.includes('module')) {
      return {
        title: "Erreur de chargement",
        message: "Un problème de chargement s'est produit. Veuillez recharger la page pour continuer."
      };
    }
    
    // Erreurs de syntaxe
    if (message.includes('syntax') || message.includes('parse') || message.includes('script')) {
      return {
        title: "Erreur de script",
        message: "Une erreur de script s'est produite. Veuillez recharger la page."
      };
    }
    
    // Erreurs réseau
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        title: "Erreur de connexion",
        message: "Un problème de connexion s'est produit. Vérifiez votre connexion internet et réessayez."
      };
    }
    
    // Erreur générique
    return {
      title: "Erreur d'application",
      message: error.message || "Une erreur inattendue s'est produite. Veuillez réessayer."
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold">{errorInfo.title}</h1>
          <p className="text-muted-foreground">
            {errorInfo.message}
          </p>
          {/* Afficher le message d'erreur technique en mode développement */}
          {process.env.NODE_ENV === 'development' && error?.message && (
            <details className="text-left text-xs text-muted-foreground bg-gray-50 p-2 rounded">
              <summary className="cursor-pointer font-medium">Détails techniques</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}
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
