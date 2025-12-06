import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation } from '../lib/mutations'

export interface QCMaterial {
  id?: string
  _id?: string
  materialName?: string
  lotNumber?: string
  testCode?: any
  testName?: string
  targetValue?: number
  sd?: number
  unit?: string
  acceptableRange?: {
    min?: number
    max?: number
  }
}

export interface QCResult {
  id?: string
  _id?: string
  testCode?: any
  testName?: string
  materialId?: string
  materialName?: string
  materialLot?: string
  instrumentId?: string
  instrumentName?: string
  measuredValue?: number
  targetValue?: number
  status?: 'pass' | 'fail' | 'warning'
  runDate?: string
  runNumber?: string
  notes?: string
}

export interface UseQCResultsParams extends Record<string, unknown> {
  testCode?: string
  status?: string
  materialId?: string
  instrumentId?: string
}

/**
 * Fetch QC results with optional filters
 * Uses optimized API client with caching and retry logic
 */
export const useQCResults = (params: UseQCResultsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<QCResult[] | { results: QCResult[] }, UseQCResultsParams>(
    ['qc-results'],
    '/qc-results',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { results: QCResult[] }).results || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch a single QC result by ID
 * Uses optimized API client with caching
 */
export const useQCResult = (id: string | undefined) => {
  return useApiQuery<QCResult>(
    ['qc-results', id],
    `/qc-results/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Fetch QC materials with optional filters
 * Uses optimized API client with caching and retry logic
 */
export const useQCMaterials = (params: { active?: boolean } = {}) => {
  const { data, ...rest } = useApiQueryWithParams<QCMaterial[] | { materials: QCMaterial[] }, { active?: boolean }>(
    ['qc-materials'],
    '/qc-materials',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { materials: QCMaterial[] }).materials || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Create a new QC result with optimistic updates
 */
export const useCreateQCResult = () => {
  return useCreateMutation<QCResult, Partial<QCResult>>('/qc-results', {
    queryKey: ['qc-results'],
    invalidateQueries: [['qc-results']],
  })
}

