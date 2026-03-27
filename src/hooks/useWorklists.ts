import { useApiQueryWithParams, useApiQuery } from '../lib/queries'

export interface Worklist {
  id?: string
  _id?: string
  worklistNumber?: string
  section?: string
  generatedDate?: string
  generatedBy?: string
  status?: 'active' | 'completed' | 'cancelled'
  items?: Array<{
    id?: string
    testCode?: string
    testName?: string
    specimenId?: string
    accessionNumber?: string
    patientName?: string
    status?: 'pending' | 'in-progress' | 'completed'
    priority?: string
  }>
}

interface UseWorklistsParams extends Record<string, unknown> {
  section?: string
  status?: string
}

/**
 * Fetch worklists with optional filters
 * Uses optimized API client with caching and retry logic
 */
export const useWorklists = (params: UseWorklistsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Worklist[] | { worklists: Worklist[] }, UseWorklistsParams>(
    ['worklists'],
    '/worklists',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { worklists: Worklist[] }).worklists || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch a single worklist by ID
 * Uses optimized API client with caching
 */
export const useWorklist = (id: string | undefined) => {
  return useApiQuery<Worklist>(
    ['worklists', id],
    `/worklists/${id}`,
    {
    enabled: !!id,
    }
  )
}

