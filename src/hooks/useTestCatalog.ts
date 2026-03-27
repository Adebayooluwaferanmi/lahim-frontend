import { useApiQuery } from '../lib/queries'
import { useCreateMutation } from '../lib/mutations'

export interface TestCatalogEntry {
  id?: string
  _id?: string
  code: string
  name: string
  description?: string
  resultType?: 'numeric' | 'categorical' | 'text' | 'microbiology'
  analyticalPhases?: {
    analytical?: {
      resultTemplate?: {
        fields?: Array<{
          name: string
          type: 'number' | 'text' | 'select' | 'date' | 'boolean'
          label: string
          required?: boolean
          unit?: string
          defaultValue?: any
          options?: Array<{ value: string; label: string }>
          min?: number
          max?: number
          regex?: string
        }>
      }
      validationRules?: {
        min?: number
        max?: number
        criticalLow?: number
        criticalHigh?: number
        normalRange?: { low: number; high: number }
      }
    }
  }
  active?: boolean
}

/**
 * Fetch test catalog entries
 */
export const useTestCatalog = (params: Record<string, unknown> = {}) => {
  return useApiQuery<TestCatalogEntry[] | { entries: TestCatalogEntry[] }, Record<string, unknown>>(
    ['test-catalog'],
    '/test-catalog',
    params
  )
}

/**
 * Fetch a single test catalog entry by code or ID
 */
export const useTestCatalogEntry = (codeOrId: string | undefined) => {
  return useApiQuery<TestCatalogEntry>(
    ['test-catalog', codeOrId],
    `/test-catalog/${codeOrId}`,
    {
      enabled: !!codeOrId,
    }
  )
}

/**
 * Create a new test catalog entry
 */
export const useCreateTestCatalog = () => {
  return useCreateMutation<TestCatalogEntry, Partial<TestCatalogEntry>>('/test-catalog', {
    invalidateQueries: [['test-catalog']],
  })
}

