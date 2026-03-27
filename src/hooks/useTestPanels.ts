import { useApiQuery, useApiQueryWithParams } from '../lib/queries'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '../lib/mutations'

export interface TestPanelParameter {
  id?: string
  parameterCode: string
  parameterName: string
  sequence: number
  unit?: string
  refRangeLow?: number
  refRangeHigh?: number
  criticalLow?: number
  criticalHigh?: number
  defaultValue?: string
  required?: boolean
  active?: boolean
  testCatalog?: {
    code: string
    name: string
  }
}

export interface TestPanel {
  id?: string
  _id?: string
  code: string
  name: string
  description?: string
  department?: string
  active?: boolean
  parameters?: TestPanelParameter[]
  createdAt?: string
  updatedAt?: string
}

interface UseTestPanelsParams extends Record<string, unknown> {
  active?: boolean
  department?: string
  code?: string
}

/**
 * Fetch test panels
 */
export const useTestPanels = (params: UseTestPanelsParams = {}) => {
  return useApiQueryWithParams<{ panels: TestPanel[]; count: number }, UseTestPanelsParams>(
    ['test-panels', params],
    '/test-panels',
    params
  )
}

/**
 * Fetch a single test panel by ID
 */
export const useTestPanel = (id: string | undefined) => {
  return useApiQuery<TestPanel>(
    ['test-panels', id],
    `/test-panels/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create a new test panel
 */
export const useCreateTestPanel = () => {
  return useCreateMutation<TestPanel, Partial<TestPanel>>('/test-panels', {
    invalidateQueries: [['test-panels']],
  })
}

/**
 * Update a test panel
 */
export const useUpdateTestPanel = () => {
  return useUpdateMutation<TestPanel, Partial<TestPanel>>('/test-panels', {
    invalidateQueries: [['test-panels']],
  })
}

/**
 * Delete a test panel
 */
export const useDeleteTestPanel = () => {
  return useDeleteMutation('/test-panels', {
    invalidateQueries: [['test-panels']],
  })
}

/**
 * Add a parameter to a test panel
 */
export const useAddPanelParameter = () => {
  return useCreateMutation<{ parameter: TestPanelParameter }, Partial<TestPanelParameter>>(
    '/test-panels',
    {
      invalidateQueries: [['test-panels']],
    }
  )
}

/**
 * Update a panel parameter
 */
export const useUpdatePanelParameter = () => {
  return useUpdateMutation<{ parameter: TestPanelParameter }, Partial<TestPanelParameter>>(
    '/test-panels',
    {
      invalidateQueries: [['test-panels']],
    }
  )
}

/**
 * Remove a parameter from a panel
 */
export const useRemovePanelParameter = () => {
  return useDeleteMutation('/test-panels', {
    invalidateQueries: [['test-panels']],
  })
}

