import React, { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './lib/query-client'
import LoadingFallback from './components/LoadingFallback'
import ErrorBoundary from './components/ErrorBoundary'
import LaHIM from './LaHIM'

const App: React.FC = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingFallback />}>
        <BrowserRouter>
          <LaHIM />
        </BrowserRouter>
      </Suspense>
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </ErrorBoundary>
)

export default App
