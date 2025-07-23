import debounce from 'lodash-es/debounce';
import { globalCache } from './useCache'

interface DebouncedApiOptions {
  debounceMs?: number
  cacheKey?: string
  cacheTtl?: number
  immediate?: boolean
}

export const useDebouncedApi = <T>(
  apiCall: () => Promise<T>,
  options: DebouncedApiOptions = {}
) => {
  const {
    debounceMs = 300,
    cacheKey,
    cacheTtl = 300000, // 5 minutes
    immediate = false
  } = options

  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)

  const executeApi = async () => {
    try {
      loading.value = true
      error.value = null

      // Check cache first if cacheKey is provided
      if (cacheKey) {
        const cached = globalCache.get<T>(cacheKey)
        if (cached) {
          data.value = cached
          loading.value = false
          return cached
        }
      }

      const result = await apiCall()
      data.value = result

      // Cache the result if cacheKey is provided
      if (cacheKey) {
        globalCache.set(cacheKey, result, { ttl: cacheTtl })
      }

      loading.value = false
      return result
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      loading.value = false
      throw err
    }
  }

  const debouncedExecute = debounce(executeApi, debounceMs)

  const execute = immediate ? executeApi : debouncedExecute

  const cancel = () => {
    if (!immediate) {
      debouncedExecute.cancel()
    }
    loading.value = false
  }

  const clearCache = () => {
    if (cacheKey) {
      globalCache.clear(cacheKey)
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),
    execute,
    cancel,
    clearCache
  }
}

// Utility for debounced search
export const useDebouncedSearch = <T>(
  searchFn: (query: string) => Promise<T[]>,
  options: Omit<DebouncedApiOptions, 'cacheKey'> & { 
    minLength?: number
    generateCacheKey?: (query: string) => string 
  } = {}
) => {
  const {
    debounceMs = 300,
    cacheTtl = 300000,
    minLength = 2,
    generateCacheKey = (query: string) => `search:${query}`,
    immediate = false
  } = options

  const query = ref('')
  const results = ref<T[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const search = async (searchQuery: string) => {
    if (searchQuery.length < minLength) {
      results.value = []
      return []
    }

    try {
      loading.value = true
      error.value = null

      const cacheKey = generateCacheKey(searchQuery)
      const cached = globalCache.get<T[]>(cacheKey)
      
      if (cached) {
        results.value = cached
        loading.value = false
        return cached
      }

      const searchResults = await searchFn(searchQuery)
      results.value = searchResults

      globalCache.set(cacheKey, searchResults, { ttl: cacheTtl })
      loading.value = false
      return searchResults
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      loading.value = false
      throw err
    }
  }

  const debouncedSearch = debounce(search, debounceMs)

  const executeSearch = immediate ? search : debouncedSearch

  const clearResults = () => {
    results.value = []
    query.value = ''
  }

  const cancelSearch = () => {
    if (!immediate) {
      debouncedSearch.cancel()
    }
    loading.value = false
  }

  // Watch query changes
  watch(query, (newQuery) => {
    if (newQuery.length >= minLength) {
      executeSearch(newQuery)
    } else {
      clearResults()
    }
  })

  return {
    query,
    results: readonly(results),
    loading: readonly(loading),
    error: readonly(error),
    search: executeSearch,
    clearResults,
    cancel: cancelSearch
  }
}
