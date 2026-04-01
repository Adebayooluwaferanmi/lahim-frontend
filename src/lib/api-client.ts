import { getApiBaseUrl } from './runtime-config'

/**
 * Centralized API Client for optimized real-time read/write operations
 * Features:
 * - Automatic retry logic
 * - Request/Response interceptors
 * - Error handling
 * - TypeScript support
 */

const API_BASE_URL = getApiBaseUrl()

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export class ApiClientError extends Error {
  status?: number
  code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Set default headers (e.g., authentication tokens)
   */
  setDefaultHeaders(headers: HeadersInit): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers }
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new ApiClientError('Request timeout', 408)), timeout)
    })
  }

  /**
   * Handle response errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorDetails: any = null
      
      try {
        const errorData = await response.json()
        // The server returns both 'error' (generic) and 'message' (specific)
        // Always prioritize 'message' as it contains the actual error details
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : String(errorData.error)
        }
        errorDetails = errorData
      } catch {
        // If response is not JSON, use status text
      }

      const apiError = new ApiClientError(errorMessage, response.status)
      // Attach full error details for better error handling
      ;(apiError as any).details = errorDetails
      throw apiError
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T
    }

    return response.json()
  }

  /**
   * Make a request with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = 30000,
      retries = 3,
      headers = {},
      ...fetchOptions
    } = options

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`

    const requestOptions: RequestInit = {
      ...fetchOptions,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
    }

    let lastError: Error

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const fetchPromise = fetch(url, requestOptions)
        const timeoutPromise = this.createTimeout(timeout)

        const response = await Promise.race([fetchPromise, timeoutPromise])
        return await this.handleResponse<T>(response)
      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
        if (error instanceof ApiClientError) {
          if (error.status && error.status >= 400 && error.status < 500) {
            if (error.status !== 408 && error.status !== 429) {
              throw error
            }
          }
        }

        // Exponential backoff
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError!
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances
export default ApiClient
