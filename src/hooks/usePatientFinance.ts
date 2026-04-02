import { useMutation } from '@tanstack/react-query'
import { useApiQuery, useApiQueryWithParams } from '../lib/queries'
import { useCreateMutation } from '../lib/mutations'
import { apiClient } from '../lib/api-client'
import { invalidateQueries } from '../lib/query-client'
import {
  BillingOverride,
  FinancialPortfolioSummary,
  FinancialTransaction,
  PatientFinancialAccount,
  PatientFinancialSummary,
  PatientWallet,
} from '../model/Financial'

interface UseFinancialSummaryParams extends Record<string, unknown> {
  patientId?: string
}

interface UseFinancialTransactionsParams extends Record<string, unknown> {
  patientId?: string
  status?: string
  transactionType?: string
  limit?: number
  skip?: number
}

interface UseBillingOverridesParams extends Record<string, unknown> {
  patientId?: string
  active?: boolean
}

export const useFinancialSummary = (params: UseFinancialSummaryParams = {}) => {
  return useApiQueryWithParams<PatientFinancialSummary | FinancialPortfolioSummary, UseFinancialSummaryParams>(
    ['financial-summary'],
    '/financial/summary',
    params,
  )
}

export const usePatientFinancialSummary = (patientId: string | undefined) => {
  return useApiQuery<PatientFinancialSummary>(
    ['patient-financial-summary', patientId],
    `/financial/accounts/${patientId || ''}/summary`,
    { enabled: !!patientId },
  )
}

export const useCreateFinancialAccount = () => {
  return useCreateMutation<{ account: PatientFinancialAccount; wallet: PatientWallet }, Partial<PatientFinancialAccount>>(
    '/financial/accounts',
    {
      queryKey: ['financial-summary'],
      invalidateQueries: [['financial-summary']],
    },
  )
}

export const usePatientWallet = (patientId: string | undefined) => {
  return useApiQuery<PatientWallet>(
    ['patient-wallet', patientId],
    `/financial/wallets/${patientId || ''}`,
    { enabled: !!patientId },
  )
}

export const useFundWallet = (patientId: string) => {
  return useCreateMutation<{ wallet: PatientWallet; transaction: FinancialTransaction }, Record<string, unknown>>(
    `/financial/wallets/${patientId}/fund`,
    {
      queryKey: ['patient-wallet', patientId],
      invalidateQueries: [
        ['patient-wallet', patientId],
        ['patient-financial-summary', patientId],
        ['financial-summary'],
        ['financial-transactions'],
      ],
    },
  )
}

export const useSettleInvoiceFromWallet = (invoiceId: string, patientId?: string) => {
  return useCreateMutation<Record<string, unknown>, { amount?: number; referenceNumber?: string; notes?: string }>(
    `/financial/invoices/${invoiceId}/settle-from-wallet`,
    {
      queryKey: ['invoices', invoiceId],
      invalidateQueries: [
        ['invoices'],
        ['invoices', invoiceId],
        ['payments'],
        ['financial-summary'],
        ['financial-transactions'],
        ...(patientId ? [['patient-wallet', patientId], ['patient-financial-summary', patientId]] : []),
      ],
    },
  )
}

export const useFinancialTransactions = (params: UseFinancialTransactionsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<FinancialTransaction[] | { transactions: FinancialTransaction[] }, UseFinancialTransactionsParams>(
    ['financial-transactions'],
    '/financial/transactions',
    params,
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { transactions: FinancialTransaction[] }).transactions || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

export const useBillingOverrides = (params: UseBillingOverridesParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<BillingOverride[] | { overrides: BillingOverride[] }, UseBillingOverridesParams>(
    ['billing-overrides'],
    '/financial/overrides',
    params,
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { overrides: BillingOverride[] }).overrides || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

export const useCreateBillingOverride = () => {
  return useCreateMutation<BillingOverride, Partial<BillingOverride>>(
    '/financial/overrides',
    {
      queryKey: ['billing-overrides'],
      invalidateQueries: [['billing-overrides'], ['financial-summary']],
    },
  )
}

export const useRevokeBillingOverride = (patientId?: string) => {
  return useMutation<
    BillingOverride,
    Error,
    { overrideId: string; revokedBy?: string; reason?: string }
  >({
    mutationFn: async ({ overrideId, ...payload }) => {
      return apiClient.post<BillingOverride>(`/financial/overrides/${overrideId}/revoke`, payload)
    },
    onSuccess: () => {
      invalidateQueries(['billing-overrides'])
      invalidateQueries(['financial-summary'])
      if (patientId) {
        invalidateQueries(['patient-financial-summary', patientId])
      }
    },
  })
}
