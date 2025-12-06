/**
 * Vitest setup file
 * Configures testing environment and global mocks
 */

import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables for tests
// Vitest uses import.meta.env, but we also set process.env for compatibility
if (typeof import.meta !== 'undefined') {
  // @ts-ignore - Vitest allows setting import.meta.env
  import.meta.env = {
    ...import.meta.env,
    VITE_HOSPITALRUN_API: 'http://localhost:3000',
    VITE_SOCKETIO_URL: 'http://localhost:3000',
  }
}
// @ts-ignore - Allow setting process.env in test environment
if (typeof process !== 'undefined') {
  process.env.REACT_APP_HOSPITALRUN_API = 'http://localhost:3000'
  process.env.REACT_APP_SOCKETIO_URL = 'http://localhost:3000'
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

