import { getApiBaseUrl } from './runtime-config'

export type SyncMode = 'legacy-pouchdb' | 'indexeddb-queue'
export type ConnectivityState = 'online' | 'offline' | 'degraded'

export interface SyncEndpoint {
  remoteDbUrl: string
  apiBaseUrl: string
}

export interface SyncClient {
  mode: SyncMode
  getConnectivityState(): ConnectivityState
  getEndpoint(resource: string): SyncEndpoint
}

export const legacyPouchSyncClient: SyncClient = {
  mode: 'legacy-pouchdb',
  getConnectivityState() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return 'offline'
    }

    return 'online'
  },
  getEndpoint(resource: string) {
    const apiBaseUrl = getApiBaseUrl()

    return {
      apiBaseUrl,
      remoteDbUrl: `${apiBaseUrl}/_db/${resource}`,
    }
  },
}
