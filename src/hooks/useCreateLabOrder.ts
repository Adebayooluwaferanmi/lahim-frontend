import { useCreateMutation } from '../lib/mutations'
import { LabOrder } from './useLabOrders'

export interface CreateLabOrderData {
  patientId: string
  patientName?: string
  orderedBy?: string
  priority?: 'routine' | 'urgent' | 'stat'
  tests: Array<{
    testCode: string
    testName: string
    section?: string
  }>
  notes?: string
}

/**
 * Create a new lab order with optimistic updates
 * Uses optimized mutation hook with automatic cache invalidation
 */
export const useCreateLabOrder = () => {
  return useCreateMutation<LabOrder, CreateLabOrderData>('/lab-orders', {
    queryKey: ['lab-orders'],
    invalidateQueries: [['lab-orders']],
  })
}

