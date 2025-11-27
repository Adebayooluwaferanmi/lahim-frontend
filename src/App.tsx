import React, { Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Spinner } from '@hospitalrun/components'
import HospitalRun from './HospitalRun'

import store from './store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const App: React.FC = () => (
  <div>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />}>
          <BrowserRouter>
            <HospitalRun />
          </BrowserRouter>
        </Suspense>
      </QueryClientProvider>
    </Provider>
  </div>
)

export default App
