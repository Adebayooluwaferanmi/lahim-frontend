/**
 * Lab Orders Component with Real-time Updates
 * 
 * Example demonstrating:
 * - Socket.io real-time subscriptions
 * - React Query cache updates
 * - Optimistic updates
 */

import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSocketIOSubscription, useSocketIOStatus } from '../lib/realtime-socketio'
import { apiClient } from '../lib/api-client'
import { Alert, Spinner } from '@hospitalrun/components'

interface LabOrder {
  id: string
  patientId: string
  testCodeLoinc: string
  status: string
  priority?: string
  orderedAt: string
  createdAt: string
  updatedAt: string
}

/**
 * Hook to fetch lab orders
 */
function useLabOrders(params?: { status?: string; patientId?: string }) {
  return useQuery<{ orders: LabOrder[]; count: number; total: number }>({
    queryKey: ['lab-orders', params],
    queryFn: async () => {
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
 * Lab Orders Component with Real-time Updates
 */
export const LabOrdersRealtime: React.FC = () => {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useLabOrders()
  const connectionStatus = useSocketIOStatus()

  // Subscribe to real-time updates
  useSocketIOSubscription('lab-orders', (event) => {
    console.log('Real-time lab order event:', event)

    switch (event.type) {
      case 'create':
        // Optimistically add new order
        queryClient.setQueryData(['lab-orders'], (old: any) => {
          if (!old) return { orders: [event.data], count: 1, total: 1 }
          return {
            ...old,
            orders: [event.data, ...old.orders],
            count: old.count + 1,
            total: old.total + 1,
          }
        })
        break

      case 'update':
        // Update existing order
        queryClient.setQueryData(['lab-orders'], (old: any) => {
          if (!old) return old
          return {
            ...old,
            orders: old.orders.map((order: LabOrder) =>
              order.id === event.id ? { ...order, ...(event.data as Partial<LabOrder>) } : order
            ),
          }
        })
        // Also update individual order cache
        if (event.id) {
          queryClient.setQueryData(['lab-orders', event.id], event.data)
        }
        break

      case 'delete':
        // Remove order from list
        queryClient.setQueryData(['lab-orders'], (old: any) => {
          if (!old) return old
          return {
            ...old,
            orders: old.orders.filter((order: LabOrder) => order.id !== event.id),
            count: old.count - 1,
            total: old.total - 1,
          }
        })
        // Remove individual order cache
        if (event.id) {
          queryClient.removeQueries({ queryKey: ['lab-orders', event.id] })
        }
        break

      default:
        // Invalidate to refetch
        queryClient.invalidateQueries({ queryKey: ['lab-orders'] })
    }
  })

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  if (error) {
    return (
      <Alert
        color="danger"
        title="Error loading lab orders"
        message={error instanceof Error ? error.message : 'Failed to load lab orders'}
      />
    )
  }

  const orders = data?.orders || []

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Lab Orders (Real-time)</h3>
        <div>
          <span
            className={`badge badge-${connectionStatus === 'connected' ? 'success' : 'danger'}`}
          >
            {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </div>

      <p className="text-muted">
        This list updates automatically when orders are created, updated, or deleted
      </p>

      {orders.length > 0 ? (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Patient ID</th>
              <th>Test Code</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Ordered At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.patientId}</td>
                <td>{order.testCodeLoinc}</td>
                <td>
                  <span className={`badge badge-${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.priority || 'routine'}</td>
                <td>{new Date(order.orderedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No lab orders found</p>
      )}

      <div className="mt-3">
        <small className="text-muted">
          Total: {data?.total || 0} orders | Showing: {data?.count || 0}
        </small>
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'in-progress':
    case 'processing':
      return 'info'
    case 'pending':
    case 'requested':
      return 'warning'
    case 'cancelled':
    case 'rejected':
      return 'danger'
    default:
      return 'secondary'
  }
}

export default LabOrdersRealtime

