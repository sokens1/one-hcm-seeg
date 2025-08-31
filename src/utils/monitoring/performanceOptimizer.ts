// Utilitaire pour optimiser les performances et surveiller la charge IO
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Map<string, number[]> = new Map();
  private slowQueries: Array<{ query: string; duration: number; timestamp: Date }> = [];

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Mesurer le temps d'exécution d'une fonction
  async measureExecution<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.recordMetric(operationName, duration);
      
      // Alerter si l'opération est lente (> 2 secondes)
      if (duration > 2000) {
        this.recordSlowQuery(operationName, duration);
        console.warn(`⚠️ Opération lente détectée: ${operationName} (${duration.toFixed(2)}ms)`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(`${operationName}_error`, duration);
      throw error;
    }
  }

  // Enregistrer une métrique
  private recordMetric(operationName: string, duration: number): void {
    if (!this.metrics.has(operationName)) {
      this.metrics.set(operationName, []);
    }
    
    const metrics = this.metrics.get(operationName)!;
    metrics.push(duration);
    
    // Garder seulement les 100 dernières mesures
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  // Enregistrer une requête lente
  private recordSlowQuery(operationName: string, duration: number): void {
    this.slowQueries.push({
      query: operationName,
      duration,
      timestamp: new Date()
    });
    
    // Garder seulement les 50 dernières requêtes lentes
    if (this.slowQueries.length > 50) {
      this.slowQueries.shift();
    }
  }

  // Obtenir les statistiques de performance
  getPerformanceStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [operationName, durations] of this.metrics.entries()) {
      if (durations.length > 0) {
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        const p95 = this.percentile(durations, 0.95);
        
        stats[operationName] = {
          count: durations.length,
          average: Math.round(avg),
          min: Math.round(min),
          max: Math.round(max),
          p95: Math.round(p95)
        };
      }
    }
    
    return stats;
  }

  // Obtenir les requêtes lentes récentes
  getSlowQueries(): Array<{ query: string; duration: number; timestamp: Date }> {
    return [...this.slowQueries].reverse(); // Plus récentes en premier
  }

  // Calculer un percentile
  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  // Recommandations d'optimisation
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getPerformanceStats();
    
    for (const [operation, stat] of Object.entries(stats)) {
      if (stat.average > 1000) {
        recommendations.push(`Optimiser ${operation}: moyenne de ${stat.average}ms`);
      }
      
      if (stat.p95 > 3000) {
        recommendations.push(`Requête ${operation} très lente: P95 à ${stat.p95}ms`);
      }
    }
    
    if (this.slowQueries.length > 10) {
      recommendations.push(`Trop de requêtes lentes (${this.slowQueries.length}). Considérer la mise en cache.`);
    }
    
    return recommendations;
  }

  // Réinitialiser les métriques
  reset(): void {
    this.metrics.clear();
    this.slowQueries = [];
  }
}

// Hook React pour utiliser l'optimiseur de performance
export function usePerformanceOptimizer() {
  const optimizer = PerformanceOptimizer.getInstance();
  
  return {
    measureExecution: optimizer.measureExecution.bind(optimizer),
    getStats: () => optimizer.getPerformanceStats(),
    getSlowQueries: () => optimizer.getSlowQueries(),
    getRecommendations: () => optimizer.getOptimizationRecommendations(),
    reset: () => optimizer.reset()
  };
}

// Fonction utilitaire pour wrapper les appels Supabase
export async function withPerformanceMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const optimizer = PerformanceOptimizer.getInstance();
  return optimizer.measureExecution(operation, operationName);
}
