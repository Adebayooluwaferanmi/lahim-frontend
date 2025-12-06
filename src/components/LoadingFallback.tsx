/**
 * Loading fallback component for Suspense boundaries
 * Provides consistent loading states across the app
 */

import React from 'react'
import { Spinner } from '@hospitalrun/components'

interface LoadingFallbackProps {
  message?: string
  size?: [number, number]
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  size = [10, 25],
}) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '200px' }}>
      <Spinner color="blue" loading size={size} type="ScaleLoader" />
      {message && <p className="mt-3 text-muted">{message}</p>}
    </div>
  )
}

export default LoadingFallback

