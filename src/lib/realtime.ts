/**
 * Real-time subscription utilities for WebSocket and Server-Sent Events
 * Provides efficient real-time data synchronization
 */

import React from 'react'

export type RealtimeEventType = 'create' | 'update' | 'delete' | 'patch'

export interface RealtimeEvent<T = unknown> {
  type: RealtimeEventType
  resource: string
  id?: string
  data?: T
  timestamp: number
}

export type RealtimeCallback<T = unknown> = (event: RealtimeEvent<T>) => void | Promise<void>

/**
 * WebSocket connection manager for real-time updates
 */
class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private listeners: Map<string, Set<RealtimeCallback>> = new Map()
  private isConnecting = false

  constructor(url: string) {
    this.url = url
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    this.isConnecting = true

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
        console.log('[WebSocket] Connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data)
          this.notifyListeners(data)
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        this.isConnecting = false
      }

      this.ws.onclose = () => {
        this.isConnecting = false
        this.reconnect()
      }
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error)
      this.isConnecting = false
      this.reconnect()
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    )

    setTimeout(() => {
      console.log(`[WebSocket] Reconnecting (attempt ${this.reconnectAttempts})...`)
      this.connect()
    }, delay)
  }

  /**
   * Subscribe to real-time events for a resource
   */
  subscribe(resource: string, callback: RealtimeCallback): () => void {
    if (!this.listeners.has(resource)) {
      this.listeners.set(resource, new Set())
    }

    this.listeners.get(resource)!.add(callback)

    // Connect if not already connected
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.connect()
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(resource)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(resource)
        }
      }
    }
  }

  /**
   * Notify all listeners for a resource
   */
  private notifyListeners(event: RealtimeEvent): void {
    const callbacks = this.listeners.get(event.resource)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event)
        } catch (error) {
          console.error('[WebSocket] Callback error:', error)
        }
      })
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

/**
 * Server-Sent Events manager for real-time updates
 */
class SSEManager {
  private eventSource: EventSource | null = null
  private url: string
  private listeners: Map<string, Set<RealtimeCallback>> = new Map()

  constructor(url: string) {
    this.url = url
  }

  /**
   * Connect to SSE endpoint
   */
  connect(): void {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      return
    }

    try {
      this.eventSource = new EventSource(this.url)

      this.eventSource.onopen = () => {
        console.log('[SSE] Connected')
      }

      this.eventSource.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data)
          this.notifyListeners(data)
        } catch (error) {
          console.error('[SSE] Failed to parse message:', error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Error:', error)
        // EventSource automatically reconnects
      }
    } catch (error) {
      console.error('[SSE] Connection failed:', error)
    }
  }

  /**
   * Subscribe to real-time events for a resource
   */
  subscribe(resource: string, callback: RealtimeCallback): () => void {
    if (!this.listeners.has(resource)) {
      this.listeners.set(resource, new Set())
    }

    this.listeners.get(resource)!.add(callback)

    // Connect if not already connected
    if (this.eventSource?.readyState !== EventSource.OPEN) {
      this.connect()
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(resource)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(resource)
        }
      }
    }
  }

  /**
   * Notify all listeners for a resource
   */
  private notifyListeners(event: RealtimeEvent): void {
    const callbacks = this.listeners.get(event.resource)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event)
        } catch (error) {
          console.error('[SSE] Callback error:', error)
        }
      })
    }
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.listeners.clear()
  }
}

// Get WebSocket URL from environment or construct from API URL
const getWebSocketUrl = (): string => {
  // Support both Vite (import.meta.env) and legacy (process.env) for compatibility
  const apiUrl = import.meta.env.VITE_HOSPITALRUN_API || 
                 (typeof process !== 'undefined' && process.env?.REACT_APP_HOSPITALRUN_API) || 
                 'http://localhost:3000'
  const wsUrl = import.meta.env.VITE_WS_URL || 
                (typeof process !== 'undefined' && process.env?.REACT_APP_WS_URL) || 
                apiUrl.replace(/^http/, 'ws')
  return `${wsUrl}/realtime`
}

// Get SSE URL from environment or construct from API URL
const getSSEUrl = (): string => {
  // Support both Vite (import.meta.env) and legacy (process.env) for compatibility
  const apiUrl = import.meta.env.VITE_HOSPITALRUN_API || 
                 (typeof process !== 'undefined' && process.env?.REACT_APP_HOSPITALRUN_API) || 
                 'http://localhost:3000'
  return `${apiUrl}/realtime/sse`
}

// Export singleton instances
export const wsManager = new WebSocketManager(getWebSocketUrl())
export const sseManager = new SSEManager(getSSEUrl())

/**
 * React hook for real-time subscriptions
 * Automatically subscribes/unsubscribes on mount/unmount
 */
export const useRealtimeSubscription = (
  resource: string,
  callback: RealtimeCallback,
  useWebSocket: boolean = true
) => {
  const manager = useWebSocket ? wsManager : sseManager

  React.useEffect(() => {
    const unsubscribe = manager.subscribe(resource, callback)
    return unsubscribe
  }, [resource, callback, manager])
}

