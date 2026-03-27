import { useQuery } from '@tanstack/react-query'
import { useApiQuery } from '../lib/queries'

export interface LOINCCode {
  code: string
  component: string
  property: string
  time: string
  system: string
  scale: string
  method?: string
  longCommonName?: string
  shortName?: string
  externalCopyrightNotice?: string
}

interface UseLOINCSearchParams extends Record<string, unknown> {
  q: string
  limit?: number
}

/**
 * Search LOINC codes
 */
export const useLOINCSearch = (params: UseLOINCSearchParams) => {
  return useApiQuery<{ codes: LOINCCode[]; count: number }, UseLOINCSearchParams>(
    ['loinc', 'search', params.q],
    '/loinc/search',
    params,
    {
      enabled: !!params.q && params.q.trim().length > 0,
    }
  )
}

/**
 * Get LOINC code by code
 */
export const useLOINCCode = (code: string | undefined) => {
  return useApiQuery<LOINCCode>(
    ['loinc', code],
    `/loinc/${code}`,
    {},
    {
      enabled: !!code,
    }
  )
}

