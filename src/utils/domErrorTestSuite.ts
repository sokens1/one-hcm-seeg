/**
 * Suite de tests automatisés pour valider la prévention des erreurs DOM
 * Garantit que le système fonctionne correctement
 */

import { domErrorPrevention, safeInnerHTML, safeDOMOperation } from './domErrorPrevention';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

export interface TestSuite {
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  overallSuccess: boolean;
}

/**
 * Classe pour exécuter les tests de prévention DOM
 */
export class DOMErrorTestSuite {
  private results: TestResult[] = [];

  /**
   * Exécute un test individuel
   */
  private async runTest(name: string, testFn: () => void | Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      return {
        name,
        passed: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
    }
  }

  /**
   * Test 1: HTML sécurisé avec caractères spéciaux
   */
  private async testSafeHTMLWithSpecialChars() {
    const maliciousHTML = '<script>alert("xss")</script><p>Contenu normal</p>';
    const result = safeInnerHTML(maliciousHTML);
    
    // Vérifier que le script est échappé
    if (result.__html.includes('<script>')) {
      throw new Error('Script malveillant non échappé');
    }
    
    // Vérifier que le contenu normal est préservé
    if (!result.__html.includes('Contenu normal')) {
      throw new Error('Contenu normal perdu');
    }
  }

  /**
   * Test 2: HTML avec caractères de contrôle
   */
  private async testHTMLWithControlChars() {
    const htmlWithControlChars = 'Texte\u0000normal\u001Favec\u007Fcaractères';
    const result = safeInnerHTML(htmlWithControlChars);
    
    // Vérifier que les caractères de contrôle sont supprimés
    if (result.__html.includes('\u0000') || result.__html.includes('\u001F') || result.__html.includes('\u007F')) {
      throw new Error('Caractères de contrôle non supprimés');
    }
  }

  /**
   * Test 3: HTML malformé
   */
  private async testMalformedHTML() {
    const malformedHTML = '<p>Texte <strong>gras</p> <div>Non fermé';
    const result = safeInnerHTML(malformedHTML);
    
    // Le résultat doit être valide même si l'input est malformé
    if (!result.__html || result.__html.length === 0) {
      throw new Error('HTML malformé non géré');
    }
  }

  /**
   * Test 4: Opérations DOM sécurisées
   */
  private async testSafeDOMOperations() {
    // Test d'opération DOM qui peut échouer
    const result = safeDOMOperation(() => {
      const div = document.createElement('div');
      div.innerHTML = '<p>Test</p>';
      return div.innerHTML;
    }, 'fallback');
    
    if (!result || result === 'fallback') {
      throw new Error('Opération DOM sécurisée a échoué');
    }
  }

  /**
   * Test 5: Gestion des erreurs removeChild simulées
   */
  private async testRemoveChildErrorHandling() {
    const initialStats = domErrorPrevention.getStats();
    
    // Simuler une erreur removeChild
    try {
      const div = document.createElement('div');
      document.body.appendChild(div);
      // Tenter de supprimer un élément qui n'est pas un enfant
      document.body.removeChild(div);
      document.body.removeChild(div); // Cette ligne devrait causer une erreur
    } catch (error) {
      // L'erreur devrait être capturée par le système
    }
    
    // Vérifier que l'erreur a été enregistrée
    const newStats = domErrorPrevention.getStats();
    if (newStats.totalErrors <= initialStats.totalErrors) {
      throw new Error('Erreur removeChild non capturée');
    }
  }

  /**
   * Test 6: Performance du système
   */
  private async testPerformance() {
    const startTime = Date.now();
    
    // Exécuter 100 opérations de nettoyage HTML
    for (let i = 0; i < 100; i++) {
      safeInnerHTML(`<p>Test ${i}</p>`);
    }
    
    const duration = Date.now() - startTime;
    
    // Vérifier que les opérations sont rapides (moins de 100ms pour 100 opérations)
    if (duration > 100) {
      throw new Error(`Performance insuffisante: ${duration}ms pour 100 opérations`);
    }
  }

  /**
   * Test 7: Récupération automatique
   */
  private async testAutoRecovery() {
    const isHealthyBefore = domErrorPrevention.isHealthy();
    
    // Déclencher une récupération
    window.dispatchEvent(new CustomEvent('dom-error-recovery'));
    
    // Attendre un peu pour que la récupération se fasse
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const isHealthyAfter = domErrorPrevention.isHealthy();
    
    // Le système devrait rester sain ou se rétablir
    if (!isHealthyAfter && isHealthyBefore) {
      throw new Error('Récupération automatique a échoué');
    }
  }

  /**
   * Test 8: Statistiques et monitoring
   */
  private async testStatsAndMonitoring() {
    const stats = domErrorPrevention.getStats();
    
    // Vérifier que les statistiques sont valides
    if (typeof stats.totalErrors !== 'number' || stats.totalErrors < 0) {
      throw new Error('Statistiques invalides');
    }
    
    if (typeof stats.removeChildErrors !== 'number' || stats.removeChildErrors < 0) {
      throw new Error('Statistiques removeChild invalides');
    }
    
    // Vérifier le rapport de santé
    const healthReport = domErrorPrevention.generateHealthReport();
    if (!healthReport || healthReport.length === 0) {
      throw new Error('Rapport de santé vide');
    }
  }

  /**
   * Exécute tous les tests
   */
  async runAllTests(): Promise<TestSuite> {
    const startTime = Date.now();
    this.results = [];

    console.log('🧪 Démarrage de la suite de tests DOM Error Prevention...');

    // Exécuter tous les tests
    this.results.push(await this.runTest('HTML sécurisé avec caractères spéciaux', () => this.testSafeHTMLWithSpecialChars()));
    this.results.push(await this.runTest('HTML avec caractères de contrôle', () => this.testHTMLWithControlChars()));
    this.results.push(await this.runTest('HTML malformé', () => this.testMalformedHTML()));
    this.results.push(await this.runTest('Opérations DOM sécurisées', () => this.testSafeDOMOperations()));
    this.results.push(await this.runTest('Gestion des erreurs removeChild', () => this.testRemoveChildErrorHandling()));
    this.results.push(await this.runTest('Performance du système', () => this.testPerformance()));
    this.results.push(await this.runTest('Récupération automatique', () => this.testAutoRecovery()));
    this.results.push(await this.runTest('Statistiques et monitoring', () => this.testStatsAndMonitoring()));

    const duration = Date.now() - startTime;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed).length;

    const suite: TestSuite = {
      results: this.results,
      totalTests: this.results.length,
      passedTests,
      failedTests,
      duration,
      overallSuccess: failedTests === 0
    };

    this.logResults(suite);
    return suite;
  }

  /**
   * Affiche les résultats des tests
   */
  private logResults(suite: TestSuite) {
    console.log('\n📊 RÉSULTATS DES TESTS DOM ERROR PREVENTION');
    console.log('='.repeat(50));
    
    suite.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.name} (${duration})`);
      
      if (!result.passed && result.error) {
        console.log(`   Erreur: ${result.error}`);
      }
    });
    
    console.log('='.repeat(50));
    console.log(`📈 Total: ${suite.passedTests}/${suite.totalTests} tests réussis`);
    console.log(`⏱️  Durée totale: ${suite.duration}ms`);
    console.log(`🎯 Statut: ${suite.overallSuccess ? '✅ TOUS LES TESTS RÉUSSIS' : '❌ CERTAINS TESTS ONT ÉCHOUÉ'}`);
    
    if (suite.overallSuccess) {
      console.log('\n🎉 FÉLICITATIONS ! Le système de prévention des erreurs DOM fonctionne parfaitement.');
      console.log('   Vous ne devriez plus jamais avoir de problème removeChild !');
    } else {
      console.log('\n⚠️  ATTENTION ! Certains tests ont échoué. Vérifiez la configuration.');
    }
  }

  /**
   * Exécute un test de stress pour valider la robustesse
   */
  async runStressTest(iterations: number = 1000): Promise<TestResult> {
    return this.runTest(`Test de stress (${iterations} itérations)`, async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        // Générer du HTML aléatoire avec des caractères problématiques
        const randomHTML = this.generateRandomHTML();
        safeInnerHTML(randomHTML);
        
        // Simuler des opérations DOM
        safeDOMOperation(() => {
          const div = document.createElement('div');
          div.innerHTML = `<p>Stress test ${i}</p>`;
          return div.innerHTML;
        });
      }
      
      const duration = Date.now() - startTime;
      console.log(`Test de stress terminé en ${duration}ms`);
    });
  }

  /**
   * Génère du HTML aléatoire pour les tests
   */
  private generateRandomHTML(): string {
    const templates = [
      '<p>Texte normal</p>',
      '<script>alert("test")</script><p>Contenu</p>',
      '<div>Non fermé',
      'Texte\u0000avec\u001Fcaractères\u007Fde contrôle',
      '<p>Texte <strong>gras</p>',
      '<img src="x" onerror="alert(1)">',
      '<p>Texte normal avec <a href="#">lien</a></p>'
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

// Instance globale pour les tests
export const domErrorTestSuite = new DOMErrorTestSuite();

// Fonction de test rapide
export const quickTest = async () => {
  console.log('🚀 Test rapide du système de prévention DOM...');
  const suite = await domErrorTestSuite.runAllTests();
  return suite.overallSuccess;
};

// Fonction de test complet
export const fullTest = async () => {
  console.log('🔬 Test complet du système de prévention DOM...');
  const suite = await domErrorTestSuite.runAllTests();
  
  if (suite.overallSuccess) {
    console.log('🧪 Exécution du test de stress...');
    const stressResult = await domErrorTestSuite.runStressTest(500);
    console.log(`Test de stress: ${stressResult.passed ? '✅' : '❌'}`);
  }
  
  return suite.overallSuccess;
};

// Auto-test au chargement en mode développement
if (import.meta.env.DEV) {
  setTimeout(() => {
    quickTest();
  }, 2000);
}
