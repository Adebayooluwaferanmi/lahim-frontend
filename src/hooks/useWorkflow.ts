import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiQuery } from '../lib/queries'
import { apiClient } from '../lib/api-client'

export interface WorkflowTimeline {
  orderId: string
  currentStatus: string
  currentStage: string
  timeline: Array<{
    stage: string
    event: string
    timestamp: string
    status: string
    description: string
    data: any
  }>
  summary: {
    preAnalytical: number
    analytical: number
    postAnalytical: number
  }
}

export interface WorkflowDashboard {
  preAnalytical: Record<string, number>
  analytical: Record<string, number>
  postAnalytical: Record<string, number>
  totals: Record<string, number>
}

/**
 * Get workflow timeline for an order
 */
export const useWorkflowTimeline = (orderId: string | undefined) => {
  return useApiQuery<WorkflowTimeline>(
    ['workflow', 'timeline', orderId],
    `/workflow/order/${orderId}/timeline`,
    {},
    {
      enabled: !!orderId,
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    }
  )
}

/**
 * Get workflow dashboard
 */
export const useWorkflowDashboard = () => {
  return useApiQuery<WorkflowDashboard>(
    ['workflow', 'dashboard'],
    '/workflow/dashboard',
    {},
    {
      refetchInterval: 60000, // Refetch every minute
    }
  )
}

/**
 * Advance order to next stage
 */
export const useAdvanceOrder = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { orderId: string; previousStatus: string; newStatus: string },
    Error,
    { orderId: string; targetStatus?: string; performedBy: string; notes?: string }
  >({
    mutationFn: async ({ orderId, targetStatus, performedBy, notes }) => {
      return apiClient.post<{ orderId: string; previousStatus: string; newStatus: string }>(
        `/workflow/order/${orderId}/advance`,
        { targetStatus, performedBy, notes }
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow', 'timeline', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: ['workflow', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['lab-orders', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] })
    },
  })
}


