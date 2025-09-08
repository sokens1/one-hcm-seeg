import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Gestion globale des erreurs DOM non-critiques
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Ignorer les erreurs DOM removeChild connues et non-critiques
  if (
    message.includes('removeChild') ||
    message.includes('le nœud à supprimer n\'est pas un enfant de ce nœud') ||
    message.includes('Failed to execute \'removeChild\' on \'Node\'') ||
    message.includes('NotFoundError') && message.includes('removeChild') ||
    message.includes('findDOMNode is deprecated')
  ) {
    // Log en mode debug seulement
    if (import.meta.env.DEV) {
      console.debug('DOM cleanup (non-critical):', ...args);
    }
    return;
  }
  
  // Laisser passer les autres erreurs
  originalError.apply(console, args);
};

// Gestionnaire d'erreur global pour les erreurs non-gérées
window.addEventListener('error', (event) => {
  const message = event.message || event.error?.message || '';
  // Ne pas empêcher le comportement par défaut; juste diminuer le bruit des logs
  if (
    message.includes('removeChild') ||
    message.includes('le nœud à supprimer n\'est pas un enfant de ce nœud') ||
    message.includes('Failed to execute \'removeChild\' on \'Node\'')
  ) {
    if (import.meta.env.DEV) {
      console.debug('Chrome removeChild (non-critical):', message);
    }
  }
});

// Gestionnaire pour les promises rejetées
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || event.reason || '';
  // Ne pas empêcher le comportement par défaut; juste diminuer le bruit des logs
  if (
    typeof message === 'string' && (
      message.includes('removeChild') ||
      message.includes('le nœud à supprimer n\'est pas un enfant de ce nœud') ||
      message.includes('Failed to execute \'removeChild\' on \'Node\'')
    )
  ) {
    if (import.meta.env.DEV) {
      console.debug('Chrome removeChild in promise (non-critical):', message);
    }
  }
});

const container = document.getElementById("root");
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
