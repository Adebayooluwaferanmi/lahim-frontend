import { AbstractDBModel } from './Model'

export type IncidentStatus = 'Reported' | 'Under Investigation' | 'Resolved' | 'Closed' | 'Cancelled'
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type IncidentCategory = 
  | 'Patient Safety'
  | 'Medication Error'
  | 'Equipment Failure'
  | 'Infection Control'
  | 'Staff Safety'
  | 'Environmental'
  | 'Documentation Error'
  | 'Other'

export interface Incident extends AbstractDBModel {
  incidentNumber?: string // Auto-generated incident number
  reportedDate: string
  reportedBy: string // User ID who reported
  reportedByName?: string // Display name
  status: IncidentStatus
  severity: IncidentSeverity
  category: IncidentCategory
  description: string
  location?: string
  patientId?: string // If incident involves a patient
  visitId?: string // If incident is related to a visit
  department?: string
  // Investigation details
  investigationStartedDate?: string
  investigatedBy?: string // User ID
  investigatedByName?: string
  investigationNotes?: string
  rootCause?: string
  // Resolution
  resolvedDate?: string
  resolvedBy?: string // User ID
  resolvedByName?: string
  resolution?: string
  correctiveActions?: string[]
  preventiveActions?: string[]
  // Follow-up
  followUpRequired?: boolean
  followUpDate?: string
  followUpNotes?: string
  // Attachments
  attachments?: IncidentAttachment[]
  // Related incidents
  relatedIncidents?: string[] // Array of incident IDs
}

export interface IncidentAttachment {
  id: string
  filename: string
  contentType: string
  size: number
  url: string
  uploadedDate: string
  uploadedBy: string
  description?: string
}

