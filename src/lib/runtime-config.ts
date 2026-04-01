const DEFAULT_API_BASE_URL = 'http://localhost:3000'

const normalizeBaseUrl = (value: string | undefined, fallback: string): string => {
  if (!value) {
    return fallback
  }

  return value.replace(/\/$/, '')
}

export const getApiBaseUrl = (): string =>
  normalizeBaseUrl(
    import.meta.env.VITE_LAHIM_API || import.meta.env.VITE_HOSPITALRUN_API,
    DEFAULT_API_BASE_URL
  )

export const getWebSocketBaseUrl = (): string =>
  normalizeBaseUrl(
    import.meta.env.VITE_WS_URL,
    getApiBaseUrl().replace(/^http/, 'ws')
  )

export const getSocketIOBaseUrl = (): string =>
  normalizeBaseUrl(import.meta.env.VITE_SOCKETIO_URL, getApiBaseUrl())

export { DEFAULT_API_BASE_URL }
