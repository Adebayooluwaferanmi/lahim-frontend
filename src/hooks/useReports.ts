import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation } from '../lib/mutations'

export interface Report {
  id?: string
  _id?: string
  reportNumber?: string
  patientId?: string
  patientName?: string
  reportDate?: string
  status?: 'draft' | 'final' | 'signed' | 'delivered' | 'cancelled'
  signedBy?: string
  signedDate?: string
  deliveredBy?: string
  deliveredDate?: string
  deliveryMethod?: string
  results?: any[]
}

interface UseReportsParams extends Record<string, unknown> {
  status?: string
  patientId?: string
  dateFrom?: string
  dateTo?: string
}

/**
 * Fetch reports with optional filters
 * Uses optimized API client with caching and retry logic
 */
export const useReports = (params: UseReportsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Report[] | { reports: Report[] }, UseReportsParams>(
    ['reports'],
    '/reports',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { reports: Report[] }).reports || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch a single report by ID
 * Uses optimized API client with caching
 */
export const useReport = (id: string | undefined) => {
  return useApiQuery<Report>(
    ['reports', id],
    `/reports/${id}`,
    {
    enabled: !!id,
    }
  )
}

/**
 * Generate a new report with optimistic updates
 */
export const useGenerateReport = () => {
  return useCreateMutation<Report, { patientId: string; resultIds?: string[]; format?: string }>(
    '/reports/generate',
    {
      queryKey: ['reports'],
      invalidateQueries: [['reports']],
    }
  )
}

/**
 * Sign a report with optimistic updates
 * Note: This uses a custom mutation since it's a POST to a sub-endpoint
 */
export const useSignReport = () => {
  const queryClient = useQueryClient()
  return useMutation<Report, Error, { id: string; signedBy: string }>({
    mutationFn: async ({ id, signedBy }) => {
      const { apiClient } = await import('../lib/api-client')
      return apiClient.post<Report>(`/reports/${id}/sign`, { signedBy })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

/**
 * Deliver a report with optimistic updates
 * Note: This uses a custom mutation since it's a POST to a sub-endpoint
 */
export const useDeliverReport = () => {
  const queryClient = useQueryClient()
  return useMutation<
    { report: Report; deliveries: any[] },
    Error,
    { id: string; methods: ('email' | 'portal' | 'print' | 'api' | 'hl7')[]; emailAddress?: string; recipientName?: string }
  >({
    mutationFn: async ({ id, methods, emailAddress, recipientName }) => {
      const { apiClient } = await import('../lib/api-client')
      return apiClient.post<{ report: Report; deliveries: any[] }>(`/reports/${id}/deliver`, {
        methods,
        emailAddress,
        recipientName,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

