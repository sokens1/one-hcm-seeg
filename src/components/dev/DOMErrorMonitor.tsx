/**
 * Composant de monitoring des erreurs DOM en temps réel
 * À utiliser uniquement en mode développement
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, RefreshCw, Activity } from 'lucide-react';
import { domErrorPrevention, useDOMErrorPrevention } from '@/utils/domErrorPrevention';

interface DOMErrorMonitorProps {
  show?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function DOMErrorMonitor({ 
  show = import.meta.env.DEV, 
  position = 'top-right' 
}: DOMErrorMonitorProps) {
  const [stats, setStats] = useState(domErrorPrevention.getStats());
  const [isHealthy, setIsHealthy] = useState(domErrorPrevention.isHealthy());
  const [isVisible, setIsVisible] = useState(false);
  const { getStats, isHealthy: checkHealth } = useDOMErrorPrevention();

  // Mise à jour des statistiques toutes les 2 secondes
  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      const newStats = getStats();
      const healthy = checkHealth();
      setStats(newStats);
      setIsHealthy(healthy);
    }, 2000);

    return () => clearInterval(interval);
  }, [show, getStats, checkHealth]);

  // Écouter les événements de récupération
  useEffect(() => {
    const handleRecovery = () => {
      console.log('🔄 DOM Error Recovery triggered');
      setStats(getStats());
      setIsHealthy(checkHealth());
    };

    window.addEventListener('dom-error-recovery', handleRecovery);
    return () => window.removeEventListener('dom-error-recovery', handleRecovery);
  }, [getStats, checkHealth]);

  if (!show) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const handleReset = () => {
    domErrorPrevention.resetStats();
    setStats(getStats());
    setIsHealthy(checkHealth());
  };

  const handleTest = () => {
    // Simuler une erreur DOM pour tester le système
    try {
      const div = document.createElement('div');
      div.innerHTML = '<p>Test</p>';
      // Tenter de supprimer un élément qui n'est pas un enfant
      document.body.removeChild(div);
    } catch (error) {
      // L'erreur sera capturée par le système de prévention
      console.log('Test error triggered:', error);
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              DOM Error Monitor
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
                className="h-6 w-6 p-0"
              >
                {isVisible ? '−' : '+'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 w-6 p-0"
                title="Reset stats"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Status */}
          <div className="flex items-center gap-2 mb-3">
            {isHealthy ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isHealthy ? 'Système sain' : 'Problèmes détectés'}
            </span>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{stats.totalErrors}</div>
              <div className="text-xs text-muted-foreground">Erreurs totales</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{stats.removeChildErrors}</div>
              <div className="text-xs text-muted-foreground">removeChild</div>
            </div>
          </div>

          {/* Détails (si visible) */}
          {isVisible && (
            <div className="space-y-2 text-xs">
              <div>
                <strong>Dernière erreur:</strong>{' '}
                {stats.lastError ? stats.lastError.toLocaleTimeString() : 'Aucune'}
              </div>
              
              <div>
                <strong>Types d'erreurs:</strong>
                <div className="mt-1 space-y-1">
                  {Object.entries(stats.errorTypes).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}:</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boutons de test */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  className="w-full text-xs"
                >
                  Tester le système
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Composant de rapport détaillé
export function DOMErrorReport() {
  const [report, setReport] = useState('');

  useEffect(() => {
    const generateReport = () => {
      const healthReport = domErrorPrevention.generateHealthReport();
      setReport(healthReport);
    };

    generateReport();
    const interval = setInterval(generateReport, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Rapport de Santé DOM</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
          {report}
        </pre>
      </CardContent>
    </Card>
  );
}

export default DOMErrorMonitor;
