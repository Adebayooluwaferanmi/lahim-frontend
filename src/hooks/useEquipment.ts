import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useApiQuery } from '../lib/queries'
import { apiClient } from '../lib/api-client'

export interface Equipment {
  id?: string
  _id?: string
  name: string
  equipmentType: string // analyzer, centrifuge, microscope, etc.
  manufacturer?: string
  model?: string
  serialNumber?: string
  location?: string
  status: 'active' | 'maintenance' | 'retired' | 'decommissioned'
  purchaseDate?: string
  warrantyExpiry?: string
  lastMaintenance?: string
  nextMaintenance?: string
  createdAt?: string
  updatedAt?: string
}

export interface EquipmentMaintenance {
  id?: string
  _id?: string
  equipmentId: string
  maintenanceType: 'preventive' | 'corrective' | 'calibration' | 'repair'
  scheduledAt: string
  performedAt?: string
  performedBy?: string
  cost?: number
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface UseEquipmentParams extends Record<string, unknown> {
  status?: string
  equipmentType?: string
  location?: string
  limit?: number
  skip?: number
}

/**
 * Fetch equipment with optional filters
 */
export const useEquipment = (params: UseEquipmentParams = {}) => {
  return useApiQuery<{ equipment: Equipment[]; count: number }, UseEquipmentParams>(
    ['equipment'],
    '/equipment',
    params
  )
}

/**
 * Fetch a single equipment by ID
 */
export const useEquipmentItem = (id: string | undefined) => {
  return useApiQuery<Equipment>(
    ['equipment', id],
    `/equipment/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Fetch maintenance history for equipment
 */
export const useEquipmentHistory = (id: string | undefined) => {
  return useApiQuery<{ history: EquipmentMaintenance[]; count: number }>(
    ['equipment', id, 'history'],
    `/equipment/${id}/history`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create equipment mutation hook
 */
export const useCreateEquipment = () => {
  const queryClient = useQueryClient()

  return useMutation<Equipment, Error, Partial<Equipment>>({
    mutationFn: async (data) => {
      return apiClient.post<Equipment>('/equipment', {
        name: data.name,
        equipmentType: data.equipmentType,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        location: data.location,
        status: data.status || 'active',
        purchaseDate: data.purchaseDate,
        warrantyExpiry: data.warrantyExpiry,
        lastMaintenance: data.lastMaintenance,
        nextMaintenance: data.nextMaintenance,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

/**
 * Update equipment mutation hook
 */
export const useUpdateEquipment = () => {
  const queryClient = useQueryClient()

  return useMutation<Equipment, Error, { id: string; updates: Partial<Equipment> }>({
    mutationFn: async ({ id, updates }) => {
      return apiClient.put<Equipment>(`/equipment/${id}`, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

/**
 * Schedule maintenance mutation hook
 */
export const useScheduleMaintenance = () => {
  const queryClient = useQueryClient()

  return useMutation<
    EquipmentMaintenance,
    Error,
    { equipmentId: string; maintenanceType: string; scheduledAt: string; performedBy?: string; cost?: number; notes?: string }
  >({
    mutationFn: async (data) => {
      return apiClient.post<EquipmentMaintenance>(`/equipment/${data.equipmentId}/maintenance`, {
        maintenanceType: data.maintenanceType,
        scheduledAt: data.scheduledAt,
        performedBy: data.performedBy,
        cost: data.cost,
        notes: data.notes,
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.equipmentId] })
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.equipmentId, 'history'] })
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

/**
 * Record calibration mutation hook
 */
export const useRecordCalibration = () => {
  const queryClient = useQueryClient()

  return useMutation<
    EquipmentMaintenance,
    Error,
    { equipmentId: string; scheduledAt?: string; performedAt?: string; performedBy?: string; cost?: number; notes?: string }
  >({
    mutationFn: async (data) => {
      return apiClient.post<EquipmentMaintenance>(`/equipment/${data.equipmentId}/calibrate`, {
        scheduledAt: data.scheduledAt,
        performedAt: data.performedAt,
        performedBy: data.performedBy,
        cost: data.cost,
        notes: data.notes,
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.equipmentId] })
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.equipmentId, 'history'] })
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    },
  })
}

