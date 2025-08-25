/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback } from 'react'
import { useErrorLogger } from '@/utils/monitoring/errorLogger'
import { usePerformanceMonitor } from '@/utils/monitoring/performanceMonitor'

interface UseMonitoringOptions {
  component: string
  trackPerformance?: boolean
  trackErrors?: boolean
  userId?: string
  userRole?: string
}

export function useMonitoring(options: UseMonitoringOptions) {
  const { logError, logWarning, logInfo } = useErrorLogger()
  const { startMeasure, endMeasure, measureAsync } = usePerformanceMonitor()

  // Enregistrer le montage du composant
  useEffect(() => {
    if (options.trackPerformance) {
      logInfo(`Component ${options.component} mounted`, {
        component: options.component,
        userId: options.userId,
        userRole: options.userRole,
      })
    }

    return () => {
      if (options.trackPerformance) {
        logInfo(`Component ${options.component} unmounted`, {
          component: options.component,
          userId: options.userId,
          userRole: options.userRole,
        })
      }
    }
  }, [options.component, options.trackPerformance, options.userId, options.userRole, logInfo])

  // Wrapper pour les erreurs avec contexte
  const trackError = useCallback((error: Error | string, metadata?: Record<string, any>) => {
    if (!options.trackErrors) return

    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'string' ? undefined : error.stack

    logError({
      message: errorMessage,
      stack: errorStack,
      context: {
        component: options.component,
        userId: options.userId,
        userRole: options.userRole,
      },
      metadata,
    })
  }, [logError, options.component, options.trackErrors, options.userId, options.userRole])

  // Wrapper pour les warnings avec contexte
  const trackWarning = useCallback((message: string, metadata?: Record<string, any>) => {
    logWarning(message, {
      component: options.component,
      userId: options.userId,
      userRole: options.userRole,
    }, metadata)
  }, [logWarning, options.component, options.userId, options.userRole])

  // Wrapper pour mesurer les performances d'une opération async
  const trackAsyncOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    if (!options.trackPerformance) {
      return operation()
    }

    try {
      return await measureAsync(
        operationName,
        operation,
        options.component
      )
    } catch (error) {
      trackError(error as Error, { operation: operationName })
      throw error
    }
  }, [measureAsync, options.component, options.trackPerformance, trackError])

  // Wrapper pour mesurer les performances d'une opération sync
  const trackSyncOperation = useCallback(<T>(
    operationName: string,
    operation: () => T
  ): T => {
    if (!options.trackPerformance) {
      return operation()
    }

    const measureId = startMeasure(operationName, options.component)
    try {
      const result = operation()
      endMeasure(measureId)
      return result
    } catch (error) {
      endMeasure(measureId)
      trackError(error as Error, { operation: operationName })
      throw error
    }
  }, [startMeasure, endMeasure, options.component, options.trackPerformance, trackError])

  // Wrapper pour les requêtes API
  const trackApiCall = useCallback(async <T>(
    apiName: string,
    apiCall: () => Promise<T>,
    expectedDuration?: number
  ): Promise<T> => {
    const startTime = Date.now()
    
    try {
      const result = await trackAsyncOperation(`api-${apiName}`, apiCall)
      
      const duration = Date.now() - startTime
      if (expectedDuration && duration > expectedDuration * 1.5) {
        trackWarning(`API call ${apiName} took longer than expected`, {
          duration,
          expectedDuration,
          apiName,
        })
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      trackError(error as Error, {
        apiName,
        duration,
        type: 'api_error',
      })
      throw error
    }
  }, [trackAsyncOperation, trackWarning, trackError])

  // Wrapper pour les interactions utilisateur
  const trackUserAction = useCallback((
    action: string,
    metadata?: Record<string, any>
  ) => {
    logInfo(`User action: ${action}`, {
      component: options.component,
      userId: options.userId,
      userRole: options.userRole,
      action: 'user_interaction',
    }, {
      action,
      ...metadata,
    })
  }, [logInfo, options.component, options.userId, options.userRole])

  // Wrapper pour les erreurs de validation
  const trackValidationError = useCallback((
    field: string,
    value: any,
    error: string
  ) => {
    trackError(`Validation error on ${field}: ${error}`, {
      field,
      value: typeof value === 'object' ? JSON.stringify(value) : value,
      type: 'validation_error',
    })
  }, [trackError])

  // Wrapper pour les erreurs de permission
  const trackPermissionError = useCallback((
    resource: string,
    action: string,
    reason?: string
  ) => {
    trackError(`Permission denied: ${action} on ${resource}`, {
      resource,
      action,
      reason,
      type: 'permission_error',
    })
  }, [trackError])

  return {
    trackError,
    trackWarning,
    trackAsyncOperation,
    trackSyncOperation,
    trackApiCall,
    trackUserAction,
    trackValidationError,
    trackPermissionError,
  }
}

// Hook spécialisé pour les pages
export function usePageMonitoring(pageName: string, userId?: string, userRole?: string) {
  const monitoring = useMonitoring({
    component: `page-${pageName}`,
    trackPerformance: true,
    trackErrors: true,
    userId,
    userRole,
  })

  useEffect(() => {
    // Tracker la navigation vers la page
    monitoring.trackUserAction('page_view', { pageName })
    
    // Mesurer le temps de chargement de la page
    const startTime = performance.now()
    
    return () => {
      const loadTime = performance.now() - startTime
      if (loadTime > 100) { // Seulement si la page était visible plus de 100ms
        monitoring.trackUserAction('page_unload', { 
          pageName, 
          timeSpent: Math.round(loadTime) 
        })
      }
    }
  }, [pageName, monitoring])

  return monitoring
}

// Hook spécialisé pour les formulaires
export function useFormMonitoring(formName: string, userId?: string, userRole?: string) {
  const monitoring = useMonitoring({
    component: `form-${formName}`,
    trackPerformance: true,
    trackErrors: true,
    userId,
    userRole,
  })

  const trackFormStart = useCallback(() => {
    monitoring.trackUserAction('form_start', { formName })
  }, [monitoring, formName])

  const trackFormSubmit = useCallback((success: boolean, errors?: Record<string, string>) => {
    monitoring.trackUserAction('form_submit', { 
      formName, 
      success,
      errorCount: errors ? Object.keys(errors).length : 0
    })

    if (errors) {
      Object.entries(errors).forEach(([field, error]) => {
        monitoring.trackValidationError(field, '', error)
      })
    }
  }, [monitoring, formName])

  const trackFieldError = useCallback((field: string, value: any, error: string) => {
    monitoring.trackValidationError(field, value, error)
  }, [monitoring])

  return {
    ...monitoring,
    trackFormStart,
    trackFormSubmit,
    trackFieldError,
  }
}