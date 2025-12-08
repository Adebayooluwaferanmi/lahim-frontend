import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useApiQuery } from '../lib/queries'
import { apiClient } from '../lib/api-client'

export interface Organism {
  id?: string
  _id?: string
  code: string
  display: string
  codeSystem?: string
  synonyms?: string[]
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Antibiotic {
  id?: string
  _id?: string
  code: string
  display: string
  codeSystem?: string
  class?: string
  spectrum?: string[]
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ValueSet {
  id?: string
  _id?: string
  listId: string
  items: Array<{
    code: string
    display: string
    codeSystem?: string
  }>
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

interface UseOrganismsParams extends Record<string, unknown> {
  search?: string
  codeSystem?: string
  limit?: number
  skip?: number
}

interface UseAntibioticsParams extends Record<string, unknown> {
  search?: string
  codeSystem?: string
  class?: string
  limit?: number
  skip?: number
}

/**
 * Fetch organisms with optional filters
 */
export const useOrganisms = (params: UseOrganismsParams = {}) => {
  return useApiQuery<{ organisms: Organism[]; count: number }, UseOrganismsParams>(
    ['vocabularies', 'organisms'],
    '/vocabularies/organisms',
    params
  )
}

/**
 * Fetch a single organism by ID
 */
export const useOrganism = (id: string | undefined) => {
  return useApiQuery<Organism>(
    ['vocabularies', 'organisms', id],
    `/vocabularies/organisms/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create organism mutation hook
 */
export const useCreateOrganism = () => {
  const queryClient = useQueryClient()

  return useMutation<Organism, Error, Partial<Organism>>({
    mutationFn: async (data) => {
      return apiClient.post<Organism>('/vocabularies/organisms', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'organisms'] })
    },
  })
}

/**
 * Update organism mutation hook
 */
export const useUpdateOrganism = () => {
  const queryClient = useQueryClient()

  return useMutation<Organism, Error, { id: string; updates: Partial<Organism> }>({
    mutationFn: async ({ id, updates }) => {
      return apiClient.put<Organism>(`/vocabularies/organisms/${id}`, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'organisms', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'organisms'] })
    },
  })
}

/**
 * Delete organism mutation hook
 */
export const useDeleteOrganism = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete(`/vocabularies/organisms/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'organisms'] })
    },
  })
}

/**
 * Fetch antibiotics with optional filters
 */
export const useAntibiotics = (params: UseAntibioticsParams = {}) => {
  return useApiQuery<{ antibiotics: Antibiotic[]; count: number }, UseAntibioticsParams>(
    ['vocabularies', 'antibiotics'],
    '/vocabularies/antibiotics',
    params
  )
}

/**
 * Fetch a single antibiotic by ID
 */
export const useAntibiotic = (id: string | undefined) => {
  return useApiQuery<Antibiotic>(
    ['vocabularies', 'antibiotics', id],
    `/vocabularies/antibiotics/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Create antibiotic mutation hook
 */
export const useCreateAntibiotic = () => {
  const queryClient = useQueryClient()

  return useMutation<Antibiotic, Error, Partial<Antibiotic>>({
    mutationFn: async (data) => {
      return apiClient.post<Antibiotic>('/vocabularies/antibiotics', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'antibiotics'] })
    },
  })
}

/**
 * Update antibiotic mutation hook
 */
export const useUpdateAntibiotic = () => {
  const queryClient = useQueryClient()

  return useMutation<Antibiotic, Error, { id: string; updates: Partial<Antibiotic> }>({
    mutationFn: async ({ id, updates }) => {
      return apiClient.put<Antibiotic>(`/vocabularies/antibiotics/${id}`, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'antibiotics', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'antibiotics'] })
    },
  })
}

/**
 * Delete antibiotic mutation hook
 */
export const useDeleteAntibiotic = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete(`/vocabularies/antibiotics/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'antibiotics'] })
    },
  })
}

/**
 * Fetch value sets
 */
export const useValueSets = (params: Record<string, unknown> = {}) => {
  return useApiQuery<{ valueSets: ValueSet[]; count: number }, Record<string, unknown>>(
    ['vocabularies', 'value-sets'],
    '/vocabularies/value-sets',
    params
  )
}

/**
 * Fetch a single value set by listId
 */
export const useValueSet = (listId: string | undefined) => {
  return useApiQuery<ValueSet>(
    ['vocabularies', 'value-sets', listId],
    `/vocabularies/value-sets/${listId}`,
    {
      enabled: !!listId,
    }
  )
}

/**
 * Create value set mutation hook
 */
export const useCreateValueSet = () => {
  const queryClient = useQueryClient()

  return useMutation<ValueSet, Error, Partial<ValueSet>>({
    mutationFn: async (data) => {
      return apiClient.post<ValueSet>('/vocabularies/value-sets', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'value-sets'] })
    },
  })
}

/**
 * Update value set mutation hook
 */
export const useUpdateValueSet = () => {
  const queryClient = useQueryClient()

  return useMutation<ValueSet, Error, { id: string; updates: Partial<ValueSet> }>({
    mutationFn: async ({ id, updates }) => {
      return apiClient.put<ValueSet>(`/vocabularies/value-sets/${id}`, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'value-sets', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'value-sets'] })
    },
  })
}

/**
 * Delete value set mutation hook
 */
export const useDeleteValueSet = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete(`/vocabularies/value-sets/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabularies', 'value-sets'] })
    },
  })
}

