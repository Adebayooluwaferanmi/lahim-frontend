import { useApiQuery } from '../lib/queries'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '../lib/mutations'

export interface Department {
  id?: string
  _id?: string
  name: string
  description?: string
  code?: string
}

export interface Location {
  id?: string
  _id?: string
  name: string
  description?: string
  address?: string
  code?: string
}

export interface SystemSettings {
  hospitalName?: string
  hospitalCode?: string
  timezone?: string
  dateFormat?: string
  timeFormat?: string
  language?: string
}

export const useSettings = () => {
  return useApiQuery<{ settings: SystemSettings[] }>(['settings'], '/settings')
}

export const useUpdateSettings = () => {
  return useUpdateMutation<SystemSettings, SystemSettings>('/settings', {
    queryKey: ['settings'],
    invalidateQueries: [['settings']],
  })
}

export const useDepartments = () => {
  return useApiQuery<{ departments: Department[] }>(['departments'], '/departments')
}

export const useCreateDepartment = () => {
  return useCreateMutation<Department, Partial<Department>>('/departments', {
    queryKey: ['departments'],
    invalidateQueries: [['departments']],
  })
}

export const useUpdateDepartment = (id: string) => {
  return useUpdateMutation<Department, Partial<Department>>(`/departments/${id}`, {
    queryKey: ['departments', id],
    invalidateQueries: [['departments']],
  })
}

export const useDeleteDepartment = () => {
  return useDeleteMutation<{ message: string }>('/departments', {
    queryKey: ['departments'],
    invalidateQueries: [['departments']],
  })
}

export const useLocations = () => {
  return useApiQuery<{ locations: Location[] }>(['locations'], '/locations')
}

export const useCreateLocation = () => {
  return useCreateMutation<Location, Partial<Location>>('/locations', {
    queryKey: ['locations'],
    invalidateQueries: [['locations']],
  })
}

export const useUpdateLocation = (id: string) => {
  return useUpdateMutation<Location, Partial<Location>>(`/locations/${id}`, {
    queryKey: ['locations', id],
    invalidateQueries: [['locations']],
  })
}

export const useDeleteLocation = () => {
  return useDeleteMutation<{ message: string }>('/locations', {
    queryKey: ['locations'],
    invalidateQueries: [['locations']],
  })
}

