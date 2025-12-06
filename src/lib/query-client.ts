/**
 * Optimized React Query configuration for real-time read/write operations
 * Features:
 * - Aggressive caching for fast reads
 * - Optimistic updates for fast writes
 * - Real-time refetching
 * - Error recovery
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query'

// Optimized default options for real-time operations
const queryConfig: DefaultOptions = {
  queries: {
    // Aggressive caching for fast reads
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - cache persists for 5min (formerly cacheTime)
    
    // Real-time refetching
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchOnMount: true, // Always refetch on mount for fresh data
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      // Retry up to 3 times for network/server errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Network mode
    networkMode: 'online', // Only run queries when online
  },
  mutations: {
    // Optimistic updates configuration
    retry: 1, // Retry failed mutations once
    retryDelay: 1000,
    networkMode: 'online',
  },
}

// Create and export the query client
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

/**
 * Invalidate and refetch queries matching a pattern
 * Useful for real-time updates after mutations
 */
export const invalidateQueries = (queryKey: string[]) => {
  queryClient.invalidateQueries({ queryKey })
}

/**
 * Optimistically update cache
 */
export const setQueryData = <T>(queryKey: string[], data: T) => {
  queryClient.setQueryData(queryKey, data)
}

/**
 * Prefetch data for instant loading
 */
export const prefetchQuery = async <T>(
  queryKey: string[],
  queryFn: () => Promise<T>
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  })
}

export default queryClient

