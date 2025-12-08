import { useApiQuery } from '../lib/queries'
import { useCreateMutation } from '../lib/mutations'
import { apiClient } from '../lib/api-client'

export interface DrugInteraction {
  severity: 'major' | 'moderate' | 'minor'
  description: string
  clinicalSignificance: string
  recommendation?: string
}

export interface DrugInteractionCheckResult {
  medications: string[]
  interactions: DrugInteraction[]
  hasInteractions: boolean
  hasMajorInteractions: boolean
}

/**
 * Check for drug interactions between multiple medications
 */
export const useCheckDrugInteractions = () => {
  return useCreateMutation<DrugInteractionCheckResult, { medications: string[] }>(
    '/drug-interactions/check',
    {}
  )
}

/**
 * Get known interactions for a specific medication
 */
export const useMedicationInteractions = (medication: string | undefined) => {
  return useApiQuery<{ medication: string; interactions: Array<DrugInteraction & { drug: string }>; count: number }>(
    ['drug-interactions', medication],
    `/drug-interactions/${encodeURIComponent(medication || '')}`,
    { enabled: !!medication }
  )
}

/**
 * Check interactions for a patient's current medications
 */
export const checkPatientMedications = async (medicationNames: string[]): Promise<DrugInteractionCheckResult> => {
  const response = await apiClient.post<DrugInteractionCheckResult>('/drug-interactions/check', {
    medications: medicationNames,
  })
  return response.data
}

