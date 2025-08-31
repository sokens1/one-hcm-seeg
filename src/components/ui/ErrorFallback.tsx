import React from 'react';
import { ErrorPage } from './ErrorPage';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  type?: 'connection' | 'refresh' | 'browser' | 'generic';
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  type = 'generic'
}) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Déterminer le type d'erreur basé sur l'erreur fournie
  let errorType = type;
  let title = 'Une Erreur s\'est Produite';
  let message = 'Une erreur inattendue s\'est produite. Veuillez réessayer.';

  if (error) {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      errorType = 'connection';
      title = 'Problème de Connexion';
      message = 'Impossible de se connecter aux serveurs. Vérifiez votre connexion internet.';
    } else if (errorMessage.includes('chunk') || errorMessage.includes('loading') || errorMessage.includes('module')) {
      errorType = 'refresh';
      title = 'Erreur de Chargement';
      message = 'Une erreur s\'est produite lors du chargement. Veuillez actualiser la page.';
    } else if (errorMessage.includes('syntax') || errorMessage.includes('parse') || errorMessage.includes('script')) {
      errorType = 'browser';
      title = 'Erreur de Navigateur';
      message = 'Votre navigateur rencontre un problème. Essayez d\'actualiser la page ou utilisez un autre navigateur.';
    }
  }

  return (
    <ErrorPage
      type={errorType}
      title={title}
      message={message}
      onRetry={handleRetry}
      onGoHome={handleGoHome}
      onGoBack={handleGoBack}
    />
  );
};

// Composant pour remplacer les messages d'erreur dans les pages de chargement
export const LoadingErrorFallback: React.FC<{ error?: Error; onRetry?: () => void }> = ({
  error,
  onRetry
}) => {
  return (
    <ErrorFallback
      error={error}
      resetError={onRetry}
      type="connection"
    />
  );
};

// Composant pour remplacer les messages d'erreur dans les pages de données
export const DataErrorFallback: React.FC<{ error?: Error; onRetry?: () => void }> = ({
  error,
  onRetry
}) => {
  return (
    <ErrorFallback
      error={error}
      resetError={onRetry}
      type="generic"
    />
  );
};
