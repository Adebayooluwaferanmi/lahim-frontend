import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation } from '../lib/mutations'
import { apiClient } from '../lib/api-client'

export interface Pharmacy {
  id?: string
  _id?: string
  name: string
  address?: string
  phone?: string
  email?: string
  contactPerson?: string
  active: boolean
}

export interface PrescriptionRouting {
  id?: string
  _id?: string
  prescriptionId: string
  pharmacyId: string
  status: 'sent' | 'received' | 'filled' | 'picked_up' | 'cancelled'
  sentDate: string
  notes?: string
}

/**
 * Fetch pharmacies
 */
export const usePharmacies = (params: { active?: boolean } = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Pharmacy[] | { pharmacies: Pharmacy[] }, { active?: boolean }>(
    ['pharmacies'],
    '/pharmacies',
    params
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { pharmacies: Pharmacy[] }).pharmacies || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Create a new pharmacy
 */
export const useCreatePharmacy = () => {
  return useCreateMutation<Pharmacy, Partial<Pharmacy>>(
    '/pharmacies',
    {
      queryKey: ['pharmacies'],
      invalidateQueries: [['pharmacies']],
    }
  )
}

/**
 * Route prescription to pharmacy
 */
export const useRoutePrescriptionToPharmacy = (prescriptionId: string) => {
  return useCreateMutation<PrescriptionRouting, { pharmacyId: string; notes?: string }>(
    `/prescriptions/${prescriptionId}/route-to-pharmacy`,
    {
      queryKey: ['prescription-routing', prescriptionId],
      invalidateQueries: [['prescription-routing', prescriptionId], ['prescriptions', prescriptionId]],
    }
  )
}

/**
 * Get prescription pharmacy status
 */
export const usePrescriptionPharmacyStatus = (prescriptionId: string | undefined) => {
  return useApiQuery<{ routed: boolean; pharmacy?: Pharmacy; routing?: PrescriptionRouting }>(
    ['prescription-routing', prescriptionId],
    `/prescriptions/${prescriptionId}/pharmacy-status`,
    { enabled: !!prescriptionId }
  )
}

