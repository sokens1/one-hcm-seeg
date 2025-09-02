import React from 'react';
import { ErrorPage, ErrorPageProps } from './ErrorPage';
import { useErrorHandler, ErrorType } from '@/hooks/useErrorHandler';

interface ErrorDisplayProps {
  error?: Error | string | null;
  type?: ErrorType;
  title?: string;
  message?: string;
  showRetryButton?: boolean;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  inline?: boolean; // Pour afficher l'erreur inline au lieu de plein écran
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  type = 'generic',
  title,
  message,
  showRetryButton = true,
  showHomeButton = true,
  showBackButton = true,
  onRetry,
  onGoHome,
  onGoBack,
  inline = false
}) => {
  const { handleError } = useErrorHandler();

  // Si une erreur est fournie, la traiter
  React.useEffect(() => {
    if (error) {
      handleError(error, type, title, message);
    }
  }, [error, type, title, message, handleError]);

  // Si on veut afficher l'erreur inline, on peut créer une version compacte
  if (inline) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              {title || 'Une erreur s\'est produite'}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {message || (typeof error === 'string' ? error : error?.message) || 'Veuillez réessayer.'}
            </p>
            {showRetryButton && onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Version plein écran par défaut
  return (
    <ErrorPage
      type={type}
      title={title}
      message={message}
      showRetryButton={showRetryButton}
      showHomeButton={showHomeButton}
      showBackButton={showBackButton}
      onRetry={onRetry}
      onGoHome={onGoHome}
      onGoBack={onGoBack}
    />
  );
};

// Composants spécialisés pour différents types d'erreurs
export const ConnectionErrorDisplay: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="connection" />
);

export const RefreshErrorDisplay: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="refresh" />
);

export const BrowserErrorDisplay: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="browser" />
);

export const GenericErrorDisplay: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="generic" />
);
