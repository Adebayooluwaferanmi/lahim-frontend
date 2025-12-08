import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation, useUpdateMutation } from '../lib/mutations'
import { Invoice, Payment, Charge } from '../model/Billing'

interface UseInvoicesParams extends Record<string, unknown> {
  patientId?: string
  visitId?: string
  status?: string
  limit?: number
  skip?: number
}

interface UseChargesParams extends Record<string, unknown> {
  patientId?: string
  visitId?: string
  status?: string
  limit?: number
  skip?: number
}

interface UsePaymentsParams extends Record<string, unknown> {
  invoiceId?: string
  patientId?: string
  limit?: number
  skip?: number
}

export const useInvoices = (params: UseInvoicesParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Invoice[] | { invoices: Invoice[] }, UseInvoicesParams>(
    ['invoices'],
    '/invoices',
    params
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { invoices: Invoice[] }).invoices || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

export const useInvoice = (id: string | undefined) => {
  return useApiQuery<Invoice>(
    ['invoices', id],
    `/invoices/${id}`,
    {
      enabled: !!id,
    }
  )
}

export const useCreateInvoice = () => {
  return useCreateMutation<Invoice, Partial<Invoice>>(
    '/invoices',
    {
      queryKey: ['invoices'],
      invalidateQueries: [['invoices']],
    }
  )
}

export const useUpdateInvoice = (id: string) => {
  return useUpdateMutation<Invoice, Partial<Invoice>>(
    `/invoices/${id}`,
    {
      queryKey: ['invoices', id],
      invalidateQueries: [['invoices'], ['invoices', id]],
    }
  )
}

export const useCharges = (params: UseChargesParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Charge[] | { charges: Charge[] }, UseChargesParams>(
    ['charges'],
    '/charges',
    params
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { charges: Charge[] }).charges || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

export const useCreateCharge = () => {
  return useCreateMutation<Charge, Partial<Charge>>(
    '/charges',
    {
      queryKey: ['charges'],
      invalidateQueries: [['charges']],
    }
  )
}

export const usePayments = (params: UsePaymentsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Payment[] | { payments: Payment[] }, UsePaymentsParams>(
    ['payments'],
    '/payments',
    params
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { payments: Payment[] }).payments || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

export const useAddPayment = (invoiceId: string) => {
  return useCreateMutation<Payment, Partial<Payment>>(
    `/invoices/${invoiceId}/payments`,
    {
      queryKey: ['invoices', invoiceId],
      invalidateQueries: [['invoices'], ['invoices', invoiceId], ['payments']],
    }
  )
}


