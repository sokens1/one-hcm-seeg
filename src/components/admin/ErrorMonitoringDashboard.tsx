/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useErrorLogger } from '@/utils/monitoring/errorLogger'
import { usePerformanceMonitor } from '@/utils/monitoring/performanceMonitor'
import { AlertTriangle, CheckCircle, Clock, Download, RefreshCw, TrendingUp } from 'lucide-react'

export function ErrorMonitoringDashboard() {
  const { getErrors, getErrorStats, getSolution } = useErrorLogger()
  const { getMetrics, getPerformanceStats } = usePerformanceMonitor()
  
  const [errors, setErrors] = useState<any[]>([])
  const [errorStats, setErrorStats] = useState<any>({})
  const [performanceStats, setPerformanceStats] = useState<any>({})
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('24h')

  const refreshData = useCallback(() => {
    const since = new Date()
    switch (selectedTimeframe) {
      case '1h':
        since.setHours(since.getHours() - 1)
        break
      case '24h':
        since.setDate(since.getDate() - 1)
        break
      case '7d':
        since.setDate(since.getDate() - 7)
        break
    }

    setErrors(getErrors({ since: since.toISOString(), limit: 50 }))
    setErrorStats(getErrorStats())
    setPerformanceStats(getPerformanceStats())
  }, [selectedTimeframe, getErrors, getErrorStats, getPerformanceStats])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const exportData = (type: 'errors' | 'performance') => {
    const data = type === 'errors' 
      ? JSON.stringify(errors, null, 2)
      : JSON.stringify(getMetrics(), null, 2)
    
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'info': return 'outline'
      default: return 'outline'
    }
  }

  const getPerformanceColor = (duration: number, threshold: number) => {
    if (duration > threshold * 2) return 'destructive'
    if (duration > threshold) return 'secondary'
    return 'outline'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Surveillance des erreurs et performances en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('errors')}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs Totales</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {errorStats.last24h || 0} dernières 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {errorStats.criticalErrors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention immédiate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(performanceStats.averageByType?.navigation?.avg || 0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Temps de chargement des pages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-muted-foreground">
              Disponibilité du service
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Erreurs Récentes</CardTitle>
              <CardDescription>
                Dernières erreurs détectées dans l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    Aucune erreur détectée récemment
                  </div>
                ) : (
                  errors.map((error) => (
                    <div key={error.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(error.level)}>
                            {error.level.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{error.context.component || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(error.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <p className="text-sm">{error.message}</p>
                      
                      {error.stack && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">
                            Voir la stack trace
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}

                      {getSolution(error.message) && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Solution suggérée</AlertTitle>
                          <AlertDescription>
                            {getSolution(error.message)?.solution}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques de Performance</CardTitle>
              <CardDescription>
                Temps de réponse et performance des composants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceStats.slowestOperations?.map((metric: any, index: number) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {metric.context.component || 'Global'}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getPerformanceColor(metric.duration, 1000)}>
                        {Math.round(metric.duration)}ms
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune métrique de performance disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solutions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solutions Automatiques</CardTitle>
              <CardDescription>
                Solutions appliquées automatiquement par le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Rate Limiting</AlertTitle>
                  <AlertDescription>
                    Gestion automatique des limites de taux en développement - 
                    Les erreurs de rate limit sont ignorées sur localhost
                  </AlertDescription>
                </Alert>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Retry Automatique</AlertTitle>
                  <AlertDescription>
                    Les requêtes réseau échouées sont automatiquement retentées 
                    avec un backoff exponentiel
                  </AlertDescription>
                </Alert>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Fallback Gracieux</AlertTitle>
                  <AlertDescription>
                    En cas d'échec des RPC Supabase, l'application continue de 
                    fonctionner avec des données par défaut
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}