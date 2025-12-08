import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '../lib/mutations'
import Visit from '../model/Visit'

interface UseVisitsParams extends Record<string, unknown> {
  status?: string
  patientId?: string
  visitType?: string
  startDate?: string
  endDate?: string
  limit?: number
  skip?: number
}

/**
 * Fetch visits with optional filters
 */
export const useVisits = (params: UseVisitsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Visit[] | { visits: Visit[] }, UseVisitsParams>(
    ['visits'],
    '/visits',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { visits: Visit[] }).visits || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch a single visit by ID
 */
export const useVisit = (id: string | undefined) => {
  return useApiQuery<Visit>(
    ['visits', id],
    `/visits/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create a new visit
 */
export const useCreateVisit = () => {
  return useCreateMutation<Visit, Partial<Visit>>(
    '/visits',
    {
      queryKey: ['visits'],
      invalidateQueries: [['visits']],
    }
  )
}

/**
 * Update an existing visit
 */
export const useUpdateVisit = (id: string) => {
  return useUpdateMutation<Visit, Partial<Visit>>(
    `/visits/${id}`,
    {
      queryKey: ['visits', id],
      invalidateQueries: [['visits'], ['visits', id]],
    }
  )
}

/**
 * Delete a visit (soft delete)
 */
export const useDeleteVisit = () => {
  return useDeleteMutation<{ message: string }>(
    '/visits',
    {
      queryKey: ['visits'],
      invalidateQueries: [['visits']],
    }
  )
}

/**
 * Admit a patient (for inpatient visits)
 */
export const useAdmitPatient = (id: string) => {
  return useCreateMutation<Visit, { admissionDate?: string; room?: string; bed?: string }>(
    `/visits/${id}/admit`,
    {
      queryKey: ['visits', id],
      invalidateQueries: [['visits'], ['visits', id]],
    }
  )
}

/**
 * Discharge a patient
 */
export const useDischargePatient = (id: string) => {
  return useCreateMutation<Visit, { dischargeDate?: string; dischargeNotes?: string; dischargeDiagnosis?: string }>(
    `/visits/${id}/discharge`,
    {
      queryKey: ['visits', id],
      invalidateQueries: [['visits'], ['visits', id]],
    }
  )
}

