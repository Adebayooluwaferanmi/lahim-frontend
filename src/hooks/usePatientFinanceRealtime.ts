import { useEffect } from 'react'
import { invalidateQueries } from '../lib/query-client'
import { socketIOManager } from '../lib/realtime-socketio'

interface UsePatientFinanceRealtimeOptions {
  patientId?: string
  invoiceId?: string
  includeOverrides?: boolean
  includePortfolioSummary?: boolean
}

const invalidatePatientFinanceQueries = (patientId?: string, invoiceId?: string) => {
  invalidateQueries(['financial-summary'])
  invalidateQueries(['financial-transactions'])
  invalidateQueries(['billing-overrides'])

  if (patientId) {
    invalidateQueries(['patient-financial-summary', patientId])
    invalidateQueries(['patient-wallet', patientId])
  }

  if (invoiceId) {
    invalidateQueries(['invoices', invoiceId])
  }

  invalidateQueries(['invoices'])
  invalidateQueries(['payments'])
}

export const usePatientFinanceRealtime = ({
  patientId,
  invoiceId,
  includeOverrides = false,
  includePortfolioSummary = false,
}: UsePatientFinanceRealtimeOptions) => {
  useEffect(() => {
    const unsubscriptions: Array<() => void> = []

    if (patientId) {
      unsubscriptions.push(
        socketIOManager.subscribe(`patient-finance:${patientId}`, () => {
          invalidatePatientFinanceQueries(patientId, invoiceId)
        }),
      )
    }

    if (includeOverrides) {
      unsubscriptions.push(
        socketIOManager.subscribe('billing-overrides', () => {
          invalidatePatientFinanceQueries(patientId, invoiceId)
        }),
      )
    }

    if (includePortfolioSummary) {
      unsubscriptions.push(
        socketIOManager.subscribe('financial-summary', () => {
          invalidatePatientFinanceQueries(patientId, invoiceId)
        }),
      )
    }

    return () => {
      unsubscriptions.forEach((unsubscribe) => unsubscribe())
    }
  }, [includeOverrides, includePortfolioSummary, invoiceId, patientId])
}

export default usePatientFinanceRealtime
