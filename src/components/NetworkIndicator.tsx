/**
 * Indicateur de qualité réseau en temps réel
 * Affiche la vitesse, le type de connexion et les variances
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NetworkInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink?: number; // Mbps
  rtt?: number; // ms (round-trip time)
  saveData?: boolean;
  online: boolean;
}

export function NetworkIndicator() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    effectiveType: 'unknown',
    online: navigator.onLine,
  });
  const [history, setHistory] = useState<number[]>([]); // Historique des RTT pour variance

  useEffect(() => {
    // Fonction pour récupérer les infos réseau
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        const newRtt = connection.rtt || 0;
        
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink,
          rtt: newRtt,
          saveData: connection.saveData,
          online: navigator.onLine,
        });

        // Mettre à jour l'historique pour calculer la variance
        setHistory(prev => {
          const newHistory = [...prev, newRtt].slice(-20); // Garder les 20 derniers
          return newHistory;
        });
      } else {
        setNetworkInfo({
          effectiveType: 'unknown',
          online: navigator.onLine,
        });
      }
    };

    // Mettre à jour immédiatement
    updateNetworkInfo();

    // Mettre à jour toutes les 3 secondes
    const interval = setInterval(updateNetworkInfo, 3000);

    // Écouter les changements de connexion
    const handleOnline = () => setNetworkInfo(prev => ({ ...prev, online: true }));
    const handleOffline = () => setNetworkInfo(prev => ({ ...prev, online: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter les changements de connexion (Network Information API)
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  // Calculer la variance du RTT
  const calculateVariance = () => {
    if (history.length < 2) return 0;
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
    return Math.sqrt(variance); // Écart-type
  };

  const variance = calculateVariance();

  // Déterminer la qualité de la connexion
  const getQuality = (): { label: string; color: string; icon: any } => {
    if (!networkInfo.online) {
      return { label: 'Hors ligne', color: 'text-gray-500', icon: WifiOff };
    }

    switch (networkInfo.effectiveType) {
      case '4g':
        return { label: 'Excellent', color: 'text-green-500', icon: SignalHigh };
      case '3g':
        return { label: 'Bon', color: 'text-yellow-500', icon: SignalMedium };
      case '2g':
        return { label: 'Faible', color: 'text-orange-500', icon: SignalLow };
      case 'slow-2g':
        return { label: 'Très faible', color: 'text-red-500', icon: Signal };
      default:
        return { label: 'Inconnu', color: 'text-gray-500', icon: Wifi };
    }
  };

  const quality = getQuality();
  const Icon = quality.icon;

  // Déterminer la stabilité de la connexion
  const getStability = () => {
    if (variance < 10) return { label: 'Stable', color: 'text-green-500' };
    if (variance < 50) return { label: 'Modérée', color: 'text-yellow-500' };
    return { label: 'Instable', color: 'text-red-500' };
  };

  const stability = getStability();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm cursor-help transition-all hover:shadow-md hover:border-gray-300">
            <Icon className={`h-4 w-4 ${quality.color}`} />
            <div className="flex flex-col items-start">
              <span className={`text-xs font-medium ${quality.color}`}>
                {quality.label}
              </span>
              {networkInfo.effectiveType !== 'unknown' && (
                <span className="text-[10px] text-gray-500 uppercase">
                  {networkInfo.effectiveType}
                </span>
              )}
            </div>
            {networkInfo.saveData && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                Éco
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2 p-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">État du réseau</span>
              <span className={`text-sm ${quality.color}`}>{quality.label}</span>
            </div>
            
            <div className="border-t pt-2 space-y-1.5">
              {networkInfo.effectiveType !== 'unknown' && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Type de connexion :</span>
                  <span className="font-medium uppercase">{networkInfo.effectiveType}</span>
                </div>
              )}
              
              {networkInfo.downlink !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Bande passante :</span>
                  <span className="font-medium">{networkInfo.downlink.toFixed(1)} Mbps</span>
                </div>
              )}
              
              {networkInfo.rtt !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Latence (RTT) :</span>
                  <span className="font-medium">{networkInfo.rtt} ms</span>
                </div>
              )}
              
              {history.length > 1 && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Stabilité :</span>
                    <span className={`font-medium ${stability.color}`}>
                      {stability.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Variance :</span>
                    <span className="font-medium">±{variance.toFixed(0)} ms</span>
                  </div>
                </>
              )}
              
              {networkInfo.saveData && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Mode économie :</span>
                  <span className="font-medium text-blue-600">Activé</span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-2">
              <p className="text-[10px] text-gray-500 italic">
                {networkInfo.effectiveType === '4g' && 'Conditions optimales pour le chargement'}
                {networkInfo.effectiveType === '3g' && 'Chargement peut être ralenti'}
                {networkInfo.effectiveType === '2g' && 'Chargement lent, cache activé'}
                {networkInfo.effectiveType === 'slow-2g' && 'Connexion très lente, utilisez le cache'}
                {!networkInfo.online && 'Aucune connexion Internet'}
                {networkInfo.effectiveType === 'unknown' && 'Infos réseau non disponibles'}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

