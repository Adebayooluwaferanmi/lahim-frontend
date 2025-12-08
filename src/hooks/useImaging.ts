import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '../lib/mutations'
import { Imaging, ImagingType } from '../model/Imaging'

interface UseImagingParams extends Record<string, unknown> {
  status?: string
  patientId?: string
  visitId?: string
  imagingType?: string
  limit?: number
  skip?: number
}

/**
 * Fetch imaging orders with optional filters
 */
export const useImaging = (params: UseImagingParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Imaging[] | { imaging: Imaging[] }, UseImagingParams>(
    ['imaging'],
    '/imaging',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { imaging: Imaging[] }).imaging || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Alias for useImaging for consistency with other hooks
 */
export const useImagingOrders = useImaging

/**
 * Fetch a single imaging order by ID
 */
export const useImagingById = (id: string | undefined) => {
  return useApiQuery<Imaging>(
    ['imaging', id],
    `/imaging/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create a new imaging order
 */
export const useCreateImaging = () => {
  return useCreateMutation<Imaging, Partial<Imaging>>(
    '/imaging',
    {
      queryKey: ['imaging'],
      invalidateQueries: [['imaging']],
    }
  )
}

/**
 * Update an existing imaging order
 */
export const useUpdateImaging = (id: string) => {
  return useUpdateMutation<Imaging, Partial<Imaging>>(
    `/imaging/${id}`,
    {
      queryKey: ['imaging', id],
      invalidateQueries: [['imaging'], ['imaging', id]],
    }
  )
}

/**
 * Delete an imaging order
 */
export const useDeleteImaging = () => {
  return useDeleteMutation<{ message: string }>(
    '/imaging',
    {
      queryKey: ['imaging'],
      invalidateQueries: [['imaging']],
    }
  )
}

// Imaging Types
export const useImagingTypes = (params: { active?: boolean; category?: string } = {}) => {
  const { data, ...rest } = useApiQueryWithParams<ImagingType[] | { types: ImagingType[] }, typeof params>(
    ['imaging-types'],
    '/imaging/types',
    params
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { types: ImagingType[] }).types || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

export const useImagingTypeById = (id: string | undefined) => {
  return useApiQuery<ImagingType>(
    ['imaging-types', id],
    `/imaging/types/${id}`,
    {
      enabled: !!id,
    }
  )
}

export const useCreateImagingType = () => {
  return useCreateMutation<ImagingType, Partial<ImagingType>>(
    '/imaging/types',
    {
      queryKey: ['imaging-types'],
      invalidateQueries: [['imaging-types']],
    }
  )
}

export const useUpdateImagingType = (id: string) => {
  return useUpdateMutation<ImagingType, Partial<ImagingType>>(
    `/imaging/types/${id}`,
    {
      queryKey: ['imaging-types', id],
      invalidateQueries: [['imaging-types'], ['imaging-types', id]],
    }
  )
}

export const useDeleteImagingType = () => {
  return useDeleteMutation<{ message: string }>(
    '/imaging/types',
    {
      queryKey: ['imaging-types'],
      invalidateQueries: [['imaging-types']],
    }
  )
}

/**
 * Upload an image file for an imaging order (using base64 encoding)
 */
export const useUploadImage = () => {
  const { useMutation, useQueryClient } = require('@tanstack/react-query')
  const { apiClient } = require('../lib/api-client')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ imagingId, file, description }: { imagingId: string; file: File; description?: string }) => {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const API_BASE_URL = import.meta.env.VITE_HOSPITALRUN_API || 'http://localhost:3000'
      const response = await fetch(`${API_BASE_URL}/imaging/${imagingId}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          filename: file.name,
          contentType: file.type,
          description,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to upload image' }))
        throw new Error(error.error || error.message || 'Failed to upload image')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['imaging', variables.imagingId] })
      queryClient.invalidateQueries({ queryKey: ['imaging'] })
    },
  })
}

