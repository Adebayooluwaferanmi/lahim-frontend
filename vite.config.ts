import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import fs from 'fs'
import type { Plugin } from 'vite'

// Plugin to transform ~ imports in SCSS files
function scssTildeImporter(): Plugin {
  return {
    name: 'scss-tilde-importer',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.scss') || id.endsWith('.sass')) {
        // Replace ~ with node_modules path
        const rootNodeModules = path.resolve(__dirname, '../../node_modules')
        const localNodeModules = path.resolve(__dirname, 'node_modules')
        
        // Replace ~bootstrap with absolute path
        code = code.replace(
          /@import\s+['"]~([^'"]+)['"]/g,
          (match, importPath) => {
            // Try local node_modules first, then root
            const localPath = path.resolve(localNodeModules, importPath)
            const rootPath = path.resolve(rootNodeModules, importPath)
            
            // Use the path that exists, or default to root
            const resolvedPath = fs.existsSync(localPath) ? localPath : rootPath
            return `@import "${resolvedPath}"`
          }
        )
        return { code, map: null }
      }
      return null
    },
  }
}

// Plugin to handle @lahim/components SCSS subpath imports
function lahimComponentsScss(): Plugin {
  return {
    name: 'lahim-components-scss',
    enforce: 'pre',
    resolveId(id) {
      if (id.startsWith('@lahim/components/') && id.endsWith('.scss')) {
        const subpath = id.replace('@lahim/components/', '')
        const resolvedPath = path.resolve(__dirname, `../components-lahim/dist/${subpath}`)
        if (fs.existsSync(resolvedPath)) {
          return resolvedPath
        }
        const sourcePath = path.resolve(__dirname, `../components-lahim/scss/${path.basename(subpath)}`)
        if (fs.existsSync(sourcePath)) {
          return sourcePath
        }
      }
      return null
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  // Support GitHub Pages base path (repository name)
  // Set via VITE_BASE_PATH environment variable, defaults to '/' for local development
  base: process.env.VITE_BASE_PATH ? `/${process.env.VITE_BASE_PATH}/` : '/',
  plugins: [
    scssTildeImporter(),
    lahimComponentsScss(),
    react(),
    // Node.js polyfills for browser compatibility
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Polyfills to include
      include: ['stream', 'crypto', 'buffer', 'process', 'assert'],
      // Globals to provide
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Override process polyfill to include version
      overrides: {
        process: 'process/browser',
      },
    }),
    // Handle legacy code with undeclared variables (like md5.min.js)
    {
      name: 'legacy-code-handler',
      enforce: 'pre',
      transform(code, id) {
        // Handle legacy minified files that use undeclared variables
        // md5.min.js uses global variables txt and md5 without declaring them
        // Only apply to actual legacy md5.min.js files, not uuid's md5.js
        if (id.includes('md5.min.js') || (id.includes('md5') && id.includes('.min.js') && !id.includes('uuid'))) {
          // The md5 library assigns to txt without declaring it
          // We need to declare it at the top level, not in a function scope
          // Replace assignments to undeclared txt with proper declaration
          const fixedCode = code.replace(
            /txt\s*=/g,
            'var txt ='
          ).replace(
            /^/,
            'var txt, md5;\n'
          )
          return {
            code: fixedCode,
            map: null,
          }
        }
        return null
      },
    } as Plugin,
  ],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      // SCSS subpath must be aliased before the bare module alias
      '@lahim/components/scss': path.resolve(__dirname, '../components-lahim/dist/scss'),
      // Workspace dependency alias
      '@lahim/components': path.resolve(__dirname, '../components-lahim/dist/index.esm'),
      // Path aliases - support baseUrl from tsconfig
      '@': path.resolve(__dirname, './src'),
      // Support imports without @ prefix (baseUrl: "./src")
      // Auto-resolve all top-level src directories
      'scheduling': path.resolve(__dirname, './src/scheduling'),
      'patients': path.resolve(__dirname, './src/patients'),
      'labs': path.resolve(__dirname, './src/labs'),
      'breadcrumbs': path.resolve(__dirname, './src/breadcrumbs'),
      'page-header': path.resolve(__dirname, './src/page-header'),
      'components': path.resolve(__dirname, './src/components'),
      'model': path.resolve(__dirname, './src/model'),
      'clients': path.resolve(__dirname, './src/clients'),
      'dashboard': path.resolve(__dirname, './src/dashboard'),
      'lims': path.resolve(__dirname, './src/lims'),
      'store': path.resolve(__dirname, './src/store'),
      'config': path.resolve(__dirname, './src/config'),
      '~': path.resolve(__dirname, '../../node_modules'),
    },
  },
  define: {
    // Provide global variables and process polyfill
    'process.env': '{}',
    'process.version': '"v20.0.0"', // Provide process.version for PouchDB
    'process.browser': 'true',
    'process.platform': '"browser"',
    global: 'globalThis',
    // Declare global variables for legacy md5.min.js
    'txt': 'window.txt',
    'md5': 'window.md5',
  },
  server: {
    port: 3001,
    host: true,
    open: true,
    watch: {
      // Exclude directories that don't need to be watched to reduce file watcher usage
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
        '**/backups/**',
        '**/.github/**',
        '**/docs/**',
        '**/spec/**',
        '**/grafana/**',
        '**/prometheus/**',
        '**/packages/components/**', // Exclude old components package
        '**/packages/components-lahim/dist/**', // Exclude built components
        '**/*.md', // Exclude markdown files
        '**/yarn-error.log',
        '**/yarn.lock',
      ],
    },
  },
  optimizeDeps: {
    // Pre-bundle dependencies and handle legacy code
    include: ['pouchdb', 'pouchdb-quick-search', 'pouchdb-find', 'pouchdb-adapter-memory'],
    esbuildOptions: {
      // Allow undeclared variables in legacy code
      legalComments: 'none',
      target: 'es2020',
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    commonjsOptions: {
      // Handle CommonJS modules (like PouchDB packages)
      include: [/pouchdb/, /node_modules/],
      transformMixedEsModules: true,
      // Allow undeclared variables in legacy code
      strictRequires: false,
    },
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'state-vendor': ['zustand'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'components-vendor': ['@lahim/components'],
          'pouchdb-vendor': ['pouchdb', 'pouchdb-adapter-memory', 'pouchdb-find', 'pouchdb-quick-search'],
        },
        // Allow legacy code with undeclared variables
        format: 'es',
        strict: false,
      },
      // Handle legacy code that uses undeclared globals
      onwarn(warning, warn) {
        // Suppress warnings about undeclared variables in legacy code
        if (warning.code === 'UNDECLARED_VAR' && warning.id?.includes('md5')) {
          return
        }
        warn(warning)
      },
    },
  },
  // Environment variables
  envPrefix: 'VITE_',
  // CSS preprocessor options
  css: {
    preprocessorOptions: {
      scss: {
        // Resolve node_modules imports (supports ~ prefix)
        // Include both local and root node_modules for monorepo support
        includePaths: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, '../../node_modules'),
        ],
        // Silence deprecation warnings from Bootstrap 4.x
        // These are coming from Bootstrap's SCSS files and will be fixed when upgrading Bootstrap
        silenceDeprecations: [
          'import',           // @import deprecation
          'global-builtin',   // map-merge() global function
          'color-functions', // darken(), lighten() functions
          'slash-div',        // Division operator /
        ],
        // Use legacy API for better compatibility with Bootstrap 4
        api: 'legacy',
        // Suppress warnings from dependencies (Bootstrap)
        quietDeps: true,
      },
    },
  },
})
