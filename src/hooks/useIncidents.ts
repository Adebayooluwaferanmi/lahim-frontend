import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '../lib/mutations'
import { Incident } from '../model/Incident'

interface UseIncidentsParams extends Record<string, unknown> {
  status?: string
  severity?: string
  category?: string
  patientId?: string
  visitId?: string
  department?: string
  limit?: number
  skip?: number
}

/**
 * Fetch incidents with optional filters
 */
export const useIncidents = (params: UseIncidentsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Incident[] | { incidents: Incident[] }, UseIncidentsParams>(
    ['incidents'],
    '/incidents',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { incidents: Incident[] }).incidents || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch a single incident by ID
 */
export const useIncidentById = (id: string | undefined) => {
  return useApiQuery<Incident>(
    ['incidents', id],
    `/incidents/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create a new incident
 */
export const useCreateIncident = () => {
  return useCreateMutation<Incident, Partial<Incident>>(
    '/incidents',
    {
      queryKey: ['incidents'],
      invalidateQueries: [['incidents']],
    }
  )
}

/**
 * Update an existing incident
 */
export const useUpdateIncident = (id: string) => {
  return useUpdateMutation<Incident, Partial<Incident>>(
    `/incidents/${id}`,
    {
      queryKey: ['incidents', id],
      invalidateQueries: [['incidents'], ['incidents', id]],
    }
  )
}

/**
 * Delete an incident (soft delete)
 */
export const useDeleteIncident = () => {
  return useDeleteMutation<{ message: string }>(
    '/incidents',
    {
      queryKey: ['incidents'],
      invalidateQueries: [['incidents']],
    }
  )
}

/**
 * Start investigation on an incident
 */
export const useStartInvestigation = (id: string) => {
  return useCreateMutation<{ success: boolean }, { investigatedBy?: string; investigationNotes?: string }>(
    `/incidents/${id}/start-investigation`,
    {
      queryKey: ['incidents', id],
      invalidateQueries: [['incidents'], ['incidents', id]],
    }
  )
}

/**
 * Resolve an incident
 */
export const useResolveIncident = (id: string) => {
  return useCreateMutation<{ success: boolean }, { 
    resolvedBy?: string
    resolution?: string
    correctiveActions?: string[]
    preventiveActions?: string[]
  }>(
    `/incidents/${id}/resolve`,
    {
      queryKey: ['incidents', id],
      invalidateQueries: [['incidents'], ['incidents', id]],
    }
  )
}

