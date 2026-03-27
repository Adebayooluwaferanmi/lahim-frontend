import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useApiQuery } from '../lib/queries'
import { apiClient } from '../lib/api-client'

export interface LabResult {
  id?: string
  _id?: string
  patientId?: string
  orderId?: string
  testCode?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>
    text?: string
  }
  resultType?: 'numeric' | 'categorical' | 'text' | 'microbiology'
  value?: any
  unit?: string
  status?: 'preliminary' | 'final' | 'corrected' | 'cancelled'
  performerId?: string
  performedOn?: string
  verifiedBy?: string
  verifiedOn?: string
  specimenId?: string
  criticalValue?: boolean
  criticalValueNotified?: boolean
}

interface UseLabResultsParams extends Record<string, unknown> {
  orderId?: string
  patientId?: string
  status?: string
  testCode?: string
}

/**
 * Fetch lab results with optional filters
 */
export const useLabResults = (params: UseLabResultsParams = {}) => {
  return useApiQuery<LabResult[] | { results: LabResult[] }, UseLabResultsParams>(
    ['lab-results'],
    '/lims/results',
    params
  )
}

/**
 * Fetch a single lab result by ID
 */
export const useLabResult = (id: string | undefined) => {
  return useApiQuery<LabResult>(
    ['lab-results', id],
    `/lims/results/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create lab result mutation hook
 */
export const useCreateLabResult = () => {
  const queryClient = useQueryClient()

  return useMutation<LabResult, Error, Partial<LabResult>>({
    mutationFn: async (data) => {
      return apiClient.post<LabResult>('/lims/results', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-results'] })
      queryClient.invalidateQueries({ queryKey: ['worklists'] })
    },
  })
}

/**
 * Update lab result mutation hook
 */
export const useUpdateLabResult = () => {
  const queryClient = useQueryClient()

  return useMutation<LabResult, Error, { id: string; updates: Partial<LabResult> }>({
    mutationFn: async ({ id, updates }) => {
      return apiClient.put<LabResult>(`/lims/results/${id}`, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lab-results', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['lab-results'] })
      queryClient.invalidateQueries({ queryKey: ['worklists'] })
    },
  })
}

