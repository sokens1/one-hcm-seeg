import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export type ErrorType = 'connection' | 'refresh' | 'browser' | 'generic';

export interface ErrorInfo {
  type: ErrorType;
  title?: string;
  message?: string;
  originalError?: Error;
  timestamp: Date;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const navigate = useNavigate();

  const handleError = useCallback((
    error: Error | string,
    type: ErrorType = 'generic',
    customTitle?: string,
    customMessage?: string
  ) => {
    console.error('Error handled:', error);
    
    const errorInfo: ErrorInfo = {
      type,
      title: customTitle,
      message: customMessage,
      originalError: error instanceof Error ? error : new Error(error),
      timestamp: new Date()
    };

    setError(errorInfo);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleConnectionError = useCallback((error?: Error | string) => {
    handleError(
      error || 'Connection error',
      'connection',
      'Problème de Connexion',
      'Impossible de se connecter aux serveurs. Vérifiez votre connexion internet.'
    );
  }, [handleError]);

  const handleNetworkError = useCallback((error?: Error | string) => {
    // Détecter automatiquement le type d'erreur réseau
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
      handleConnectionError(error);
    } else {
      handleError(error, 'generic', 'Erreur Réseau', 'Une erreur réseau s\'est produite.');
    }
  }, [handleError, handleConnectionError]);

  const handleAuthError = useCallback((error?: Error | string) => {
    handleError(
      error || 'Authentication error',
      'refresh',
      'Session Expirée',
      'Votre session a expiré. Veuillez vous reconnecter.'
    );
  }, [handleError]);

  const handleBrowserError = useCallback((error?: Error | string) => {
    handleError(
      error || 'Browser compatibility error',
      'browser',
      'Navigateur Non Compatible',
      'Votre navigateur n\'est pas compatible avec cette application.'
    );
  }, [handleError]);

  const handleGenericError = useCallback((error?: Error | string, title?: string, message?: string) => {
    handleError(error, 'generic', title, message);
  }, [handleError]);

  // Fonction pour gérer les erreurs de fetch/API
  const handleApiError = useCallback(async (response: Response, error?: Error) => {
    let errorType: ErrorType = 'generic';
    let title = 'Erreur API';
    let message = 'Une erreur s\'est produite lors de la communication avec le serveur.';

    switch (response.status) {
      case 401:
        errorType = 'refresh';
        title = 'Session Expirée';
        message = 'Votre session a expiré. Veuillez vous reconnecter.';
        break;
      case 403:
        errorType = 'refresh';
        title = 'Accès Refusé';
        message = 'Vous n\'avez pas les permissions nécessaires pour cette action.';
        break;
      case 404:
        title = 'Ressource Introuvable';
        message = 'La ressource demandée n\'a pas été trouvée.';
        break;
      case 408:
        errorType = 'connection';
        title = 'Délai d\'Attente Dépassé';
        message = 'La requête a pris trop de temps. Vérifiez votre connexion.';
        break;
      case 429:
        title = 'Trop de Requêtes';
        message = 'Vous avez effectué trop de requêtes. Veuillez patienter.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = 'connection';
        title = 'Erreur Serveur';
        message = 'Le serveur rencontre des difficultés. Réessayez plus tard.';
        break;
      default:
        if (response.status >= 500) {
          errorType = 'connection';
        }
    }

    handleError(error || new Error(`HTTP ${response.status}`), errorType, title, message);
  }, [handleError]);

  // Fonction pour gérer les erreurs JavaScript
  const handleJSError = useCallback((error: Error) => {
    // Détecter le type d'erreur basé sur le message
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      handleConnectionError(error);
    } else if (message.includes('chunk') || message.includes('loading')) {
      handleError(error, 'refresh', 'Erreur de Chargement', 'Une erreur s\'est produite lors du chargement. Veuillez actualiser la page.');
    } else if (message.includes('syntax') || message.includes('parse')) {
      handleBrowserError(error);
    } else {
      handleGenericError(error);
    }
  }, [handleError, handleConnectionError, handleBrowserError]);

  return {
    error,
    handleError,
    clearError,
    handleConnectionError,
    handleNetworkError,
    handleAuthError,
    handleBrowserError,
    handleGenericError,
    handleApiError,
    handleJSError
  };
};
