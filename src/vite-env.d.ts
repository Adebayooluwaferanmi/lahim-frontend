/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LAHIM_API?: string
  readonly VITE_HOSPITALRUN_API?: string
  readonly VITE_SOCKETIO_URL?: string
  readonly VITE_WS_URL?: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
