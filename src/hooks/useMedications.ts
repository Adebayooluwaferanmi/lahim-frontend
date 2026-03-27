import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '../lib/mutations'
import { Medication, Prescription } from '../model/Medication'

interface UseMedicationsParams extends Record<string, unknown> {
  search?: string
  type?: string
  limit?: number
  skip?: number
}

interface UsePrescriptionsParams extends Record<string, unknown> {
  patientId?: string
  visitId?: string
  status?: string
  limit?: number
  skip?: number
}

export const useMedications = (params: UseMedicationsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Medication[] | { medications: Medication[] }, UseMedicationsParams>(
    ['medications'],
    '/medications',
    params
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { medications: Medication[] }).medications || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

export const useMedication = (id: string | undefined) => {
  return useApiQuery<Medication>(
    ['medications', id],
    `/medications/${id}`,
    {
      enabled: !!id,
    }
  )
}

export const useCreateMedication = () => {
  return useCreateMutation<Medication, Partial<Medication>>(
    '/medications',
    {
      queryKey: ['medications'],
      invalidateQueries: [['medications']],
    }
  )
}

export const useUpdateMedication = (id: string) => {
  return useUpdateMutation<Medication, Partial<Medication>>(
    `/medications/${id}`,
    {
      queryKey: ['medications', id],
      invalidateQueries: [['medications'], ['medications', id]],
    }
  )
}

export const usePrescriptions = (params: UsePrescriptionsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Prescription[] | { prescriptions: Prescription[] }, UsePrescriptionsParams>(
    ['prescriptions'],
    '/prescriptions',
    params
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { prescriptions: Prescription[] }).prescriptions || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

export const usePrescription = (id: string | undefined) => {
  return useApiQuery<Prescription>(
    ['prescriptions', id],
    `/prescriptions/${id}`,
    {
      enabled: !!id,
    }
  )
}

export const useCreatePrescription = () => {
  return useCreateMutation<Prescription, Partial<Prescription>>(
    '/prescriptions',
    {
      queryKey: ['prescriptions'],
      invalidateQueries: [['prescriptions']],
    }
  )
}

export const useUpdatePrescription = (id: string) => {
  return useUpdateMutation<Prescription, Partial<Prescription>>(
    `/prescriptions/${id}`,
    {
      queryKey: ['prescriptions', id],
      invalidateQueries: [['prescriptions'], ['prescriptions', id]],
    }
  )
}

export const useDiscontinuePrescription = (id: string) => {
  return useCreateMutation<Prescription, { reason?: string }>(
    `/prescriptions/${id}/discontinue`,
    {
      queryKey: ['prescriptions', id],
      invalidateQueries: [['prescriptions'], ['prescriptions', id]],
    }
  )
}

