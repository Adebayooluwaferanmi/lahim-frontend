import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column, Table, Badge } from '@lahim/components'
import { 
  usePatientInsurance, 
  useAddPatientInsurance, 
  useInsuranceProviders, 
  PatientInsurance as PatientInsuranceType,
  useVerifyNHIAMember,
  NHIAMemberVerificationResponse
} from '../../hooks/useInsurance'
import Patient from '../../model/Patient'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../../components/input/DatePickerWithLabelFormGroup'

interface Props {
  patient: Patient
}

const PatientInsurance = ({ patient }: Props) => {
  const { t } = useTranslation()
  const { data: insurance = [], isLoading, error } = usePatientInsurance(patient.id)
  const { data: providers = [] } = useInsuranceProviders({ active: true })
  const { mutate: addInsurance, isPending: isAdding } = useAddPatientInsurance(patient.id || '')
  const { mutate: verifyNHIA, isPending: isVerifyingNHIA } = useVerifyNHIAMember()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<PatientInsuranceType>>({
    providerId: '',
    policyNumber: '',
    groupNumber: '',
    subscriberName: '',
    relationship: 'self',
    isPrimary: false,
    active: true,
    effectiveDate: new Date().toISOString(),
  })

  const [nhiaVerification, setNHIAVerification] = useState<NHIAMemberVerificationResponse | null>(null)
  const [showNHIAVerification, setShowNHIAVerification] = useState(false)
  const [nhiaVerificationData, setNHIAVerificationData] = useState({
    nhisNumber: '',
    cardNumber: '',
  })

  // Check if selected provider is NHIA
  const selectedProvider = providers.find(p => (p.id || p._id) === formData.providerId)
  const isNHIAProvider = selectedProvider?.type === 'nhia'

  const normalizedInsurance = Array.isArray(insurance) ? insurance : (insurance as any)?.insurance || []

  const handleNHIAVerification = () => {
    if (!nhiaVerificationData.nhisNumber && !nhiaVerificationData.cardNumber) {
      alert(t('insurance.nhia.requiredFields', 'Please enter NHIS number or card number'))
      return
    }

    verifyNHIA(
      {
        nhisNumber: nhiaVerificationData.nhisNumber || undefined,
        cardNumber: nhiaVerificationData.cardNumber || undefined,
        dateOfBirth: patient.dateOfBirth,
        firstName: patient.givenName,
        lastName: patient.familyName,
      },
      {
        onSuccess: (response) => {
          setNHIAVerification(response)
          if (response.valid && response.memberId) {
            // Auto-fill form with NHIA data
            setFormData({
              ...formData,
              nhisNumber: response.nhisNumber,
              cardNumber: response.cardNumber,
              memberId: response.memberId,
              policyNumber: response.nhisNumber || response.cardNumber || '',
              membershipType: response.membershipType,
              membershipStatus: response.membershipStatus,
              premiumStatus: response.premiumStatus,
              scheme: response.scheme,
              expiryDate: response.expiryDate,
            })
          }
        },
        onError: (err: any) => {
          alert(err.message || t('insurance.nhia.verificationFailed', 'NHIA verification failed'))
        },
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.providerId || !formData.policyNumber) {
      alert(t('insurance.requiredFields', 'Please fill in required fields'))
      return
    }

    addInsurance(formData as PatientInsuranceType, {
      onSuccess: () => {
        setShowForm(false)
        setNHIAVerification(null)
        setShowNHIAVerification(false)
        setNHIAVerificationData({ nhisNumber: '', cardNumber: '' })
        setFormData({
          providerId: '',
          policyNumber: '',
          groupNumber: '',
          subscriberName: '',
          relationship: 'self',
          isPrimary: false,
          active: true,
          effectiveDate: new Date().toISOString(),
        })
      },
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <div>
      <div className="mb-3">
        <Button color="success" icon="add" onClick={() => setShowForm(!showForm)}>
          {String(t('insurance.add', 'Add Insurance'))}
        </Button>
      </div>

      {showForm && (
        <Panel title={String(t('insurance.new', 'New Insurance'))} className="mb-3">
          <form onSubmit={handleSubmit}>
            <Row>
              <Column md={6}>
                <SelectWithLableFormGroup
                  label={String(t('insurance.provider', 'Provider'))}
                  name="providerId"
                  value={formData.providerId || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, providerId: e.target.value })
                    setNHIAVerification(null)
                    setShowNHIAVerification(false)
                  }}
                  options={[
                    { label: t('insurance.selectProvider', 'Select Provider'), value: '' },
                    ...providers.map((p) => ({
                      label: p.name,
                      value: p.id || p._id || '',
                    })),
                  ]}
                  isRequired
                  isEditable
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={String(t('insurance.policyNumber', 'Policy Number'))}
                  name="policyNumber"
                  type="text"
                  value={formData.policyNumber || ''}
                  onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                  isRequired
                  isEditable
                />
              </Column>
            </Row>

            {/* NHIA-specific fields */}
            {isNHIAProvider && (
              <>
                <Row>
                  <Column md={12}>
                    <Alert color="info" title={String(t('insurance.nhia.info', 'NHIA Insurance'))} message={String(t('insurance.nhia.infoMessage', 'Please verify NHIA membership before proceeding'))} />
                  </Column>
                </Row>
                <Row>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('insurance.nhia.nhisNumber', 'NHIS Number'))}
                      name="nhisNumber"
                      type="text"
                      value={formData.nhisNumber || nhiaVerificationData.nhisNumber || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, nhisNumber: e.target.value })
                        setNHIAVerificationData({ ...nhiaVerificationData, nhisNumber: e.target.value })
                      }}
                      isEditable
                    />
                  </Column>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('insurance.nhia.cardNumber', 'Card Number'))}
                      name="cardNumber"
                      type="text"
                      value={formData.cardNumber || nhiaVerificationData.cardNumber || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, cardNumber: e.target.value })
                        setNHIAVerificationData({ ...nhiaVerificationData, cardNumber: e.target.value })
                      }}
                      isEditable
                    />
                  </Column>
                </Row>
                <Row>
                  <Column md={12}>
                    <Button
                      color="primary"
                      onClick={(e) => {
                        e.preventDefault()
                        handleNHIAVerification()
                      }}
                      disabled={isVerifyingNHIA}
                    >
                      {isVerifyingNHIA ? (
                        <>
                          <Spinner color="blue" loading size={[16, 16]} type="ScaleLoader" />
                          {String(t('insurance.nhia.verifying', 'Verifying...'))}
                        </>
                      ) : (
                        String(t('insurance.nhia.verify', 'Verify NHIA Membership'))
                      )}
                    </Button>
                  </Column>
                </Row>
                {nhiaVerification && (
                  <Row>
                    <Column md={12}>
                      {nhiaVerification.valid ? (
                        <Alert
                          color="success"
                          title={String(t('insurance.nhia.verified', 'NHIA Member Verified'))}
                          message={String(
                            nhiaVerification.message ||
                            t('insurance.nhia.verifiedMessage', 'Member verified successfully. Membership status: {status}', {
                              status: nhiaVerification.membershipStatus || 'active',
                            })
                          )}
                        />
                      ) : (
                        <Alert
                          color="danger"
                          title={String(t('insurance.nhia.verificationFailed', 'Verification Failed'))}
                          message={String(nhiaVerification.message || t('insurance.nhia.invalidMember', 'Invalid NHIA member'))}
                        />
                      )}
                    </Column>
                  </Row>
                )}
                {formData.memberId && (
                  <Row>
                    <Column md={6}>
                      <TextInputWithLabelFormGroup
                        label={String(t('insurance.nhia.memberId', 'Member ID'))}
                        name="memberId"
                        type="text"
                        value={formData.memberId || ''}
                        disabled
                        isEditable={false}
                      />
                    </Column>
                    <Column md={6}>
                      <TextInputWithLabelFormGroup
                        label={String(t('insurance.nhia.membershipStatus', 'Membership Status'))}
                        name="membershipStatus"
                        type="text"
                        value={formData.membershipStatus || ''}
                        disabled
                        isEditable={false}
                      />
                    </Column>
                  </Row>
                )}
              </>
            )}

            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={String(t('insurance.groupNumber', 'Group Number'))}
                  name="groupNumber"
                  type="text"
                  value={formData.groupNumber || ''}
                  onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                  isEditable
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={String(t('insurance.subscriberName', 'Subscriber Name'))}
                  name="subscriberName"
                  type="text"
                  value={formData.subscriberName || ''}
                  onChange={(e) => setFormData({ ...formData, subscriberName: e.target.value })}
                  isEditable
                />
              </Column>
            </Row>

            <Row>
              <Column md={6}>
                <SelectWithLableFormGroup
                  label={String(t('insurance.relationship', 'Relationship'))}
                  name="relationship"
                  value={formData.relationship || 'self'}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value as any })}
                  options={[
                    { label: t('insurance.relationships.self', 'Self'), value: 'self' },
                    { label: t('insurance.relationships.spouse', 'Spouse'), value: 'spouse' },
                    { label: t('insurance.relationships.child', 'Child'), value: 'child' },
                    { label: t('insurance.relationships.other', 'Other'), value: 'other' },
                  ]}
                  isEditable
                />
              </Column>
              <Column md={6}>
                <DatePickerWithLabelFormGroup
                  label={String(t('insurance.effectiveDate', 'Effective Date'))}
                  name="effectiveDate"
                  value={formData.effectiveDate ? new Date(formData.effectiveDate) : new Date()}
                  onChange={(date) => setFormData({ ...formData, effectiveDate: date.toISOString() })}
                  isEditable
                />
              </Column>
            </Row>

            <Row>
              <Column>
                <Button color="success" type="submit" disabled={isAdding}>
                  {String(t('actions.save', 'Save'))}
                </Button>
                <Button
                  outlined
                  color="secondary"
                  onClick={() => setShowForm(false)}
                  className="ml-2"
                >
                  {String(t('actions.cancel', 'Cancel'))}
                </Button>
              </Column>
            </Row>
          </form>
        </Panel>
      )}

      {normalizedInsurance.length === 0 ? (
        <Alert color="info" title={String(t('insurance.noInsurance', 'No Insurance'))} message={String(t('insurance.noInsuranceMessage', 'No insurance information on file'))} />
      ) : (
        <Table
          data={normalizedInsurance.map((ins: PatientInsuranceType) => ({
            id: ins.id || ins._id,
            provider: ins.provider?.name || '-',
            policyNumber: ins.policyNumber,
            nhisNumber: ins.nhisNumber || '-',
            cardNumber: ins.cardNumber || '-',
            groupNumber: ins.groupNumber || '-',
            subscriberName: ins.subscriberName || '-',
            relationship: ins.relationship || '-',
            effectiveDate: formatDate(ins.effectiveDate),
            expiryDate: formatDate(ins.expiryDate),
            membershipStatus: ins.membershipStatus ? (
              <Badge color={ins.membershipStatus === 'active' ? 'success' : 'secondary'}>
                {ins.membershipStatus}
              </Badge>
            ) : '-',
            isPrimary: (
              <Badge color={ins.isPrimary ? 'success' : 'secondary'}>
                {ins.isPrimary ? t('insurance.primary', 'Primary') : t('insurance.secondary', 'Secondary')}
              </Badge>
            ),
            active: (
              <Badge color={ins.active ? 'success' : 'secondary'}>
                {ins.active ? t('insurance.active', 'Active') : t('insurance.inactive', 'Inactive')}
              </Badge>
            ),
          }))}
          columns={[
            { label: t('insurance.provider', 'Provider'), key: 'provider' },
            { label: t('insurance.policyNumber', 'Policy Number'), key: 'policyNumber' },
            { label: t('insurance.nhia.nhisNumber', 'NHIS Number'), key: 'nhisNumber' },
            { label: t('insurance.nhia.cardNumber', 'Card Number'), key: 'cardNumber' },
            { label: t('insurance.groupNumber', 'Group Number'), key: 'groupNumber' },
            { label: t('insurance.subscriberName', 'Subscriber Name'), key: 'subscriberName' },
            { label: t('insurance.relationship', 'Relationship'), key: 'relationship' },
            { label: t('insurance.effectiveDate', 'Effective Date'), key: 'effectiveDate' },
            { label: t('insurance.expiryDate', 'Expiry Date'), key: 'expiryDate' },
            { label: t('insurance.nhia.membershipStatus', 'Membership Status'), key: 'membershipStatus' },
            { label: t('insurance.primary', 'Primary'), key: 'isPrimary' },
            { label: t('insurance.status', 'Status'), key: 'active' },
          ]}
        />
      )}
    </div>
  )
}

export default PatientInsurance


