import { useApiQuery } from '../lib/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api-client'

export interface Instrument {
  id?: string
  _id?: string
  name?: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  section?: string
  status?: 'active' | 'maintenance' | 'calibration' | 'inactive'
  lastCalibration?: string
  nextCalibration?: string
  location?: string
}

/**
 * Fetch all instruments
 * Uses optimized API client with caching and retry logic
 */
export const useInstruments = () => {
  const { data, ...rest } = useApiQuery<Instrument[] | { instruments: Instrument[] }>(
    ['instruments'],
    '/instruments'
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { instruments: Instrument[] }).instruments || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch a single instrument by ID
 * Uses optimized API client with caching
 */
export const useInstrument = (id: string | undefined) => {
  return useApiQuery<Instrument>(
    ['instruments', id],
    `/instruments/${id}`,
    {
    enabled: !!id,
    }
  )
}

/**
 * Import instrument results mutation hook
 */
export const useImportInstrumentResults = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { imported: number; errors: any[] },
    Error,
    { id: string; results: any[]; format?: 'json' | 'hl7' | 'astm' }
  >({
    mutationFn: async ({ id, results, format = 'json' }) => {
      return apiClient.post<{ imported: number; errors: any[] }>(`/instruments/${id}/import-results`, {
        results,
        format,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instruments'] })
      queryClient.invalidateQueries({ queryKey: ['lab-results'] })
      queryClient.invalidateQueries({ queryKey: ['worklists'] })
    },
  })
}

