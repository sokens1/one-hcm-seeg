/**
 * Context global pour la gestion du cache avec localStorage
 * Optimise les performances en évitant les rechargements inutiles
 */

import React, { createContext, useContext, useCallback, useMemo } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  isExpired: (key: string) => boolean;
}

const CacheContext = createContext<CacheContextType | null>(null);

const CACHE_PREFIX = 'talent_flow_cache_';
const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes par défaut

export function CacheProvider({ children }: { children: React.ReactNode }) {
  // Récupérer une donnée du cache
  const get = useCallback(<T,>(key: string): T | null => {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const item = localStorage.getItem(cacheKey);
      
      if (!item) return null;
      
      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Vérifier si le cache a expiré
      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du cache pour "${key}":`, error);
      return null;
    }
  }, []);

  // Stocker une donnée dans le cache
  const set = useCallback(<T,>(key: string, data: T, ttl: number = DEFAULT_TTL): void => {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      // Si localStorage est plein, supprimer les entrées les plus anciennes
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Cache localStorage plein, nettoyage en cours...');
        clearExpiredEntries();
        
        // Réessayer
        try {
          const cacheKey = CACHE_PREFIX + key;
          const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
          };
          localStorage.setItem(cacheKey, JSON.stringify(entry));
        } catch (retryError) {
          console.error(`Impossible de stocker dans le cache après nettoyage:`, retryError);
        }
      } else {
        console.error(`Erreur lors du stockage dans le cache pour "${key}":`, error);
      }
    }
  }, []);

  // Supprimer une entrée du cache
  const remove = useCallback((key: string): void => {
    try {
      const cacheKey = CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error(`Erreur lors de la suppression du cache pour "${key}":`, error);
    }
  }, []);

  // Vider tout le cache
  const clear = useCallback((): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }, []);

  // Vérifier si une clé existe dans le cache (et n'a pas expiré)
  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  // Vérifier si une clé a expiré
  const isExpired = useCallback((key: string): boolean => {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const item = localStorage.getItem(cacheKey);
      
      if (!item) return true;
      
      const entry: CacheEntry<unknown> = JSON.parse(item);
      return Date.now() > entry.expiresAt;
    } catch (error) {
      return true;
    }
  }, []);

  // Nettoyer les entrées expirées
  const clearExpiredEntries = useCallback((): void => {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry: CacheEntry<unknown> = JSON.parse(item);
              if (now > entry.expiresAt) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Supprimer les entrées corrompues
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage des entrées expirées:', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      get,
      set,
      remove,
      clear,
      has,
      isExpired,
    }),
    [get, set, remove, clear, has, isExpired]
  );

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache doit être utilisé dans un CacheProvider');
  }
  return context;
}

