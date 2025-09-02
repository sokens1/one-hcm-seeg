// Composants d'erreur principaux
export { ErrorPage, ConnectionErrorPage, RefreshErrorPage, BrowserErrorPage, GenericErrorPage } from '../ErrorPage';
export { ErrorBoundary, useErrorBoundary } from '../ErrorBoundary';
export { ErrorDisplay, ConnectionErrorDisplay, RefreshErrorDisplay, BrowserErrorDisplay, GenericErrorDisplay } from '../ErrorDisplay';
export { ErrorFallback, LoadingErrorFallback, DataErrorFallback } from '../ErrorFallback';

// Hook pour la gestion des erreurs
export { useErrorHandler } from '../../../hooks/useErrorHandler';
export type { ErrorType, ErrorInfo } from '../../../hooks/useErrorHandler';
