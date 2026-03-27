import { AbstractDBModel } from './Model'

export type ReportType = 
  | 'Lab Results'
  | 'Patient Summary'
  | 'Visit Summary'
  | 'Billing Summary'
  | 'Medication History'
  | 'Imaging Summary'
  | 'Incident Report'
  | 'Custom'

export type ReportStatus = 'Draft' | 'Generated' | 'Delivered' | 'Archived'
export type ReportFormat = 'PDF' | 'JSON' | 'CSV' | 'HL7' | 'FHIR'

export interface Report extends AbstractDBModel {
  reportNumber?: string // Auto-generated report number
  reportType: ReportType
  status: ReportStatus
  format: ReportFormat
  patientId?: string
  visitId?: string
  generatedOn: string
  generatedBy?: string
  generatedByName?: string
  // Report content/data
  title?: string
  description?: string
  data?: any // Report-specific data structure
  // Delivery
  deliveryMethods?: string[]
  deliveryStatus?: string
  deliveryHistory?: DeliveryRecord[]
  // Metadata
  facilityName?: string
  facilityAddress?: string
  signedBy?: string
  signedDate?: string
  comments?: string
}

export interface DeliveryRecord {
  method: 'email' | 'portal' | 'print' | 'api' | 'hl7'
  deliveredAt: string
  deliveredTo?: string
  status: 'success' | 'failed' | 'pending'
  error?: string
}

export interface AnalyticsReport {
  reportType: 'Operational' | 'Financial' | 'Clinical' | 'Quality'
  startDate: string
  endDate: string
  metrics: {
    [key: string]: number | string
  }
  charts?: ChartData[]
  generatedOn: string
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'table'
  title: string
  data: any[]
  labels?: string[]
}

