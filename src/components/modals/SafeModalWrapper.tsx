/**
 * Wrapper sécurisé pour les modals avec gestion d'erreurs DOM
 */

import React, { Component, ReactNode } from 'react';
import { safeDOMOperation } from '@/utils/domErrorPrevention';

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SafeModalWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Mettre à jour l'état pour afficher l'UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[SafeModalWrapper] Erreur capturée:', error, errorInfo);
    
    // Appeler le callback d'erreur si fourni
    if (this.props.onError) {
      this.props.onError(error);
    }

    // Si c'est une erreur DOM, essayer de récupérer
    if (error.message.includes('removeChild') || error.message.includes('NotFoundError')) {
      console.info('[SafeModalWrapper] Tentative de récupération pour erreur DOM...');
      
      // Attendre un peu puis réinitialiser l'état d'erreur
      setTimeout(() => {
        safeDOMOperation(() => {
          this.setState({ hasError: false, error: undefined });
        });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback simple
      return (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Une erreur temporaire s'est produite. Veuillez réessayer.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeModalWrapper;
