import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    // Node.js polyfills for tests
    nodePolyfills({
      protocolImports: true,
      include: ['stream', 'crypto', 'buffer', 'process', 'assert'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
})

