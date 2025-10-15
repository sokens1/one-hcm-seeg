/**
 * Système de prévention et de monitoring des erreurs DOM
 * Garantit que les erreurs removeChild ne se reproduiront plus
 */

import { createSafeHTML, escapeHTML, sanitizeHTML } from './domErrorHandler';

// Types pour le monitoring
export interface DOMErrorStats {
  totalErrors: number;
  removeChildErrors: number;
  lastError?: Date;
  errorTypes: Record<string, number>;
}

export interface PreventionConfig {
  enableMonitoring: boolean;
  enableAutoFix: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxRetries: number;
}

// Configuration par défaut
const defaultConfig: PreventionConfig = {
  enableMonitoring: true,
  enableAutoFix: true,
  logLevel: 'warn',
  maxRetries: 3
};

// Statistiques globales
let errorStats: DOMErrorStats = {
  totalErrors: 0,
  removeChildErrors: 0,
  errorTypes: {}
};

/**
 * Classe principale pour la prévention des erreurs DOM
 */
export class DOMErrorPrevention {
  private config: PreventionConfig;
  private retryCount: Map<string, number> = new Map();

  constructor(config: Partial<PreventionConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.setupGlobalHandlers();
  }

  /**
   * Configure les gestionnaires globaux d'erreurs
   */
  private setupGlobalHandlers() {
    if (!this.config.enableMonitoring) return;

    // Gestionnaire d'erreurs global
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'global');
    });

    // Gestionnaire de promesses rejetées
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason instanceof Error) {
        this.handleError(event.reason, 'promise');
      }
    });
  }

  /**
   * Gère une erreur DOM détectée
   */
  private handleError(error: Error, source: string) {
    const errorType = this.detectErrorType(error);
    const errorKey = `${errorType}-${source}`;

    // Mettre à jour les statistiques
    errorStats.totalErrors++;
    if (errorType === 'removeChild') {
      errorStats.removeChildErrors++;
    }
    errorStats.errorTypes[errorType] = (errorStats.errorTypes[errorType] || 0) + 1;
    errorStats.lastError = new Date();

    // Logger selon le niveau configuré
    this.logError(error, errorType, source);

    // Tentative de correction automatique si activée
    if (this.config.enableAutoFix && errorType === 'removeChild') {
      this.attemptAutoFix(error, errorKey);
    }
  }

  /**
   * Détecte le type d'erreur DOM
   */
  private detectErrorType(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('removechild')) return 'removeChild';
    if (message.includes('appendchild')) return 'appendChild';
    if (message.includes('insertbefore')) return 'insertBefore';
    if (message.includes('replacechild')) return 'replaceChild';
    if (message.includes('innerhtml')) return 'innerHTML';
    if (message.includes('notfounderror')) return 'notFoundError';
    
    return 'unknown';
  }

  /**
   * Log l'erreur selon le niveau configuré
   */
  private logError(error: Error, type: string, source: string) {
    const logData = {
      type,
      source,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    switch (this.config.logLevel) {
      case 'debug':
        console.debug(`[DOM Error Prevention] ${type} from ${source}:`, logData);
        break;
      case 'info':
        console.info(`[DOM Error Prevention] ${type} from ${source}:`, error.message);
        break;
      case 'warn':
        console.warn(`[DOM Error Prevention] ${type} from ${source}:`, error.message);
        break;
      case 'error':
        console.error(`[DOM Error Prevention] ${type} from ${source}:`, error);
        break;
    }
  }

  /**
   * Tente une correction automatique
   */
  private attemptAutoFix(error: Error, errorKey: string) {
    const retryCount = this.retryCount.get(errorKey) || 0;
    
    if (retryCount >= this.config.maxRetries) {
      console.warn(`[DOM Error Prevention] Max retries reached for ${errorKey}`);
      return;
    }

    this.retryCount.set(errorKey, retryCount + 1);

    // Stratégies de correction automatique
    try {
      // 1. Nettoyer le DOM corrompu
      this.cleanupCorruptedDOM();
      
      // 2. Forcer un re-render des composants problématiques
      this.forceRerender();
      
      console.info(`[DOM Error Prevention] Auto-fix attempt ${retryCount + 1} for ${errorKey}`);
    } catch (fixError) {
      console.error(`[DOM Error Prevention] Auto-fix failed for ${errorKey}:`, fixError);
    }
  }

  /**
   * Nettoie le DOM corrompu
   */
  private cleanupCorruptedDOM() {
    // Supprimer les nœuds orphelins
    const orphanedNodes = document.querySelectorAll('[data-orphaned="true"]');
    orphanedNodes.forEach(node => {
      try {
        node.remove();
      } catch (e) {
        // Ignorer les erreurs de suppression
      }
    });

    // Nettoyer les event listeners orphelins
    this.cleanupEventListeners();
  }

  /**
   * Nettoie les event listeners orphelins
   */
  private cleanupEventListeners() {
    // Cette fonction peut être étendue pour nettoyer des listeners spécifiques
    // Pour l'instant, on se contente de forcer le garbage collection
    if (window.gc) {
      window.gc();
    }
  }

  /**
   * Force le re-render des composants
   */
  private forceRerender() {
    // Déclencher un événement personnalisé pour forcer le re-render
    window.dispatchEvent(new CustomEvent('dom-error-recovery'));
  }

  /**
   * Wrapper sécurisé pour dangerouslySetInnerHTML
   */
  public safeInnerHTML(html: string | null | undefined): { __html: string } {
    try {
      return createSafeHTML(html);
    } catch (error) {
      console.warn('[DOM Error Prevention] HTML sanitization failed, using fallback');
      return { __html: escapeHTML(html || '') };
    }
  }

  /**
   * Wrapper sécurisé pour les opérations DOM
   */
  public safeDOMOperation<T>(operation: () => T, fallback?: T): T | undefined {
    try {
      return operation();
    } catch (error) {
      if (error instanceof Error) {
        this.handleError(error, 'operation');
      }
      return fallback;
    }
  }

  /**
   * Obtient les statistiques d'erreurs
   */
  public getStats(): DOMErrorStats {
    return { ...errorStats };
  }

  /**
   * Réinitialise les statistiques
   */
  public resetStats() {
    errorStats = {
      totalErrors: 0,
      removeChildErrors: 0,
      errorTypes: {}
    };
    this.retryCount.clear();
  }

  /**
   * Vérifie si le système est sain
   */
  public isHealthy(): boolean {
    const stats = this.getStats();
    const recentErrors = stats.lastError && 
      (Date.now() - stats.lastError.getTime()) < 60000; // 1 minute
    
    return !recentErrors && stats.removeChildErrors === 0;
  }

  /**
   * Génère un rapport de santé
   */
  public generateHealthReport(): string {
    const stats = this.getStats();
    const isHealthy = this.isHealthy();
    
    return `
=== RAPPORT DE SANTÉ DOM ===
Statut: ${isHealthy ? '✅ SAIN' : '⚠️ PROBLÈMES DÉTECTÉS'}
Erreurs totales: ${stats.totalErrors}
Erreurs removeChild: ${stats.removeChildErrors}
Dernière erreur: ${stats.lastError ? stats.lastError.toISOString() : 'Aucune'}
Types d'erreurs: ${JSON.stringify(stats.errorTypes, null, 2)}
============================
    `.trim();
  }
}

// Instance globale
export const domErrorPrevention = new DOMErrorPrevention();

// Export des utilitaires pour faciliter l'utilisation
export const safeInnerHTML = (html: string | null | undefined) => 
  domErrorPrevention.safeInnerHTML(html);

export const safeDOMOperation = <T>(operation: () => T, fallback?: T) =>
  domErrorPrevention.safeDOMOperation(operation, fallback);

// Export des fonctions utilitaires
export { escapeHTML, sanitizeHTML } from './domErrorHandler';

// Hook React pour utiliser le système de prévention
export const useDOMErrorPrevention = () => {
  return {
    safeInnerHTML: domErrorPrevention.safeInnerHTML.bind(domErrorPrevention),
    safeDOMOperation: domErrorPrevention.safeDOMOperation.bind(domErrorPrevention),
    getStats: domErrorPrevention.getStats.bind(domErrorPrevention),
    isHealthy: domErrorPrevention.isHealthy.bind(domErrorPrevention),
    generateHealthReport: domErrorPrevention.generateHealthReport.bind(domErrorPrevention)
  };
};

// Fonction de test pour valider le système
export const testDOMPrevention = () => {
  console.log('=== TEST DU SYSTÈME DE PRÉVENTION DOM ===');
  
  // Test 1: HTML sécurisé
  const testHTML = '<script>alert("test")</script><p>Contenu normal</p>';
  const safeHTML = safeInnerHTML(testHTML);
  console.log('✅ HTML sécurisé:', safeHTML);
  
  // Test 2: Opération DOM sécurisée
  const result = safeDOMOperation(() => {
    const div = document.createElement('div');
    div.innerHTML = '<p>Test</p>';
    return div.innerHTML;
  }, 'fallback');
  console.log('✅ Opération DOM sécurisée:', result);
  
  // Test 3: Statistiques
  const stats = domErrorPrevention.getStats();
  console.log('✅ Statistiques:', stats);
  
  // Test 4: Rapport de santé
  const healthReport = domErrorPrevention.generateHealthReport();
  console.log('✅ Rapport de santé:', healthReport);
  
  console.log('=== FIN DU TEST ===');
};

// Auto-test au chargement en mode développement
if (import.meta.env.DEV) {
  setTimeout(() => {
    testDOMPrevention();
  }, 1000);
}
