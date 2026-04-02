import AbstractDBModel from './AbstractDBModel'

export type InvoiceStatus = 'Draft' | 'Billed' | 'Paid' | 'PartiallyPaid' | 'Cancelled' | 'Waived'
export type PaymentMethod = 'cash' | 'card' | 'check' | 'bank_transfer' | 'digital_payment' | 'insurance' | 'wallet' | 'other'

export interface Charge extends AbstractDBModel {
  patientId: string
  visitId?: string
  description: string
  code?: string // CPT, ICD-10, or other billing code
  codeSystem?: string
  quantity: number
  unitPrice: number
  totalAmount: number
  date: string
  department?: string
  status: 'pending' | 'billed' | 'cancelled'
  notes?: string
}

export interface Payment extends AbstractDBModel {
  invoiceId: string
  patientId: string
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  referenceNumber?: string
  receivedBy?: string
  notes?: string
  // For partial payments
  isPartial?: boolean
}

export interface Invoice extends AbstractDBModel {
  patientId: string
  visitId?: string
  invoiceNumber?: string
  externalInvoiceNumber?: string
  billDate: string
  dueDate?: string
  status: InvoiceStatus
  // Financials
  subtotal: number
  tax?: number
  discount?: number
  total: number
  paidTotal: number
  balance: number
  // Line items
  lineItems: string[] // Array of charge IDs
  charges?: Charge[] // Embedded charges for display
  // Payments
  payments: string[] // Array of payment IDs
  paymentHistory?: Payment[] // Embedded payments for display
  // Metadata
  paymentProfile?: string
  remarks?: string
  archived: boolean
  // Audit
  lastModified?: string
  modifiedBy?: string
}

export interface PaymentProfile extends AbstractDBModel {
  patientId: string
  primaryInsurance?: {
    name: string
    policyNumber: string
    groupNumber?: string
    effectiveDate?: string
    expiryDate?: string
  }
  secondaryInsurance?: {
    name: string
    policyNumber: string
    groupNumber?: string
  }
  selfPay: boolean
  discountPercentage?: number
  notes?: string
}


