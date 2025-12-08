import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useApiQuery } from '../lib/queries'
import { apiClient } from '../lib/api-client'

export interface SpecimenTransport {
  id?: string
  _id?: string
  specimenId: string
  orderId: string
  transportType: 'internal' | 'external' | 'courier'
  origin: string
  destination: string
  carrier?: string
  trackingNumber?: string
  status: 'scheduled' | 'in-transit' | 'delivered' | 'failed' | 'cancelled'
  temperature?: number
  scheduledAt: string
  pickedUpAt?: string
  deliveredAt?: string
  cost?: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface UseSpecimenTransportsParams extends Record<string, unknown> {
  status?: string
  transportType?: string
  specimenId?: string
  orderId?: string
  limit?: number
  skip?: number
}

/**
 * Fetch specimen transports with optional filters
 */
export const useSpecimenTransports = (params: UseSpecimenTransportsParams = {}) => {
  return useApiQuery<{ transports: SpecimenTransport[]; count: number }, UseSpecimenTransportsParams>(
    ['specimen-transport'],
    '/specimen-transport',
    params
  )
}

/**
 * Fetch a single specimen transport by ID
 */
export const useSpecimenTransport = (id: string | undefined) => {
  return useApiQuery<SpecimenTransport>(
    ['specimen-transport', id],
    `/specimen-transport/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Get current status of a specimen transport
 */
export const useSpecimenTransportStatus = (id: string | undefined) => {
  return useApiQuery<{
    id: string
    status: string
    location?: string
    temperature?: number
    pickedUpAt?: string
    deliveredAt?: string
    lastUpdated?: string
  }>(
    ['specimen-transport', id, 'status'],
    `/specimen-transport/${id}/status`,
    {
      enabled: !!id,
      refetchInterval: 30000, // Refetch every 30 seconds for active transports
    }
  )
}

/**
 * Create specimen transport mutation hook
 */
export const useCreateSpecimenTransport = () => {
  const queryClient = useQueryClient()

  return useMutation<SpecimenTransport, Error, Partial<SpecimenTransport>>({
    mutationFn: async (data) => {
      return apiClient.post<SpecimenTransport>('/specimen-transport', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specimen-transport'] })
    },
  })
}

/**
 * Update specimen transport mutation hook
 */
export const useUpdateSpecimenTransport = () => {
  const queryClient = useQueryClient()

  return useMutation<SpecimenTransport, Error, { id: string; updates: Partial<SpecimenTransport> }>({
    mutationFn: async ({ id, updates }) => {
      return apiClient.put<SpecimenTransport>(`/specimen-transport/${id}`, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specimen-transport', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['specimen-transport'] })
    },
  })
}

/**
 * Track specimen transport mutation hook (add tracking event)
 */
export const useTrackSpecimenTransport = () => {
  const queryClient = useQueryClient()

  return useMutation<
    SpecimenTransport,
    Error,
    { id: string; status?: string; location?: string; temperature?: number; notes?: string }
  >({
    mutationFn: async ({ id, ...trackingData }) => {
      return apiClient.post<SpecimenTransport>(`/specimen-transport/${id}/track`, trackingData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specimen-transport', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['specimen-transport', variables.id, 'status'] })
      queryClient.invalidateQueries({ queryKey: ['specimen-transport'] })
    },
  })
}

