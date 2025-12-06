/**
 * Optimized query hooks using the centralized API client
 * Provides consistent data fetching with React Query
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient } from './api-client'

/**
 * Generic query hook using the API client
 */
export function useApiQuery<TData>(
  queryKey: (string | undefined)[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  // Filter out undefined values from query key
  const filteredKey = queryKey.filter((k): k is string => k !== undefined)
  
  return useQuery<TData, Error>({
    queryKey: filteredKey,
    queryFn: () => apiClient.get<TData>(endpoint),
    ...options,
  })
}

/**
 * Query hook with query parameters
 */
export function useApiQueryWithParams<TData, TParams extends Record<string, unknown> = Record<string, unknown>>(
  queryKey: string[],
  endpoint: string,
  params?: TParams,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  const queryParams = params
    ? new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              acc[key] = String(value)
            }
            return acc
          },
          {} as Record<string, string>
        )
      ).toString()
    : ''

  const url = queryParams ? `${endpoint}?${queryParams}` : endpoint

  const finalQueryKey = params ? [...queryKey, params] : queryKey
  
  return useQuery<TData, Error>({
    queryKey: finalQueryKey,
    queryFn: () => apiClient.get<TData>(url),
    ...options,
  })
}

/**
 * Infinite query hook for pagination
 */
import { useInfiniteQuery } from '@tanstack/react-query'

export function useInfiniteApiQuery<TData, TParams extends Record<string, unknown>>(
  queryKey: string[],
  endpoint: string,
  params?: TParams,
  options?: {
    getNextPageParam?: (lastPage: TData, allPages: TData[]) => string | number | undefined
    getPreviousPageParam?: (firstPage: TData, allPages: TData[]) => string | number | undefined
  }
) {

  const queryParams = params
    ? new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              acc[key] = String(value)
            }
            return acc
          },
          {} as Record<string, string>
        )
      ).toString()
    : ''

  const infiniteQueryKey = params ? [...queryKey, params] : queryKey
  
  return useInfiniteQuery<TData, Error>({
    queryKey: infiniteQueryKey,
    queryFn: ({ pageParam }) => {
      const url = queryParams
        ? `${endpoint}?${queryParams}&page=${pageParam || 1}`
        : `${endpoint}?page=${pageParam || 1}`
      return apiClient.get<TData>(url)
    },
    initialPageParam: 1,
    getNextPageParam: options?.getNextPageParam || (() => undefined),
    getPreviousPageParam: options?.getPreviousPageParam,
  })
}

