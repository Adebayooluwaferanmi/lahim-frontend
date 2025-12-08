import AbstractDBModel from './AbstractDBModel'

export interface Medication extends AbstractDBModel {
  name: string
  code?: string // RxNorm, ATC, or other standard code
  codeSystem?: string // 'RXNORM' | 'ATC' | 'SNOMED' | 'OTHER'
  description?: string
  type?: 'drug' | 'supplement' | 'vaccine' | 'other'
  form?: string // tablet, capsule, liquid, injection, etc.
  strength?: string // e.g., "500mg", "10mg/ml"
  unit?: string
  route?: string // oral, IV, IM, topical, etc.
  frequency?: string
  duration?: string
  quantity?: number
  // Drug information
  genericName?: string
  brandName?: string
  manufacturer?: string
  // Safety
  controlledSubstance?: boolean
  requiresPrescription?: boolean
  // Inventory (if managed in pharmacy)
  inStock?: boolean
  stockQuantity?: number
  unitCost?: number
}

export interface Prescription extends AbstractDBModel {
  patientId: string
  visitId?: string
  medicationId?: string
  medication?: Medication // Embedded medication data
  // Prescription details
  medicationName: string
  dosage: string // e.g., "500mg"
  frequency: string // e.g., "twice daily", "Q8H"
  route: string // oral, IV, etc.
  quantity: number
  quantityUnit?: string // tablets, ml, etc.
  duration?: number // days
  durationUnit?: 'days' | 'weeks' | 'months'
  startDate: string
  endDate?: string
  // Prescriber
  prescribedBy?: string
  prescriberName?: string
  // Status
  status: 'active' | 'completed' | 'cancelled' | 'discontinued'
  // Instructions
  instructions?: string
  notes?: string
  // Refills
  refills?: number
  refillsRemaining?: number
  // Pharmacy
  pharmacyId?: string
  pharmacyName?: string
  routedToPharmacy?: boolean
  // Administration tracking
  administrations?: MedicationAdministration[]
}

export interface MedicationAdministration extends AbstractDBModel {
  prescriptionId: string
  patientId: string
  visitId?: string
  medicationName: string
  dosage: string
  administeredAt: string
  administeredBy?: string
  administeredByName?: string
  route: string
  status: 'given' | 'refused' | 'held' | 'not_given'
  reason?: string
  notes?: string
}

