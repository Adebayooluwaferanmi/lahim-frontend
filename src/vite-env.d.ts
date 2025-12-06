/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOSPITALRUN_API: string
  readonly VITE_SOCKETIO_URL: string
  readonly VITE_WS_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// For backward compatibility with process.env
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly REACT_APP_HOSPITALRUN_API?: string
    readonly REACT_APP_SOCKETIO_URL?: string
    readonly REACT_APP_WS_URL?: string
  }
}

