import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation } from '../lib/mutations'
import { apiClient } from '../lib/api-client'

export interface InsuranceProvider {
  id?: string
  _id?: string
  name: string
  type?: 'commercial' | 'medicare' | 'medicaid' | 'nhia' | 'other'
  payerId?: string
  address?: string
  phone?: string
  email?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PatientInsurance {
  id?: string
  _id?: string
  patientId: string
  providerId: string
  provider?: InsuranceProvider
  policyNumber: string
  groupNumber?: string
  subscriberName?: string
  subscriberId?: string
  relationship?: 'self' | 'spouse' | 'child' | 'other'
  effectiveDate?: string
  expiryDate?: string
  copay?: number
  deductible?: number
  coveragePercentage?: number
  isPrimary: boolean
  active: boolean
  // NHIA-specific fields
  nhisNumber?: string
  cardNumber?: string
  memberId?: string
  membershipType?: string
  membershipStatus?: 'active' | 'inactive' | 'suspended' | 'expired'
  premiumStatus?: 'paid' | 'unpaid' | 'partial'
  scheme?: string
  createdAt?: string
  updatedAt?: string
}

export interface InsuranceVerification {
  covered: boolean
  insurance?: PatientInsurance
  copay?: number
  deductible?: number
  coveragePercentage?: number
  requiresPriorAuth?: boolean
  reason?: string
}

/**
 * Fetch insurance providers
 */
export const useInsuranceProviders = (params: { active?: boolean } = {}) => {
  const { data, ...rest } = useApiQueryWithParams<InsuranceProvider[] | { providers: InsuranceProvider[] }, { active?: boolean }>(
    ['insurance-providers'],
    '/insurance/providers',
    params
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { providers: InsuranceProvider[] }).providers || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Create a new insurance provider
 */
export const useCreateInsuranceProvider = () => {
  return useCreateMutation<InsuranceProvider, Partial<InsuranceProvider>>(
    '/insurance/providers',
    {
      queryKey: ['insurance-providers'],
      invalidateQueries: [['insurance-providers']],
    }
  )
}

/**
 * Get patient insurance information
 */
export const usePatientInsurance = (patientId: string | undefined) => {
  return useApiQuery<PatientInsurance[] | { insurance: PatientInsurance[] }>(
    ['patient-insurance', patientId],
    `/insurance/patients/${patientId || ''}`,
    { enabled: !!patientId }
  )
}

/**
 * Add or update patient insurance
 */
export const useAddPatientInsurance = (patientId: string) => {
  return useCreateMutation<PatientInsurance, Partial<PatientInsurance>>(
    `/insurance/patients/${patientId}`,
    {
      queryKey: ['patient-insurance', patientId],
      invalidateQueries: [['patient-insurance', patientId]],
    }
  )
}

/**
 * Verify insurance coverage
 */
export const useVerifyInsurance = () => {
  return useCreateMutation<InsuranceVerification, { patientId: string; serviceCode?: string; date?: string }>(
    '/insurance/verify',
    {}
  )
}

// NHIA-specific interfaces
export interface NHIAMemberVerificationRequest {
  nhisNumber?: string
  cardNumber?: string
  dateOfBirth?: string
  firstName?: string
  lastName?: string
}

export interface NHIAMemberVerificationResponse {
  valid: boolean
  memberId?: string
  nhisNumber?: string
  cardNumber?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: string
  membershipType?: string
  membershipStatus?: 'active' | 'inactive' | 'suspended' | 'expired'
  expiryDate?: string
  premiumStatus?: 'paid' | 'unpaid' | 'partial'
  scheme?: string
  message?: string
}

export interface NHIAEligibilityRequest {
  memberId: string
  nhisNumber?: string
  serviceCode?: string
  serviceDate?: string
  facilityCode?: string
}

export interface NHIAEligibilityResponse {
  eligible: boolean
  memberId?: string
  nhisNumber?: string
  coverageType?: string
  benefitPackage?: string
  copay?: number
  coveragePercentage?: number
  deductible?: number
  requiresPriorAuth?: boolean
  priorAuthNumber?: string
  restrictions?: string[]
  message?: string
}

export interface NHIAClaimService {
  serviceCode: string
  serviceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface NHIAClaimRequest {
  memberId: string
  nhisNumber?: string
  facilityCode: string
  serviceDate: string
  services: NHIAClaimService[]
  diagnosis?: string[]
  providerId?: string
  claimType?: 'inpatient' | 'outpatient' | 'pharmacy' | 'laboratory'
}

export interface NHIAClaimResponse {
  success: boolean
  claimId?: string
  claimNumber?: string
  status?: 'submitted' | 'approved' | 'rejected' | 'pending'
  amountApproved?: number
  amountRejected?: number
  rejectionReason?: string
  message?: string
}

/**
 * Verify NHIA member
 */
export const useVerifyNHIAMember = () => {
  return useCreateMutation<NHIAMemberVerificationResponse, NHIAMemberVerificationRequest>(
    '/nhia/members/verify',
    {}
  )
}

/**
 * Check NHIA eligibility
 */
export const useCheckNHIAEligibility = () => {
  return useCreateMutation<NHIAEligibilityResponse, NHIAEligibilityRequest>(
    '/nhia/members/eligibility',
    {}
  )
}

/**
 * Submit NHIA claim
 */
export const useSubmitNHIAClaim = () => {
  return useCreateMutation<NHIAClaimResponse, NHIAClaimRequest>(
    '/nhia/claims/submit',
    {}
  )
}

/**
 * Get NHIA claim by ID
 */
export const useNHIAClaim = (claimId: string | undefined) => {
  return useApiQuery<NHIAClaimResponse>(
    ['nhia-claim', claimId],
    `/nhia/claims/${claimId || ''}`,
    { enabled: !!claimId }
  )
}

/**
 * List NHIA claims
 */
export const useNHIAClaims = (params: { memberId?: string; status?: string } = {}) => {
  const { data, ...rest } = useApiQueryWithParams<{ claims: NHIAClaimResponse[] } | NHIAClaimResponse[], { memberId?: string; status?: string }>(
    ['nhia-claims'],
    '/nhia/claims',
    params
  )

  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { claims: NHIAClaimResponse[] }).claims || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}
