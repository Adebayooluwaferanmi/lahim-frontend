import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'

export interface Specimen {
  id?: string
  _id?: string
  accessionNumber?: string
  specimenType?: string
  collectionDate?: string
  receivedDate?: string
  status?: 'pending' | 'collected' | 'received' | 'processing' | 'completed'
  labOrderId?: string
  patientId?: string
  patientName?: string
  storageLocation?: string
  chainOfCustody?: Array<{
    timestamp: string
    action: string
    performedBy: string
  }>
}

interface UseSpecimensParams extends Record<string, unknown> {
  status?: string
  specimenType?: string
  search?: string
}

/**
 * Fetch specimens with optional filters
 * Uses optimized API client with caching and retry logic
 */
export const useSpecimens = (params: UseSpecimensParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Specimen[] | { specimens: Specimen[] }, UseSpecimensParams>(
    ['specimens'],
    '/specimens',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { specimens: Specimen[] }).specimens || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch a single specimen by ID
 * Uses optimized API client with caching
 */
export const useSpecimen = (id: string | undefined) => {
  return useApiQuery<Specimen>(
    ['specimens', id],
    `/specimens/${id}`,
    {
    enabled: !!id,
    }
  )
}

/**
 * Update specimen mutation hook
 */
export const useUpdateSpecimen = () => {
  const queryClient = useQueryClient()

  return useMutation<Specimen, Error, { id: string; updates: Partial<Specimen> }>({
    mutationFn: async ({ id, updates }) => {
      return apiClient.put<Specimen>(`/specimens/${id}`, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specimens', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['specimens'] })
    },
  })
}

