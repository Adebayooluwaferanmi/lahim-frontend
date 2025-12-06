/**
 * Real-time Integration Example
 * Demonstrates how to integrate WebSocket/SSE with React Query for live updates
 * 
 * Usage:
 * 1. Wrap your component with RealtimeProvider
 * 2. Use useRealtimeQuery hook instead of regular useQuery
 * 3. Data will automatically update when real-time events are received
 */

import React, { useEffect } from 'react'
import { useQuery, useQueryClient, UseQueryOptions, QueryKey } from '@tanstack/react-query'
import { useRealtimeSubscription, RealtimeEvent } from './realtime'

interface RealtimeQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  resource: string
  queryKey: QueryKey
  queryFn: () => Promise<TData>
  enabled?: boolean
}

/**
 * Enhanced query hook with real-time updates
 * Automatically subscribes to real-time events and updates cache
 */
export function useRealtimeQuery<TData>({
  resource,
  queryKey,
  queryFn,
  enabled = true,
  ...queryOptions
}: RealtimeQueryOptions<TData>) {
  const queryClient = useQueryClient()

  // Regular query
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    ...queryOptions,
  })

  // Subscribe to real-time updates
  useRealtimeSubscription(
    resource,
    (event: RealtimeEvent) => {
      if (!enabled) return

      switch (event.type) {
        case 'create':
          // Add new item to list
          queryClient.setQueryData<TData[]>(queryKey, (old) => {
            if (!old) return [event.data as TData]
            return Array.isArray(old) ? old.concat([event.data as TData]) : old
          })
          break

        case 'update':
          // Update existing item
          if (event.id) {
            // Update in list
            queryClient.setQueryData<TData[]>(queryKey, (old) => {
              if (!old || !Array.isArray(old)) return old
              return old.map((item: any) =>
                (item.id === event.id || item._id === event.id) ? (event.data as TData) : item
              )
            })
            // Update individual item cache
            queryClient.setQueryData(queryKey.concat([event.id]), event.data as TData)
          } else {
            // If no ID, invalidate to refetch
            queryClient.invalidateQueries({ queryKey })
          }
          break

        case 'delete':
          // Remove item from list
          if (event.id) {
            queryClient.setQueryData<TData[]>(queryKey, (old) => {
              if (!old || !Array.isArray(old)) return old
              return old.filter((item: any) => item.id !== event.id && item._id !== event.id)
            })
            // Remove individual item cache
            queryClient.removeQueries({ queryKey: queryKey.concat([event.id]) })
          } else {
            queryClient.invalidateQueries({ queryKey })
          }
          break

        case 'patch':
          // Partial update - invalidate to refetch
          queryClient.invalidateQueries({ queryKey })
          break

        default:
          // Unknown event type - invalidate to be safe
          queryClient.invalidateQueries({ queryKey })
      }
    },
    true // Use WebSocket
  )

  return query
}

/**
 * Real-time Provider Component
 * Initializes WebSocket/SSE connections
 * Wrap your app or specific sections with this
 */
export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialize WebSocket connection
    // The wsManager will automatically connect when subscriptions are made
    // Optional: Connect immediately
    // const { wsManager } = require('./realtime')
    // wsManager.connect()

    return () => {
      // Cleanup on unmount (optional - connections are managed per subscription)
    }
  }, [])

  return <>{children}</>
}

/**
 * Example: Real-time Lab Orders Hook
 */
export function useRealtimeLabOrders(params?: { status?: string; priority?: string }) {
  return useRealtimeQuery({
    resource: 'lab-orders',
    queryKey: ['lab-orders', params],
    queryFn: async () => {
      const { apiClient } = await import('./api-client')
      const queryParams = params
        ? new URLSearchParams(
            Object.entries(params).reduce(
              (acc, [key, value]) => {
                if (value) acc[key] = String(value)
                return acc
              },
              {} as Record<string, string>
            )
          ).toString()
        : ''
      const url = `/lab-orders${queryParams ? `?${queryParams}` : ''}`
      return apiClient.get(url)
    },
  })
}

/**
 * Example: Real-time Specimens Hook
 */
export function useRealtimeSpecimens(params?: { status?: string; specimenType?: string }) {
  return useRealtimeQuery({
    resource: 'specimens',
    queryKey: ['specimens', params],
    queryFn: async () => {
      const { apiClient } = await import('./api-client')
      const queryParams = params
        ? new URLSearchParams(
            Object.entries(params).reduce(
              (acc, [key, value]) => {
                if (value) acc[key] = String(value)
                return acc
              },
              {} as Record<string, string>
            )
          ).toString()
        : ''
      const url = `/specimens${queryParams ? `?${queryParams}` : ''}`
      return apiClient.get(url)
    },
  })
}

/**
 * Usage Example Component
 */
export const RealtimeLabOrdersExample: React.FC = () => {
  const { data: labOrders, isLoading, error } = useRealtimeLabOrders({ status: 'pending' })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const ordersArray = Array.isArray(labOrders) ? labOrders : []

  return (
    <div>
      <h3>Lab Orders (Real-time)</h3>
      <p>This list updates automatically when orders are created, updated, or deleted</p>
      <ul>
        {ordersArray.map((order: any) => (
          <li key={order.id || order._id}>
            Order #{order.orderNumber} - {order.patientName} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RealtimeProvider

