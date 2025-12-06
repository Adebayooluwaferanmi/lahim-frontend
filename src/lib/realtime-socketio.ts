/**
 * Enhanced Real-time Communication with Socket.io
 * Provides better features than native WebSocket:
 * - Automatic reconnection
 * - Room/namespace support
 * - Broadcasting
 * - Acknowledgment system
 * - Binary support
 * - HTTP long-polling fallback
 */

import { io, Socket } from 'socket.io-client'
import React from 'react'
import { RealtimeEvent, RealtimeCallback } from './realtime'

/**
 * Socket.io connection manager
 */
class SocketIOManager {
  private socket: Socket | null = null
  private url: string
  private listeners: Map<string, Set<RealtimeCallback>> = new Map()
  private isConnecting = false
  private maxReconnectAttempts = 10

  constructor(url: string) {
    this.url = url
  }

  /**
   * Connect to Socket.io server
   */
  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      return
    }

    this.isConnecting = true

    try {
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      })

      this.socket.on('connect', () => {
        this.isConnecting = false
        console.log('[Socket.io] Connected')
      })

      this.socket.on('disconnect', (reason) => {
        this.isConnecting = false
        console.log('[Socket.io] Disconnected:', reason)
      })

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`[Socket.io] Reconnected after ${attemptNumber} attempts`)
      })

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`[Socket.io] Reconnection attempt ${attemptNumber}`)
      })

      this.socket.on('reconnect_failed', () => {
        console.error('[Socket.io] Reconnection failed after max attempts')
      })

      this.socket.on('error', (error) => {
        console.error('[Socket.io] Error:', error)
      })

      // Listen for real-time events
      this.socket.on('realtime:event', (event: RealtimeEvent) => {
        this.notifyListeners(event)
      })

      // Listen for resource-specific events
      this.socket.onAny((eventName, ...args) => {
        if (eventName.startsWith('realtime:')) {
          const resource = eventName.replace('realtime:', '')
          const event: RealtimeEvent = {
            type: 'update',
            resource,
            data: args[0],
            timestamp: Date.now(),
          }
          this.notifyListeners(event)
        }
      })
    } catch (error) {
      console.error('[Socket.io] Connection failed:', error)
      this.isConnecting = false
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
    if (!this.socket?.connected) {
      this.connect()
    }

    // Join resource room for targeted events
    if (this.socket?.connected) {
      this.socket.emit('subscribe', resource)
    } else {
      this.socket?.once('connect', () => {
        this.socket?.emit('subscribe', resource)
      })
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(resource)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(resource)
          // Leave resource room
          if (this.socket?.connected) {
            this.socket.emit('unsubscribe', resource)
          }
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
          console.error('[Socket.io] Callback error:', error)
        }
      })
    }
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data: any, callback?: (response: any) => void): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data, callback)
    } else {
      console.warn('[Socket.io] Cannot emit: not connected')
    }
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.listeners.clear()
  }

  /**
   * Check if Socket.io is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Get connection status
   */
  getStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (this.socket?.connected) return 'connected'
    if (this.isConnecting) return 'connecting'
    return 'disconnected'
  }
}

// Get Socket.io URL from environment or construct from API URL
const getSocketIOUrl = (): string => {
  // Support both Vite (import.meta.env) and legacy (process.env) for compatibility
  const apiUrl = import.meta.env.VITE_HOSPITALRUN_API || 
                 (typeof process !== 'undefined' && process.env?.REACT_APP_HOSPITALRUN_API) || 
                 'http://localhost:3000'
  const wsUrl = import.meta.env.VITE_SOCKETIO_URL || 
                (typeof process !== 'undefined' && process.env?.REACT_APP_SOCKETIO_URL) || 
                apiUrl
  return wsUrl
}

// Export singleton instance
export const socketIOManager = new SocketIOManager(getSocketIOUrl())

/**
 * React hook for Socket.io real-time subscriptions
 * Automatically subscribes/unsubscribes on mount/unmount
 */
export const useSocketIOSubscription = (
  resource: string,
  callback: RealtimeCallback
) => {
  React.useEffect(() => {
    const unsubscribe = socketIOManager.subscribe(resource, callback)
    return unsubscribe
  }, [resource, callback])
}

/**
 * React hook to get Socket.io connection status
 */
export const useSocketIOStatus = () => {
  const [status, setStatus] = React.useState<'connected' | 'disconnected' | 'connecting'>(
    socketIOManager.getStatus()
  )

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(socketIOManager.getStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return status
}

