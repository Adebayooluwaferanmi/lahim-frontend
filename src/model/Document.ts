import { AbstractDBModel } from './Model'

export type DocumentType = 
  | 'Patient Document'
  | 'Visit Document'
  | 'Lab Result'
  | 'Imaging Report'
  | 'Prescription'
  | 'Invoice'
  | 'Incident Report'
  | 'General'

export type DocumentStatus = 'Draft' | 'Final' | 'Archived'

export interface Document extends AbstractDBModel {
  documentNumber?: string // Auto-generated document number
  type: DocumentType
  status: DocumentStatus
  title: string
  description?: string
  // File information
  filename: string
  originalFilename: string
  contentType: string
  size: number // Size in bytes
  data: string // Base64 encoded file data
  // Related entities
  patientId?: string
  visitId?: string
  relatedEntityType?: string // e.g., 'lab-result', 'imaging', 'invoice'
  relatedEntityId?: string
  // Metadata
  uploadedBy: string
  uploadedByName?: string
  uploadedDate: string
  lastModified?: string
  modifiedBy?: string
  // Tags and categories
  tags?: string[]
  category?: string
  // Access control
  isPublic?: boolean
  accessLevel?: 'Public' | 'Restricted' | 'Confidential'
}

