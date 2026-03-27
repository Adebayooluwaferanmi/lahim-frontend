import AbstractDBModel from './AbstractDBModel'

export type VisitType = 'Emergency' | 'Outpatient' | 'Inpatient' | 'Clinic' | 'Walk-in'
export type VisitStatus = 'Admitted' | 'Discharged' | 'CheckedOut' | 'InProgress' | 'Cancelled'
export type PaymentState = 'pending' | 'paid' | 'partial' | 'waived'

export default interface Visit extends AbstractDBModel {
  patientId: string
  startDate: string
  endDate?: string
  visitType: VisitType
  status: VisitStatus
  location: string
  examiner?: string
  reasonForVisit?: string
  primaryDiagnosis?: string
  primaryDiagnosisId?: string
  primaryBillingDiagnosis?: string
  primaryBillingDiagnosisId?: string
  paymentState: PaymentState
  outPatient: boolean
  hasAppointment: boolean
  appointmentId?: string
  history?: string
  historySince?: string
  notes?: string
  dischargeInfo?: {
    dischargeDate: string
    dischargeNotes?: string
    dischargeDiagnosis?: string
  }
  // Linked resources
  vitals?: string[] // Array of vital sign IDs
  procedures?: string[] // Array of procedure IDs
  patientNotes?: string[] // Array of note IDs
  medication?: string[] // Array of medication IDs
  labs?: string[] // Array of lab order IDs
  imaging?: string[] // Array of imaging order IDs
  diagnoses?: string[] // Array of diagnosis IDs
  charges?: string[] // Array of charge IDs
  reports?: string[] // Array of report IDs
  customForms?: Record<string, any>
}

