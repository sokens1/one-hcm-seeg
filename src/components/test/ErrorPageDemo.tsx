import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ErrorPage, 
  ConnectionErrorPage, 
  RefreshErrorPage, 
  BrowserErrorPage, 
  GenericErrorPage,
  ErrorDisplay,
  useErrorHandler
} from "@/components/ui/error";

export function ErrorPageDemo() {
  const [currentError, setCurrentError] = useState<string | null>(null);
  const { handleError, clearError } = useErrorHandler();

  const triggerError = (type: 'connection' | 'refresh' | 'browser' | 'generic') => {
    const errors = {
      connection: new Error('Network request failed'),
      refresh: new Error('ChunkLoadError: Loading chunk failed'),
      browser: new Error('SyntaxError: Unexpected token'),
      generic: new Error('Something went wrong')
    };
    
    handleError(errors[type], type);
  };

  const triggerApiError = () => {
    // Simuler une erreur API
    const mockResponse = {
      status: 500,
      statusText: 'Internal Server Error'
    } as Response;
    
    // handleApiError(mockResponse);
    handleError(new Error('API Error: 500 Internal Server Error'), 'connection');
  };

  if (currentError) {
    return (
      <ErrorPage
        type="generic"
        title="Démo d'Erreur"
        message={currentError}
        onRetry={() => setCurrentError(null)}
        onGoHome={() => setCurrentError(null)}
        onGoBack={() => setCurrentError(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Démonstration des Pages d'Erreur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Cliquez sur les boutons ci-dessous pour voir les différents types de pages d'erreur.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setCurrentError('Erreur de connexion simulée')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <div className="text-lg">🌐</div>
              <div>
                <div className="font-medium">Erreur de Connexion</div>
                <div className="text-sm text-gray-500">Problème réseau</div>
              </div>
            </Button>

            <Button 
              onClick={() => setCurrentError('Erreur de chargement simulée')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <div className="text-lg">🔄</div>
              <div>
                <div className="font-medium">Erreur de Rafraîchissement</div>
                <div className="text-sm text-gray-500">Page obsolète</div>
              </div>
            </Button>

            <Button 
              onClick={() => setCurrentError('Erreur de navigateur simulée')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <div className="text-lg">💻</div>
              <div>
                <div className="font-medium">Erreur de Navigateur</div>
                <div className="text-sm text-gray-500">Incompatibilité</div>
              </div>
            </Button>

            <Button 
              onClick={() => setCurrentError('Erreur générique simulée')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <div className="text-lg">⚠️</div>
              <div>
                <div className="font-medium">Erreur Générique</div>
                <div className="text-sm text-gray-500">Erreur inattendue</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Composants d'Erreur Disponibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Pages d'Erreur Complètes</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• <code>ErrorPage</code> - Page d'erreur personnalisable</div>
                <div>• <code>ConnectionErrorPage</code> - Erreurs de connexion</div>
                <div>• <code>RefreshErrorPage</code> - Erreurs de rafraîchissement</div>
                <div>• <code>BrowserErrorPage</code> - Erreurs de navigateur</div>
                <div>• <code>GenericErrorPage</code> - Erreurs génériques</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Composants d'Affichage</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• <code>ErrorDisplay</code> - Affichage d'erreur flexible</div>
                <div>• <code>ErrorFallback</code> - Fallback pour ErrorBoundary</div>
                <div>• <code>ErrorBoundary</code> - Capture d'erreurs React</div>
                <div>• <code>useErrorHandler</code> - Hook de gestion d'erreurs</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exemples d'Utilisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Remplacement d'un message d'erreur simple :</h5>
            <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`// Avant
<p className="text-red-600">Erreur: Impossible de charger les données.</p>

// Après
<ErrorFallback 
  error={error} 
  onRetry={() => refetch()} 
/>`}
            </pre>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Utilisation avec ErrorBoundary :</h5>
            <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`<ErrorBoundary FallbackComponent={ErrorFallback}>
  <YourComponent />
</ErrorBoundary>`}
            </pre>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Gestion d'erreurs avec le hook :</h5>
            <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{`const { handleError, handleConnectionError } = useErrorHandler();

// Dans un try/catch
try {
  await fetchData();
} catch (error) {
  handleConnectionError(error);
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
