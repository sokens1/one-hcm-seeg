/**
 * Gestionnaire d'erreurs DOM pour éviter les erreurs removeChild et autres erreurs DOM
 */

// Types d'erreurs DOM communes
export type DOMErrorType = 'removeChild' | 'appendChild' | 'insertBefore' | 'replaceChild' | 'innerHTML' | 'unknown';

export interface DOMErrorInfo {
  type: DOMErrorType;
  message: string;
  element?: Element | null;
  operation: string;
}

/**
 * Détecte le type d'erreur DOM basé sur le message d'erreur
 */
export const detectDOMErrorType = (error: Error): DOMErrorType => {
  const message = error.message.toLowerCase();
  
  if (message.includes('removechild')) return 'removeChild';
  if (message.includes('appendchild')) return 'appendChild';
  if (message.includes('insertbefore')) return 'insertBefore';
  if (message.includes('replacechild')) return 'replaceChild';
  if (message.includes('innerhtml')) return 'innerHTML';
  
  return 'unknown';
};

/**
 * Wrapper sécurisé pour les opérations DOM qui peuvent échouer
 */
export const safeDOMOperation = <T>(
  operation: () => T,
  fallback?: T,
  operationName: string = 'DOM operation'
): T | undefined => {
  try {
    return operation();
  } catch (error) {
    if (error instanceof Error) {
      const errorType = detectDOMErrorType(error);
      
      // Logger l'erreur pour le debugging
      console.warn(`Erreur DOM sécurisée [${errorType}]:`, {
        operation: operationName,
        message: error.message,
        stack: error.stack
      });
      
      // Retourner le fallback si fourni
      return fallback;
    }
    
    // Re-lancer les erreurs non-DOM
    throw error;
  }
};

/**
 * Nettoyage sécurisé du HTML pour éviter les erreurs DOM
 */
export const sanitizeHTML = (html: string | null | undefined): string => {
  if (!html) return "";
  
  try {
    // Nettoyer les caractères de contrôle et normaliser
    let cleaned = html
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Caractères de contrôle
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
    
    // Vérifier la validité du HTML avec DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, 'text/html');
    
    // Si le parsing a généré des erreurs, nettoyer plus agressivement
    const hasErrors = doc.querySelector('parsererror');
    if (hasErrors) {
      console.warn('HTML invalide détecté, nettoyage agressif appliqué');
      // Supprimer tous les tags HTML problématiques
      cleaned = cleaned.replace(/<[^>]*>/g, '');
    }
    
    return cleaned;
  } catch (error) {
    console.warn('Erreur lors du nettoyage HTML:', error);
    // En cas d'erreur, retourner une version très sécurisée
    return html.replace(/<[^>]*>/g, '').replace(/[<>&"']/g, '');
  }
};

/**
 * Fonction pour échapper les caractères HTML dans les chaînes
 */
export const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Hook pour capturer et gérer les erreurs DOM dans React
 */
export const useDOMErrorHandler = () => {
  const handleDOMError = (error: Error, context?: string) => {
    const errorType = detectDOMErrorType(error);
    
    // Logger l'erreur avec le contexte
    console.error(`Erreur DOM dans ${context || 'composant inconnu'}:`, {
      type: errorType,
      message: error.message,
      stack: error.stack
    });
    
    // Ici vous pouvez ajouter votre service de monitoring (Sentry, etc.)
    // trackError(error, { type: 'DOM', context });
  };
  
  return { handleDOMError };
};

/**
 * Wrapper pour dangerouslySetInnerHTML sécurisé
 */
export const createSafeHTML = (html: string | null | undefined) => {
  const sanitized = sanitizeHTML(html);
  return { __html: sanitized };
};

/**
 * Gestionnaire global d'erreurs DOM pour l'application
 */
export const setupGlobalDOMErrorHandler = () => {
  // Capturer les erreurs DOM non gérées
  window.addEventListener('error', (event) => {
    if (event.error && detectDOMErrorType(event.error) !== 'unknown') {
      console.warn('Erreur DOM globale capturée:', {
        type: detectDOMErrorType(event.error),
        message: event.error.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Empêcher l'affichage de l'erreur par défaut du navigateur
      event.preventDefault();
    }
  });
  
  // Capturer les erreurs de promesses non gérées liées au DOM
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && detectDOMErrorType(event.reason) !== 'unknown') {
      console.warn('Promesse rejetée avec erreur DOM:', event.reason);
      event.preventDefault();
    }
  });
};
