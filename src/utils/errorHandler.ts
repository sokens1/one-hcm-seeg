// Gestionnaire d'erreur global pour les erreurs DOM spécifiques à Chrome
export const setupGlobalErrorHandler = () => {
  // Gestionnaire pour les erreurs non capturées
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    // Ignore les erreurs DOM spécifiques à Chrome
    if (error && (
      error.message?.includes('removeChild') ||
      error.message?.includes('NotFoundError') ||
      error.name === 'NotFoundError' ||
      error.message?.includes('le nœud à supprimer n\'est pas un enfant de ce nœud')
    )) {
      console.warn('Erreur DOM Chrome ignorée:', error.message);
      event.preventDefault(); // Empêche l'affichage de l'erreur
      return false;
    }
  });

  // Gestionnaire pour les promesses rejetées non capturées
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // Ignore les erreurs DOM spécifiques à Chrome dans les promesses
    if (error && (
      error.message?.includes('removeChild') ||
      error.message?.includes('NotFoundError') ||
      error.name === 'NotFoundError'
    )) {
      console.warn('Erreur DOM Chrome (promesse) ignorée:', error.message);
      event.preventDefault(); // Empêche l'affichage de l'erreur
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
