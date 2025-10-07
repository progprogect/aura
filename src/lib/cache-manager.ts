/**
 * CacheManager - система персистентного кеширования для AI-чата
 * Использует localStorage для кеширования вопросов и результатов поиска
 */

'use client'

import { useCallback, useState, useEffect } from 'react'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

export interface CacheConfig {
  defaultTTL: number // в миллисекундах
  maxEntries: number
  prefix: string
}

export class CacheManager {
  private static instance: CacheManager
  private config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = config
  }

  static getInstance(config?: Partial<CacheConfig>): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager({
        defaultTTL: 30 * 60 * 1000, // 30 минут
        maxEntries: 100,
        prefix: 'aura_chat_cache_',
        ...config
      })
    }
    return CacheManager.instance
  }

  /**
   * Сохраняет данные в кеш
   */
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const cacheKey = `${this.config.prefix}${key}`
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        key: cacheKey
      }

      localStorage.setItem(cacheKey, JSON.stringify(entry))
      this.cleanup()
    } catch (error) {
      console.warn('[CacheManager] Failed to set cache:', error)
    }
  }

  /**
   * Получает данные из кеша
   */
  get<T>(key: string): T | null {
    try {
      const cacheKey = `${this.config.prefix}${key}`
      const stored = localStorage.getItem(cacheKey)
      
      if (!stored) return null

      const entry: CacheEntry<T> = JSON.parse(stored)
      
      // Проверяем TTL
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.delete(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('[CacheManager] Failed to get cache:', error)
      return null
    }
  }

  /**
   * Удаляет запись из кеша
   */
  delete(key: string): void {
    try {
      const cacheKey = `${this.config.prefix}${key}`
      localStorage.removeItem(cacheKey)
    } catch (error) {
      console.warn('[CacheManager] Failed to delete cache:', error)
    }
  }

  /**
   * Проверяет существование записи в кеше
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Очищает устаревшие записи
   */
  private cleanup(): void {
    try {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.config.prefix))
        .sort((a, b) => {
          const aItem = localStorage.getItem(a)
          const bItem = localStorage.getItem(b)
          if (!aItem || !bItem) return 0
          
          const aEntry = JSON.parse(aItem) as CacheEntry<any>
          const bEntry = JSON.parse(bItem) as CacheEntry<any>
          
          return aEntry.timestamp - bEntry.timestamp
        })

      // Удаляем старые записи если превышен лимит
      if (keys.length > this.config.maxEntries) {
        const keysToDelete = keys.slice(0, keys.length - this.config.maxEntries)
        keysToDelete.forEach(key => {
          const originalKey = key.replace(this.config.prefix, '')
          this.delete(originalKey)
        })
      }

      // Удаляем устаревшие записи
      keys.forEach(key => {
        const stored = localStorage.getItem(key)
        if (!stored) return

        try {
          const entry = JSON.parse(stored) as CacheEntry<any>
          if (Date.now() - entry.timestamp > entry.ttl) {
            const originalKey = key.replace(this.config.prefix, '')
            this.delete(originalKey)
          }
        } catch (error) {
          // Удаляем поврежденные записи
          const originalKey = key.replace(this.config.prefix, '')
          this.delete(originalKey)
        }
      })
    } catch (error) {
      console.warn('[CacheManager] Cleanup failed:', error)
    }
  }

  /**
   * Очищает весь кеш
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.config.prefix))
      
      keys.forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn('[CacheManager] Clear failed:', error)
    }
  }

  /**
   * Получает статистику кеша
   */
  getStats(): {
    totalEntries: number
    totalSize: number
    oldestEntry: number | null
    newestEntry: number | null
  } {
    try {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.config.prefix))
      
      let totalSize = 0
      let oldestEntry: number | null = null
      let newestEntry: number | null = null

      keys.forEach(key => {
        const stored = localStorage.getItem(key)
        if (!stored) return

        totalSize += stored.length

        try {
          const entry = JSON.parse(stored) as CacheEntry<any>
          if (!oldestEntry || entry.timestamp < oldestEntry) {
            oldestEntry = entry.timestamp
          }
          if (!newestEntry || entry.timestamp > newestEntry) {
            newestEntry = entry.timestamp
          }
        } catch (error) {
          // Игнорируем поврежденные записи
        }
      })

      return {
        totalEntries: keys.length,
        totalSize,
        oldestEntry,
        newestEntry
      }
    } catch (error) {
      console.warn('[CacheManager] Stats failed:', error)
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null
      }
    }
  }
}

/**
 * Хук для использования кеша
 */
export function useCache() {
  const cache = CacheManager.getInstance()

  const setCache = useCallback(<T>(key: string, data: T, ttl?: number) => {
    cache.set(key, data, ttl)
  }, [cache])

  const getCache = useCallback(<T>(key: string): T | null => {
    return cache.get<T>(key)
  }, [cache])

  const deleteCache = useCallback((key: string) => {
    cache.delete(key)
  }, [cache])

  const hasCache = useCallback((key: string): boolean => {
    return cache.has(key)
  }, [cache])

  const clearCache = useCallback(() => {
    cache.clear()
  }, [cache])

  const getCacheStats = useCallback(() => {
    return cache.getStats()
  }, [cache])

  return {
    setCache,
    getCache,
    deleteCache,
    hasCache,
    clearCache,
    getCacheStats
  }
}

/**
 * Debounce хук для оптимизации производительности
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Хук для оптимизированного поиска с debouncing
 */
export function useOptimizedSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  const { setCache, getCache } = useCache()

  const search = useCallback(async (query: string, searchFn: (q: string) => Promise<any>) => {
    if (!query.trim()) return null

    // Проверяем кеш
    const cacheKey = `search_${query.toLowerCase().replace(/\s+/g, '_')}`
    const cached = getCache(cacheKey)
    if (cached) {
      console.log('[OptimizedSearch] Using cached result')
      return cached
    }

    // Выполняем поиск
    try {
      const result = await searchFn(query)
      
      // Сохраняем в кеш на 10 минут
      setCache(cacheKey, result, 10 * 60 * 1000)
      
      return result
    } catch (error) {
      console.error('[OptimizedSearch] Search failed:', error)
      throw error
    }
  }, [setCache, getCache])

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    search
  }
}
