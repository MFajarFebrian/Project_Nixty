import { debounce } from 'lodash-es'

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  debounceMs?: number // Debounce delay in milliseconds
}

interface CacheItem<T> {
  value: T
  timestamp: number
  ttl: number
}

export const useCache = () => {
  const cache = new Map<string, CacheItem<any>>()
  const debouncedSetters = new Map<string, Function>()

  const isExpired = (item: CacheItem<any>): boolean => {
    return Date.now() - item.timestamp > item.ttl
  }

  const get = <T>(key: string): T | null => {
    const item = cache.get(key)
    if (!item || isExpired(item)) {
      cache.delete(key)
      return null
    }
    return item.value
  }

  const set = <T>(key: string, value: T, options: CacheOptions = {}): void => {
    const ttl = options.ttl || 300000 // Default 5 minutes
    const debounceMs = options.debounceMs || 0

    const setValue = () => {
      cache.set(key, {
        value,
        timestamp: Date.now(),
        ttl
      })
    }

    if (debounceMs > 0) {
      if (!debouncedSetters.has(key)) {
        debouncedSetters.set(key, debounce(setValue, debounceMs))
      }
      const debouncedSetter = debouncedSetters.get(key)!
      debouncedSetter()
    } else {
      setValue()
    }
  }

  const has = (key: string): boolean => {
    const item = cache.get(key)
    return item !== undefined && !isExpired(item)
  }

  const clear = (key?: string): void => {
    if (key) {
      cache.delete(key)
      debouncedSetters.delete(key)
    } else {
      cache.clear()
      debouncedSetters.clear()
    }
  }

  const getOrSet = async <T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> => {
    const cached = get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    set(key, value, options)
    return value
  }

  // Cleanup expired entries
  const cleanup = (): void => {
    for (const [key, item] of cache.entries()) {
      if (isExpired(item)) {
        cache.delete(key)
        debouncedSetters.delete(key)
      }
    }
  }

  // Auto cleanup every 5 minutes
  if (process.client) {
    setInterval(cleanup, 300000)
  }

  return {
    get,
    set,
    has,
    clear,
    getOrSet,
    cleanup
  }
}

// Global cache instance
export const globalCache = useCache()
