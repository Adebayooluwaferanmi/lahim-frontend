import { AbstractDBModel } from './Model'

export interface Imaging extends AbstractDBModel {
  patientId: string
  visitId?: string
  imagingType: string // Imaging type/category ID
  imagingTypeName?: string // Display name for imaging type
  status: 'Requested' | 'In Progress' | 'Completed' | 'Cancelled'
  requestedBy: string // User ID who requested
  requestedByName?: string // Display name
  requestedDate: string
  imagingDate?: string
  radiologist?: string // User ID of radiologist
  radiologistName?: string // Display name
  notes?: string
  result?: string // Imaging report/result
  images?: ImagingImage[] // Array of image attachments
  charges?: string[] // Array of charge IDs
}

export interface ImagingImage {
  id: string
  filename: string
  contentType: string
  size: number
  url: string
  uploadedDate: string
  uploadedBy: string
  description?: string
}

export interface ImagingType {
  id: string
  name: string
  code?: string
  description?: string
  category?: string // e.g., 'X-Ray', 'CT Scan', 'MRI', 'Ultrasound', etc.
  active: boolean
}

