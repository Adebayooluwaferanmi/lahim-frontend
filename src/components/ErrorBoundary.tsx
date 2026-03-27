/**
 * Error Boundary component for graceful error handling
 * Catches React errors and displays user-friendly error messages
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert } from '@lahim/components'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="container mt-5">
          <Alert
            color="danger"
            title="Something went wrong"
            message={
              <div>
                <p>
                  {this.state.error?.message ||
                    'An unexpected error occurred. Please try refreshing the page.'}
                </p>
                <button
                  className="btn btn-primary mt-3"
                  onClick={this.handleReset}
                  type="button"
                >
                  Try Again
                </button>
              </div>
            }
          />
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

