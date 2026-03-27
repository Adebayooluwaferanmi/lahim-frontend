/**
 * Central export point for all optimized React utilities
 */

// API Client
export { apiClient, ApiClientError } from './api-client'
export { default as ApiClient } from './api-client'
export type { ApiError } from './api-client'

// Query Client
export { queryClient, invalidateQueries, setQueryData, prefetchQuery } from './query-client'

// Real-time utilities
export { wsManager, sseManager, useRealtimeSubscription } from './realtime'
export type { RealtimeEvent, RealtimeEventType, RealtimeCallback } from './realtime'

// Mutations
export {
  useOptimisticMutation,
  useCreateMutation,
  useUpdateMutation,
  usePatchMutation,
  useDeleteMutation,
} from './mutations'

// Queries
export { useApiQuery, useApiQueryWithParams, useInfiniteApiQuery } from './queries'

