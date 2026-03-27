/**
 * Optimized mutation hooks with optimistic updates
 * Provides fast write operations with instant UI feedback
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './api-client'
import { invalidateQueries } from './query-client'

/**
 * Generic mutation hook with optimistic updates
 */
export function useOptimisticMutation<TData, TVariables, TContext = unknown>(
  mutationKey: string[],
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onMutate?: (variables: TVariables) => Promise<TContext> | TContext
    onError?: (error: Error, variables: TVariables, context: TContext) => void
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => void
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context: TContext | undefined) => void
    invalidateQueries?: string[][]
  }
) {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables, TContext>({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: mutationKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(mutationKey)

      // Optimistically update cache if onMutate is provided
      const context = options?.onMutate
        ? await options.onMutate(variables)
        : (undefined as TContext)

      return { previousData, context } as TContext
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context && typeof context === 'object' && 'previousData' in context) {
        queryClient.setQueryData(mutationKey, (context as { previousData: unknown }).previousData)
      }

      options?.onError?.(error, variables, context as TContext)
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          invalidateQueries(queryKey)
        })
      }

      options?.onSuccess?.(data, variables, context as TContext)
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: mutationKey })

      options?.onSettled?.(data, error, variables, context as TContext)
    },
  })
}

/**
 * Create mutation hook for POST requests
 */
export function useCreateMutation<TData, TVariables = unknown>(
  endpoint: string,
  options?: {
    queryKey?: string[]
    invalidateQueries?: string[][]
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
  }
) {
  const queryKey = options?.queryKey || [endpoint]

  return useOptimisticMutation<TData, TVariables>(
    queryKey,
    async (variables) => {
      return apiClient.post<TData>(endpoint, variables)
    },
    {
      invalidateQueries: options?.invalidateQueries || [queryKey],
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  )
}

/**
 * Create mutation hook for PUT requests
 */
export function useUpdateMutation<TData, TVariables = unknown>(
  endpoint: string,
  options?: {
    queryKey?: string[]
    invalidateQueries?: string[][]
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
  }
) {
  const queryKey = options?.queryKey || [endpoint]

  return useOptimisticMutation<TData, TVariables>(
    queryKey,
    async (variables) => {
      return apiClient.put<TData>(endpoint, variables)
    },
    {
      invalidateQueries: options?.invalidateQueries || [queryKey],
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  )
}

/**
 * Create mutation hook for PATCH requests
 */
export function usePatchMutation<TData, TVariables = unknown>(
  endpoint: string,
  options?: {
    queryKey?: string[]
    invalidateQueries?: string[][]
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
  }
) {
  const queryKey = options?.queryKey || [endpoint]

  return useOptimisticMutation<TData, TVariables>(
    queryKey,
    async (variables) => {
      return apiClient.patch<TData>(endpoint, variables)
    },
    {
      invalidateQueries: options?.invalidateQueries || [queryKey],
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  )
}

/**
 * Create mutation hook for DELETE requests
 */
export function useDeleteMutation<TData = void>(
  endpoint: string,
  options?: {
    queryKey?: string[]
    invalidateQueries?: string[][]
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
  }
) {
  const queryKey = options?.queryKey || [endpoint]

  return useOptimisticMutation<TData, void>(
    queryKey,
    async () => {
      return apiClient.delete<TData>(endpoint)
    },
    {
      invalidateQueries: options?.invalidateQueries || [queryKey],
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  )
}

