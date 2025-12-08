import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '../lib/mutations'
import { Report, AnalyticsReport } from '../model/Report'

interface UseReportsParams extends Record<string, unknown> {
  patientId?: string
  status?: string
  reportType?: string
  startDate?: string
  endDate?: string
  limit?: number
  skip?: number
}

/**
 * Fetch reports with optional filters
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
 */
export const useReportById = (id: string | undefined) => {
  return useApiQuery<Report>(
    ['reports', id],
    `/reports/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create a new report
 */
export const useCreateReport = () => {
  return useCreateMutation<Report, Partial<Report>>(
    '/reports',
    {
      queryKey: ['reports'],
      invalidateQueries: [['reports']],
    }
  )
}

/**
 * Update an existing report
 */
export const useUpdateReport = (id: string) => {
  return useUpdateMutation<Report, Partial<Report>>(
    `/reports/${id}`,
    {
      queryKey: ['reports', id],
      invalidateQueries: [['reports'], ['reports', id]],
    }
  )
}

/**
 * Delete a report
 */
export const useDeleteReport = () => {
  return useDeleteMutation<{ message: string }>(
    '/reports',
    {
      queryKey: ['reports'],
      invalidateQueries: [['reports']],
    }
  )
}

/**
 * Deliver a report
 */
export const useDeliverReport = (id: string) => {
  return useCreateMutation<{ report: Report; deliveries: any[] }, { 
    methods: ('email' | 'portal' | 'print' | 'api' | 'hl7')[]
    emailAddress?: string
    recipientName?: string
  }>(
    `/reports/${id}/deliver`,
    {
      queryKey: ['reports', id],
      invalidateQueries: [['reports'], ['reports', id]],
    }
  )
}

/**
 * Get analytics data
 */
export const useAnalytics = (params: { startDate?: string; endDate?: string; reportType?: string } = {}) => {
  return useApiQueryWithParams<AnalyticsReport, typeof params>(
    ['reports', 'analytics'],
    '/reports/analytics',
    params
  )
}

/**
 * Alias for useReportById (for LIMS report components)
 */
export const useReport = useReportById

/**
 * Alias for useCreateReport (for LIMS report components)
 */
export const useGenerateReport = useCreateReport
