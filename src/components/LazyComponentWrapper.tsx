import React, { ComponentType, lazy, LazyExoticComponent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LazyWrapperProps {
  children: React.ReactNode;
}

// Composant d'erreur pour les échecs de chargement de modules
export function ModuleLoadError({ error, resetError }: { error: Error; resetError: () => void }) {
  const isNetworkError = error.message.includes('Failed to fetch') || 
                         error.message.includes('dynamically imported module') ||
                         error.message.includes('Loading chunk');

  const handleReload = () => {
    // Vider le cache du navigateur et recharger
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Recharger la page complètement
    window.location.reload();
  };

  const handleRetry = () => {
    // Essayer de réinitialiser l'erreur d'abord
    resetError();
    
    // Si ça ne marche pas, recharger après un délai
    setTimeout(() => {
      if (document.querySelector('[data-error-boundary]')) {
        handleReload();
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" data-error-boundary>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-lg">Erreur de Chargement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isNetworkError ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Impossible de charger cette page. Cela peut être dû à une mise à jour de l'application.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleRetry} 
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                <Button 
                  onClick={handleReload} 
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recharger l'Application
                </Button>
                <Button 
                  asChild
                  className="w-full"
                  variant="ghost"
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Retour à l'Accueil
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Une erreur inattendue s'est produite lors du chargement de cette page.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={resetError} 
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                <Button 
                  asChild
                  className="w-full"
                  variant="outline"
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Retour à l'Accueil
                  </Link>
                </Button>
              </div>
            </>
          )}
          
          <details className="mt-4">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Détails techniques
            </summary>
            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
              {error.message}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper pour créer des composants lazy avec gestion d'erreur améliorée
export function createResilientLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  displayName?: string
): LazyExoticComponent<T> {
  const LazyComponent = lazy(async () => {
    try {
      return await importFunc();
    } catch (error) {
      console.error(`Failed to load component ${displayName || 'Unknown'}:`, error);
      
      // Si c'est une erreur de réseau, essayer de recharger après un délai
      if (error instanceof Error && 
          (error.message.includes('Failed to fetch') || 
           error.message.includes('dynamically imported module'))) {
        
        // Attendre un peu et réessayer une fois
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          return await importFunc();
        } catch (retryError) {
          console.error(`Retry failed for ${displayName || 'Unknown'}:`, retryError);
          throw retryError;
        }
      }
      
      throw error;
    }
  });
  
  LazyComponent.displayName = displayName || 'ResilientLazyComponent';
  return LazyComponent;
}

// Error Boundary Class Component pour capturer les erreurs de lazy loading
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class LazyLoadErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyLoadErrorBoundary caught an error:', error, errorInfo);
    
    // Log spécifique pour les erreurs de module dynamique
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('dynamically imported module')) {
      console.error('Dynamic import failed - possible cache/build issue');
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ModuleLoadError 
          error={this.state.error} 
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}