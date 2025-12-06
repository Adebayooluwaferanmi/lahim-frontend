/**
 * Example component demonstrating real-time subscriptions
 * Shows how to integrate WebSocket/SSE with React Query for live updates
 */

import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRealtimeSubscription, RealtimeEvent } from '../lib/realtime'
import { useLabOrders, LabOrder } from '../hooks/useLabOrders'
import { Alert, Spinner } from '@hospitalrun/components'

/**
 * Example: Real-time Lab Orders List
 * Automatically updates when new orders are created or existing ones are updated
 */
export const RealtimeLabOrdersExample: React.FC = () => {
  const queryClient = useQueryClient()
  const { data: labOrders, isLoading, error } = useLabOrders()

  // Subscribe to real-time updates for lab orders
  useRealtimeSubscription('lab-orders', (event: RealtimeEvent) => {
    console.log('Real-time event received:', event)

    switch (event.type) {
      case 'create':
        // Optimistically add new order to the list
        queryClient.setQueryData(['lab-orders'], (old: LabOrder[] | undefined) => {
          if (!old) return [event.data as LabOrder]
          return old.concat([event.data as LabOrder])
        })
        break

      case 'update':
        // Update existing order in the list
        queryClient.setQueryData(['lab-orders'], (old: LabOrder[] | undefined) => {
          if (!old) return old
          return old.map((order) =>
            order.id === event.id || order._id === event.id ? (event.data as LabOrder) : order
          )
        })
        // Also update the individual order cache
        if (event.id) {
          queryClient.setQueryData(['lab-orders', event.id], event.data as LabOrder)
        }
        break

      case 'delete':
        // Remove order from the list
        queryClient.setQueryData(['lab-orders'], (old: LabOrder[] | undefined) => {
          if (!old) return old
          return old.filter((order) => order.id !== event.id && order._id !== event.id)
        })
        // Remove individual order cache
        if (event.id) {
          queryClient.removeQueries({ queryKey: ['lab-orders', event.id] })
        }
        break

      default:
        // For any other event type, invalidate queries to refetch
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
        message={error.message || 'Failed to load lab orders'}
      />
    )
  }

  return (
    <div>
      <h3>Lab Orders (Real-time Updates)</h3>
      <p className="text-muted">
        This list automatically updates when orders are created, updated, or deleted via WebSocket/SSE
      </p>
      {labOrders && labOrders.length > 0 ? (
        <ul className="list-group">
          {labOrders.map((order) => (
            <li key={order.id || order._id} className="list-group-item">
              <div>
                <strong>Order #{order.orderNumber || order.id}</strong>
                <br />
                Patient: {order.patientName || 'N/A'}
                <br />
                Status: <span className={`badge badge-${getStatusColor(order.status)}`}>{order.status}</span>
                <br />
                Priority: {order.priority || 'routine'}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No lab orders found</p>
      )}
    </div>
  )
}

/**
 * Helper function to get badge color based on status
 */
function getStatusColor(status?: string): string {
  switch (status) {
    case 'completed':
      return 'success'
    case 'processing':
      return 'info'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'secondary'
  }
}

/**
 * Example: Real-time Counter Component
 * Demonstrates basic real-time subscription usage
 */
export const RealtimeCounterExample: React.FC = () => {
  const [count, setCount] = React.useState(0)
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null)

  useRealtimeSubscription('counter', (event: RealtimeEvent) => {
    if (event.data && typeof event.data === 'object' && event.data !== null && 'count' in event.data) {
      setCount((event.data as { count: number }).count)
      setLastUpdate(new Date())
    }
  })

  return (
    <div>
      <h4>Real-time Counter</h4>
      <p>Current count: <strong>{count}</strong></p>
      {lastUpdate && (
        <p className="text-muted small">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}

/**
 * Example: Real-time Status Indicator
 * Shows connection status for real-time subscriptions
 */
export const RealtimeStatusIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = React.useState(false)

  useEffect(() => {
    // Check WebSocket connection status
    const checkConnection = () => {
      // This would need to be implemented based on your WebSocket manager
      // For now, we'll assume connected if the hook is working
      setIsConnected(true)
    }

    checkConnection()
    const interval = setInterval(checkConnection, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="d-flex align-items-center">
      <span
        className={`badge badge-${isConnected ? 'success' : 'danger'} mr-2`}
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          display: 'inline-block',
        }}
      />
      <small className="text-muted">
        {isConnected ? 'Real-time connected' : 'Real-time disconnected'}
      </small>
    </div>
  )
}

export default RealtimeLabOrdersExample

