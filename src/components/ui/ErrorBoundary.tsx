import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from './ErrorPage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Appeler le callback d'erreur si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log l'erreur pour le monitoring
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Ici vous pouvez ajouter votre service de logging (Sentry, LogRocket, etc.)
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error logged:', errorData);
    
    // Exemple d'envoi à un service de monitoring
    // Sentry.captureException(error, { extra: errorData });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Déterminer le type d'erreur basé sur l'erreur capturée
      let errorType: 'connection' | 'refresh' | 'browser' | 'dom' | 'generic' = 'generic';
      
      if (this.state.error) {
        const message = this.state.error.message.toLowerCase();
        
        if (message.includes('removechild') || message.includes('notfounderror') || message.includes('dom')) {
          errorType = 'dom';
        } else if (message.includes('chunk') || message.includes('loading') || message.includes('module')) {
          errorType = 'refresh';
        } else if (message.includes('syntax') || message.includes('parse') || message.includes('script')) {
          errorType = 'browser';
        } else if (message.includes('network') || message.includes('fetch')) {
          errorType = 'connection';
        }
      }

      // Messages personnalisés selon le type d'erreur
      const getErrorMessage = () => {
        switch (errorType) {
          case 'dom':
            return {
              title: "Erreur d'affichage",
              message: "Un problème d'affichage s'est produit. Cette erreur est généralement temporaire et se résout en rechargeant la page."
            };
          case 'refresh':
            return {
              title: "Erreur de chargement",
              message: "Un problème de chargement s'est produit. Veuillez recharger la page pour continuer."
            };
          case 'browser':
            return {
              title: "Erreur de script",
              message: "Une erreur de script s'est produite. Veuillez recharger la page."
            };
          case 'connection':
            return {
              title: "Erreur de connexion",
              message: "Un problème de connexion s'est produite. Vérifiez votre connexion internet et réessayez."
            };
          default:
            return {
              title: "Erreur d'Application",
              message: "Une erreur inattendue s'est produite dans l'application. Notre équipe a été notifiée."
            };
        }
      };

      const errorInfo = getErrorMessage();

      return (
        <ErrorPage
          type={errorType}
          title={errorInfo.title}
          message={errorInfo.message}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onGoBack={this.handleGoBack}
        />
      );
    }

    return this.props.children;
  }
}

// Hook pour utiliser l'ErrorBoundary dans les composants fonctionnels
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};
