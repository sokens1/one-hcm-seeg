// Gestionnaire d'erreur global pour les erreurs DOM spécifiques à Chrome
export const setupGlobalErrorHandler = () => {
  // Gestionnaire pour les erreurs non capturées
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    // Réduire le bruit des erreurs DOM spécifiques à Chrome sans bloquer l'UI
    if (error && (
      error.message?.includes('removeChild') ||
      error.message?.includes('NotFoundError') ||
      error.name === 'NotFoundError' ||
      error.message?.includes('le nœud à supprimer n\'est pas un enfant de ce nœud')
    )) {
      if (import.meta.env.DEV) {
        console.debug('Erreur DOM Chrome (non-bloquante):', error.message);
      }
      // Ne pas appeler event.preventDefault ici pour ne pas casser des composants (ex: Select)
    }
  });

  // Gestionnaire pour les promesses rejetées non capturées
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // Réduire le bruit sans bloquer
    if (error && (
      error.message?.includes('removeChild') ||
      error.message?.includes('NotFoundError') ||
      error.name === 'NotFoundError'
    )) {
      if (import.meta.env.DEV) {
        console.debug('Erreur DOM Chrome (promesse, non-bloquante):', error?.message || error);
      }
      // Ne pas preventDefault
    }
  });
};

// Fonction utilitaire pour wrapper les opérations DOM risquées
export const safeDOMOperation = <T>(operation: () => T, fallback?: T): T | undefined => {
  try {
    return operation();
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('removeChild') ||
      error.message.includes('NotFoundError') ||
      error.name === 'NotFoundError'
    )) {
      console.warn('Opération DOM sécurisée - erreur ignorée:', error.message);
      return fallback;
    }
    throw error; // Re-lance les autres erreurs
  }
};

