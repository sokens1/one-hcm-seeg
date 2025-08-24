/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PerformanceMetric {
  id: string
  timestamp: string
  type: 'navigation' | 'resource' | 'measure' | 'custom'
  name: string
  duration: number
  context: {
    url: string
    userAgent: string
    environment: 'development' | 'production'
    component?: string
    userId?: string
  }
  metadata?: Record<string, any>
}

export interface PerformanceThreshold {
  metric: string
  warning: number // ms
  critical: number // ms
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private thresholds: PerformanceThreshold[] = []
  private maxMetrics = 500

  constructor() {
    this.initializeThresholds()
    this.setupPerformanceObserver()
  }

  private initializeThresholds() {
    this.thresholds = [
      { metric: 'page-load', warning: 3000, critical: 5000 },
      { metric: 'api-call', warning: 2000, critical: 5000 },
      { metric: 'component-render', warning: 100, critical: 500 },
      { metric: 'database-query', warning: 1000, critical: 3000 },
      { metric: 'file-upload', warning: 5000, critical: 15000 },
    ]
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Observer pour les métriques de navigation
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordMetric({
              type: 'navigation',
              name: 'page-load',
              duration: navEntry.loadEventEnd - navEntry.fetchStart,
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint(),
              },
            })
          }
        }
      })

      try {
        navObserver.observe({ entryTypes: ['navigation'] })
      } catch (e) {
        console.warn('Navigation observer not supported:', e)
      }

      // Observer pour les ressources
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            
            // Ne monitorer que les ressources importantes
            if (this.shouldMonitorResource(resourceEntry.name)) {
              this.recordMetric({
                type: 'resource',
                name: this.getResourceType(resourceEntry.name),
                duration: resourceEntry.responseEnd - resourceEntry.requestStart,
                metadata: {
                  url: resourceEntry.name,
                  size: resourceEntry.transferSize,
                  cached: resourceEntry.transferSize === 0,
                },
              })
            }
          }
        }
      })

      try {
        resourceObserver.observe({ entryTypes: ['resource'] })
      } catch (e) {
        console.warn('Resource observer not supported:', e)
      }
    }
  }

  recordMetric(metric: {
    type: PerformanceMetric['type']
    name: string
    duration: number
    component?: string
    metadata?: Record<string, any>
  }) {
    const performanceMetric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: metric.type,
      name: metric.name,
      duration: metric.duration,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        environment: this.getEnvironment(),
        component: metric.component,
      },
      metadata: metric.metadata,
    }

    this.metrics.push(performanceMetric)

    // Limiter le nombre de métriques stockées
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Vérifier les seuils et alerter si nécessaire
    this.checkThresholds(performanceMetric)

    return performanceMetric.id
  }

  // Méthodes pour mesurer des opérations spécifiques
  startMeasure(name: string, component?: string): string {
    const measureId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    performance.mark(`${measureId}_start`)
    
    // Stocker le contexte pour la fin de mesure
    ;(window as any).__performanceMeasures = (window as any).__performanceMeasures || {}
    ;(window as any).__performanceMeasures[measureId] = { name, component }
    
    return measureId
  }

  endMeasure(measureId: string): string | null {
    const measures = (window as any).__performanceMeasures || {}
    const measureContext = measures[measureId]
    
    if (!measureContext) {
      console.warn(`No measure found for ID: ${measureId}`)
      return null
    }

    try {
      performance.mark(`${measureId}_end`)
      performance.measure(measureId, `${measureId}_start`, `${measureId}_end`)
      
      const measure = performance.getEntriesByName(measureId)[0]
      
      const metricId = this.recordMetric({
        type: 'measure',
        name: measureContext.name,
        duration: measure.duration,
        component: measureContext.component,
      })

      // Nettoyer
      performance.clearMarks(`${measureId}_start`)
      performance.clearMarks(`${measureId}_end`)
      performance.clearMeasures(measureId)
      delete measures[measureId]

      return metricId
    } catch (e) {
      console.warn('Failed to end measure:', e)
      return null
    }
  }

  // Mesurer une fonction async
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    component?: string
  ): Promise<T> {
    const measureId = this.startMeasure(name, component)
    try {
      const result = await fn()
      this.endMeasure(measureId)
      return result
    } catch (error) {
      this.endMeasure(measureId)
      throw error
    }
  }

  // Mesurer une fonction synchrone
  measureSync<T>(
    name: string,
    fn: () => T,
    component?: string
  ): T {
    const measureId = this.startMeasure(name, component)
    try {
      const result = fn()
      this.endMeasure(measureId)
      return result
    } catch (error) {
      this.endMeasure(measureId)
      throw error
    }
  }

  getMetrics(filters?: {
    type?: PerformanceMetric['type']
    name?: string
    component?: string
    since?: string
    limit?: number
  }): PerformanceMetric[] {
    let filteredMetrics = [...this.metrics]

    if (filters?.type) {
      filteredMetrics = filteredMetrics.filter(metric => metric.type === filters.type)
    }

    if (filters?.name) {
      filteredMetrics = filteredMetrics.filter(metric => metric.name === filters.name)
    }

    if (filters?.component) {
      filteredMetrics = filteredMetrics.filter(metric => 
        metric.context.component === filters.component
      )
    }

    if (filters?.since) {
      const sinceDate = new Date(filters.since)
      filteredMetrics = filteredMetrics.filter(metric => 
        new Date(metric.timestamp) >= sinceDate
      )
    }

    if (filters?.limit) {
      filteredMetrics = filteredMetrics.slice(-filters.limit)
    }

    return filteredMetrics.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  getPerformanceStats() {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recent = this.metrics.filter(metric => new Date(metric.timestamp) >= last24h)

    const avgByType = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = { total: 0, count: 0, avg: 0 }
      }
      acc[metric.type].total += metric.duration
      acc[metric.type].count += 1
      acc[metric.type].avg = acc[metric.type].total / acc[metric.type].count
      return acc
    }, {} as Record<string, { total: number; count: number; avg: number }>)

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)

    return {
      totalMetrics: this.metrics.length,
      recentMetrics: recent.length,
      averageByType: avgByType,
      slowestOperations,
      thresholdViolations: this.getThresholdViolations(),
    }
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.thresholds.find(t => t.metric === metric.name)
    if (!threshold) return

    if (metric.duration > threshold.critical) {
      console.error(`Critical performance issue: ${metric.name} took ${metric.duration}ms (threshold: ${threshold.critical}ms)`)
    } else if (metric.duration > threshold.warning) {
      console.warn(`Performance warning: ${metric.name} took ${metric.duration}ms (threshold: ${threshold.warning}ms)`)
    }
  }

  private getThresholdViolations() {
    return this.metrics.filter(metric => {
      const threshold = this.thresholds.find(t => t.metric === metric.name)
      return threshold && metric.duration > threshold.warning
    })
  }

  private shouldMonitorResource(url: string): boolean {
    // Monitorer seulement les ressources importantes
    return url.includes('/api/') || 
           url.includes('.js') || 
           url.includes('.css') || 
           url.includes('supabase')
  }

  private getResourceType(url: string): string {
    if (url.includes('/api/') || url.includes('supabase')) return 'api-call'
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image'
    return 'other'
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : null
  }

  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : null
  }

  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getEnvironment(): 'development' | 'production' {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'development' 
      : 'production'
  }

  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'type', 'name', 'duration', 'component', 'url']
      const rows = this.metrics.map(metric => [
        metric.timestamp,
        metric.type,
        metric.name,
        metric.duration.toString(),
        metric.context.component || '',
        metric.context.url,
      ])
      
      return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    }

    return JSON.stringify(this.metrics, null, 2)
  }

  clearMetrics() {
    this.metrics = []
  }
}

// Instance singleton
export const performanceMonitor = new PerformanceMonitor()

// Hook React pour utiliser le monitor
export const usePerformanceMonitor = () => {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    startMeasure: performanceMonitor.startMeasure.bind(performanceMonitor),
    endMeasure: performanceMonitor.endMeasure.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getPerformanceStats: performanceMonitor.getPerformanceStats.bind(performanceMonitor),
  }
}