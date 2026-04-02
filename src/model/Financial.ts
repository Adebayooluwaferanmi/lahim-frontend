import AbstractDBModel from './AbstractDBModel'
import { PaymentMethod } from './Billing'

export type FinancialClearanceStatus = 'cleared' | 'wallet-available' | 'override' | 'payment-required'
export type FinancialTransactionDirection = 'credit' | 'debit'
export type FinancialTransactionType = 'walletFunding' | 'walletSettlement' | 'manualAdjustment' | 'invoicePayment'

export interface PatientFinancialAccount extends AbstractDBModel {
  patientId: string
  currency: string
  status: 'active' | 'suspended' | 'closed' | 'inactive'
  selfPay: boolean
  creditLimit?: number
  notes?: string
}

export interface PatientWallet extends AbstractDBModel {
  patientId: string
  currency: string
  status: 'active' | 'suspended' | 'closed' | 'inactive'
  balance: number
  lastFundedAt?: string
  lastSettledAt?: string
}

export interface FinancialTransaction extends AbstractDBModel {
  patientId: string
  walletId?: string
  invoiceId?: string
  direction: FinancialTransactionDirection
  transactionType: FinancialTransactionType
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  currency: string
  amount: number
  paymentMethod?: PaymentMethod | 'wallet' | 'digital_payment'
  channel?: string
  referenceNumber?: string
  receivedBy?: string
  notes?: string
  postedAt?: string
}

export interface BillingOverride extends AbstractDBModel {
  patientId: string
  privilegeType?: string
  reason: string
  grantedBy: string
  active: boolean
  status: 'approved' | 'revoked' | 'expired'
  approvedAmount?: number
  limitAmount?: number
  expiresAt?: string
  notes?: string
  grantedAt?: string
  revokedAt?: string
  revokedBy?: string
  revokeReason?: string
  outstandingBalance?: number
}

export interface PatientFinancialSummary {
  patientId: string
  account?: PatientFinancialAccount
  wallet: PatientWallet
  activeOverrides: BillingOverride[]
  recentTransactions: FinancialTransaction[]
  counts: {
    invoices: number
    charges: number
    payments: number
    overrides: number
  }
  totals: {
    billed: number
    paid: number
    outstanding: number
    pendingCharges: number
    walletBalance: number
    approvedOverrideAmount: number
    availableCoverage: number
  }
  serviceClearance: {
    status: FinancialClearanceStatus
    canProceed: boolean
    reason: string
    requiredAmount: number
  }
  generatedAt: string
}

export interface FinancialPortfolioSummary {
  totals: {
    billed: number
    collected: number
    outstanding: number
    walletBalance: number
    activeOverrideAmount: number
  }
  counts: {
    invoices: number
    payments: number
    wallets: number
    activeOverrides: number
    patientsWithOutstanding: number
  }
  generatedAt: string
}
