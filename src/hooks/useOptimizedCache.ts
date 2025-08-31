import { useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
}

export function useOptimizedCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // 5 minutes par défaut
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      return null;
    }

    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T, customTtl?: number): void => {
    // Nettoyer le cache si nécessaire
    if (cacheRef.current.size >= maxSize) {
      const oldestKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(oldestKey);
    }

    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl,
    });
  }, [ttl, maxSize]);

  const invalidate = useCallback((key: string): void => {
    cacheRef.current.delete(key);
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  const cleanup = useCallback((): void => {
    const now = Date.now();
    for (const [key, entry] of cacheRef.current.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  return {
    get,
    set,
    invalidate,
    clear,
    cleanup,
  };
}
