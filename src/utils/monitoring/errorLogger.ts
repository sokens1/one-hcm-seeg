/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ErrorLog {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  context: {
    url: string
    userAgent: string
    userId?: string
    userRole?: string
    environment: 'development' | 'production'
    component?: string
    action?: string
  }
  metadata?: Record<string, any>
}

export interface ErrorSolution {
  errorPattern: string | RegExp
  solution: string
  category: 'auth' | 'database' | 'network' | 'ui' | 'validation' | 'permission'
  severity: 'low' | 'medium' | 'high' | 'critical'
  fixApplied?: boolean
  dateFixed?: string
}

class ErrorLogger {
  private errors: ErrorLog[] = []
  private solutions: ErrorSolution[] = []
  private maxErrors = 1000 // Limite pour éviter la surcharge mémoire

  constructor() {
    this.initializeKnownSolutions()
    this.setupGlobalErrorHandlers()
  }

  private initializeKnownSolutions() {
    this.solutions = [
      {
        errorPattern: /rate limit/i,
        solution: 'Implémenter un système de retry avec backoff exponentiel et gérer gracieusement en développement',
        category: 'auth',
        severity: 'medium',
      },
      {
        errorPattern: /network.*failed|fetch.*failed/i,
        solution: 'Ajouter une gestion de retry automatique et afficher un message utilisateur approprié',
        category: 'network',
        severity: 'high',
      },
      {
        errorPattern: /unauthorized|403|401/i,
        solution: 'Vérifier les permissions RLS et rediriger vers la page de connexion si nécessaire',
        category: 'permission',
        severity: 'high',
      },
      {
        errorPattern: /supabase.*client/i,
        solution: 'Vérifier la configuration des variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY',
        category: 'database',
        severity: 'critical',
      },
      {
        errorPattern: /hydration|mismatch/i,
        solution: 'Problème de SSR/hydration - vérifier les conditions de rendu côté client vs serveur',
        category: 'ui',
        severity: 'medium',
      },
      {
        errorPattern: /chunk.*failed/i,
        solution: 'Erreur de chargement de chunk - implémenter un retry ou un fallback pour les imports dynamiques',
        category: 'network',
        severity: 'medium',
      },
    ]
  }

  private setupGlobalErrorHandlers() {
    // Gestion des erreurs JavaScript globales
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        context: {
          component: 'global',
          action: 'javascript_error',
        },
      })
    })

    // Gestion des promesses rejetées non catchées
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled promise rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          component: 'global',
          action: 'unhandled_promise_rejection',
        },
      })
    })
  }

  logError(error: {
    message: string
    stack?: string
    context?: Partial<ErrorLog['context']>
    metadata?: Record<string, any>
    level?: ErrorLog['level']
  }) {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: error.level || 'error',
      message: error.message,
      stack: error.stack,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        environment: this.getEnvironment(),
        ...error.context,
      },
      metadata: error.metadata,
    }

    this.errors.push(errorLog)
    
    // Limiter le nombre d'erreurs stockées
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log en console en développement
    if (this.getEnvironment() === 'development') {
      console.error('Error logged:', errorLog)
    }

    // Envoyer à un service externe en production (optionnel)
    if (this.getEnvironment() === 'production') {
      this.sendToExternalService(errorLog)
    }

    return errorLog.id
  }

  logWarning(message: string, context?: Partial<ErrorLog['context']>, metadata?: Record<string, any>) {
    return this.logError({
      message,
      level: 'warning',
      context,
      metadata,
    })
  }

  logInfo(message: string, context?: Partial<ErrorLog['context']>, metadata?: Record<string, any>) {
    return this.logError({
      message,
      level: 'info',
      context,
      metadata,
    })
  }

  getErrors(filters?: {
    level?: ErrorLog['level']
    component?: string
    since?: string
    limit?: number
  }): ErrorLog[] {
    let filteredErrors = [...this.errors]

    if (filters?.level) {
      filteredErrors = filteredErrors.filter(error => error.level === filters.level)
    }

    if (filters?.component) {
      filteredErrors = filteredErrors.filter(error => 
        error.context.component === filters.component
      )
    }

    if (filters?.since) {
      const sinceDate = new Date(filters.since)
      filteredErrors = filteredErrors.filter(error => 
        new Date(error.timestamp) >= sinceDate
      )
    }

    if (filters?.limit) {
      filteredErrors = filteredErrors.slice(-filters.limit)
    }

    return filteredErrors.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  getSolution(errorMessage: string): ErrorSolution | null {
    return this.solutions.find(solution => {
      if (typeof solution.errorPattern === 'string') {
        return errorMessage.toLowerCase().includes(solution.errorPattern.toLowerCase())
      }
      return solution.errorPattern.test(errorMessage)
    }) || null
  }

  addSolution(solution: ErrorSolution) {
    this.solutions.push(solution)
  }

  markSolutionAsApplied(errorPattern: string | RegExp, dateFixed?: string) {
    const solution = this.solutions.find(s => s.errorPattern === errorPattern)
    if (solution) {
      solution.fixApplied = true
      solution.dateFixed = dateFixed || new Date().toISOString()
    }
  }

  getErrorStats() {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const errors24h = this.errors.filter(error => new Date(error.timestamp) >= last24h)
    const errors7d = this.errors.filter(error => new Date(error.timestamp) >= last7d)

    const byLevel = this.errors.reduce((acc, error) => {
      acc[error.level] = (acc[error.level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byComponent = this.errors.reduce((acc, error) => {
      const component = error.context.component || 'unknown'
      acc[component] = (acc[component] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: this.errors.length,
      last24h: errors24h.length,
      last7d: errors7d.length,
      byLevel,
      byComponent,
      criticalErrors: this.errors.filter(error => error.level === 'error').length,
    }
  }

  exportErrors(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'component', 'url', 'userId']
      const rows = this.errors.map(error => [
        error.timestamp,
        error.level,
        error.message.replace(/"/g, '""'),
        error.context.component || '',
        error.context.url,
        error.context.userId || '',
      ])
      
      return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    }

    return JSON.stringify(this.errors, null, 2)
  }

  clearErrors() {
    this.errors = []
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getEnvironment(): 'development' | 'production' {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'development' 
      : 'production'
  }

  private async sendToExternalService(errorLog: ErrorLog) {
    // Ici vous pourriez envoyer vers Sentry, LogRocket, etc.
    // Pour l'instant, on stocke juste localement
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]')
      existingLogs.push(errorLog)
      
      // Garder seulement les 100 dernières erreurs en localStorage
      const recentLogs = existingLogs.slice(-100)
      localStorage.setItem('errorLogs', JSON.stringify(recentLogs))
    } catch (e) {
      console.warn('Failed to store error log:', e)
    }
  }
}

// Instance singleton
export const errorLogger = new ErrorLogger()

// Hook React pour utiliser le logger
export const useErrorLogger = () => {
  return {
    logError: errorLogger.logError.bind(errorLogger),
    logWarning: errorLogger.logWarning.bind(errorLogger),
    logInfo: errorLogger.logInfo.bind(errorLogger),
    getErrors: errorLogger.getErrors.bind(errorLogger),
    getSolution: errorLogger.getSolution.bind(errorLogger),
    getErrorStats: errorLogger.getErrorStats.bind(errorLogger),
  }
}