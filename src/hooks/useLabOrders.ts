import { useApiQueryWithParams, useApiQuery } from '../lib/queries'

export interface LabOrder {
  id?: string
  _id?: string
  orderNumber?: string
  patientId?: string
  patientName?: string
  orderedBy?: string
  orderedDate?: string
  status?: 'pending' | 'collected' | 'received' | 'processing' | 'completed' | 'cancelled'
  priority?: 'routine' | 'urgent' | 'stat'
  tests?: Array<{
    testCode?: string
    testName?: string
    section?: string
  }>
  specimenId?: string
  notes?: string
}

interface UseLabOrdersParams extends Record<string, unknown> {
  status?: string
  priority?: string
  patientId?: string
  search?: string
}

/**
 * Fetch lab orders with optional filters
 * Uses optimized API client with caching and retry logic
 */
export const useLabOrders = (params: UseLabOrdersParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<LabOrder[] | { orders: LabOrder[] }, UseLabOrdersParams>(
    ['lab-orders'],
    '/lab-orders',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { orders: LabOrder[] }).orders || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch a single lab order by ID
 * Uses optimized API client with caching
 */
export const useLabOrder = (id: string | undefined) => {
  return useApiQuery<LabOrder>(
    ['lab-orders', id],
    `/lab-orders/${id}`,
    {
    enabled: !!id,
    }
  )
}

