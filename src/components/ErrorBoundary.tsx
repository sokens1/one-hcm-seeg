import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Ignorer les erreurs DOM Chrome non-critiques pour ne pas perturber l'UI (ex: Select)
    if (
      error.message.includes('removeChild') ||
      error.message.includes('NotFoundError') ||
      error.name === 'NotFoundError'
    ) {
      return { hasError: false };
    }

    // Met à jour l'état pour afficher l'UI de fallback pour les autres erreurs
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log l'erreur pour le debugging
    if (
      error.message.includes('removeChild') ||
      error.message.includes('NotFoundError') ||
      error.name === 'NotFoundError'
    ) {
      // Réduire le bruit sans affecter l'état
      if (import.meta.env.DEV) {
        console.debug('Erreur DOM Chrome ignorée par ErrorBoundary:', error.message, errorInfo);
      }
      return;
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Affiche l'UI de fallback personnalisée ou par défaut
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Erreur temporaire
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Une erreur temporaire s'est produite. La page se recharge automatiquement...
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

