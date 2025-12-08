import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column, Badge } from '@hospitalrun/components'
import { useCreatePrescription, useMedications, usePrescriptions } from '../hooks/useMedications'
import { useCheckDrugInteractions, DrugInteraction } from '../hooks/useDrugInteractions'
import { usePharmacies } from '../hooks/usePharmacy'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import { Prescription } from '../model/Medication'

const breadcrumbs = [{ i18nKey: 'prescriptions.new', location: '/prescriptions/new' }]

const NewPrescription = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('prescriptions.new', 'New Prescription'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createPrescription, isPending: isLoading, error } = useCreatePrescription()
  const { data: medications = [] } = useMedications({ limit: 100 })
  const { mutate: checkInteractions, isPending: isCheckingInteractions } = useCheckDrugInteractions()
  const { data: pharmacies = [] } = usePharmacies({ active: true })

  // Get patientId from URL query params if present
  const searchParams = new URLSearchParams(window.location.search)
  const patientIdFromUrl = searchParams.get('patientId') || ''

  // Get patient's current active prescriptions for interaction checking
  const { data: currentPrescriptions = [] } = usePrescriptions({
    patientId: patientIdFromUrl || undefined,
    status: 'active',
  })

  const [formData, setFormData] = useState<Partial<Prescription>>({
    patientId: patientIdFromUrl,
    medicationName: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    quantity: 1,
    quantityUnit: 'tablets',
    startDate: new Date().toISOString(),
    status: 'active',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [interactions, setInteractions] = useState<DrugInteraction[]>([])
  const [hasMajorInteractions, setHasMajorInteractions] = useState(false)

  // Check for drug interactions when medication is selected
  useEffect(() => {
    if (formData.medicationName && formData.patientId && currentPrescriptions.length > 0) {
      const currentMedications = currentPrescriptions
        .map(p => p.medicationName)
        .filter(Boolean) as string[]
      
      const allMedications = [...currentMedications, formData.medicationName]

      if (allMedications.length >= 2) {
        checkInteractions(
          { medications: allMedications },
          {
            onSuccess: (result) => {
              setInteractions(result.interactions)
              setHasMajorInteractions(result.hasMajorInteractions)
            },
            onError: () => {
              // Silently fail - interaction checking is not critical
              setInteractions([])
              setHasMajorInteractions(false)
            },
          }
        )
      } else {
        setInteractions([])
        setHasMajorInteractions(false)
      }
    } else {
      setInteractions([])
      setHasMajorInteractions(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.medicationName, formData.patientId, currentPrescriptions.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.patientId || !formData.medicationName || !formData.startDate) {
      setSubmitError(t('prescriptions.requiredFields', 'Please fill in all required fields'))
      return
    }

    // Warn about major interactions but allow override
    if (hasMajorInteractions) {
      const confirmed = window.confirm(
        t('prescriptions.majorInteractionWarning', 
          'WARNING: Major drug interactions detected. Are you sure you want to proceed?')
      )
      if (!confirmed) {
        return
      }
    }

    createPrescription(formData as Prescription, {
      onSuccess: (data) => {
        navigate(`/prescriptions/${data.id || data._id}`)
      },
      onError: (err: any) => {
        setSubmitError(err.message || t('prescriptions.createError', 'Failed to create prescription'))
      },
    })
  }

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/prescriptions')}
      >
        {String(t('actions.cancel', 'Cancel'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (isLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <Container>
      <Panel title={String(t('prescriptions.new', 'New Prescription'))}>
        {(submitError || error) && (
          <Alert
            color="danger"
            title={String(t('states.error', 'Error'))}
            message={String(submitError || (error as any)?.message || '')}
          />
        )}

        {/* Drug Interaction Warnings */}
        {interactions.length > 0 && (
          <Row>
            <Column>
              <Alert
                color={hasMajorInteractions ? 'danger' : 'warning'}
                title={String(t('prescriptions.drugInteractions', 'Drug Interactions Detected'))}
              >
                <div>
                  {interactions.map((interaction, idx) => (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                      <Badge color={
                        interaction.severity === 'major' ? 'danger' :
                        interaction.severity === 'moderate' ? 'warning' : 'info'
                      }>
                        {interaction.severity.toUpperCase()}
                      </Badge>
                      <strong> {interaction.description}</strong>
                      <p style={{ marginTop: '5px', marginBottom: '5px' }}>
                        {interaction.clinicalSignificance}
                      </p>
                      {interaction.recommendation && (
                        <p style={{ fontStyle: 'italic', color: '#666' }}>
                          {t('prescriptions.recommendation', 'Recommendation')}: {interaction.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Alert>
            </Column>
          </Row>
        )}

        {isCheckingInteractions && (
          <Row>
            <Column>
              <Alert color="info" title={String(t('prescriptions.checkingInteractions', 'Checking for drug interactions...'))} />
            </Column>
          </Row>
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('prescriptions.patientId', 'Patient ID'))}
                name="patientId"
                type="text"
                value={formData.patientId || ''}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                isRequired
                isEditable
              />
            </Column>
            <Column md={6}>
              <SelectWithLableFormGroup
                label={String(t('prescriptions.medicationName', 'Medication'))}
                name="medicationName"
                value={formData.medicationName || ''}
                onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                options={medications.map((med) => ({
                  label: med.name,
                  value: med.name,
                }))}
                isRequired
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('prescriptions.dosage', 'Dosage'))}
                name="dosage"
                type="text"
                value={formData.dosage || ''}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 500mg"
                isRequired
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('prescriptions.frequency', 'Frequency'))}
                name="frequency"
                type="text"
                value={formData.frequency || ''}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., twice daily"
                isRequired
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <SelectWithLableFormGroup
                label={String(t('prescriptions.route', 'Route'))}
                name="route"
                value={formData.route || 'oral'}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                options={[
                  { label: 'Oral', value: 'oral' },
                  { label: 'IV', value: 'iv' },
                  { label: 'IM', value: 'im' },
                  { label: 'Topical', value: 'topical' },
                  { label: 'Other', value: 'other' },
                ]}
                isEditable
              />
            </Column>
            <Column md={6}>
              <DatePickerWithLabelFormGroup
                label={String(t('prescriptions.startDate', 'Start Date'))}
                name="startDate"
                value={formData.startDate ? new Date(formData.startDate) : new Date()}
                onChange={(date) => setFormData({ ...formData, startDate: date.toISOString() })}
                isRequired
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('prescriptions.quantity', 'Quantity'))}
                name="quantity"
                type="number"
                value={String(formData.quantity || 1)}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) })}
                isEditable
              />
            </Column>
            <Column md={6}>
              <SelectWithLableFormGroup
                label={String(t('prescriptions.pharmacy', 'Pharmacy (Optional)'))}
                name="pharmacyId"
                value={formData.pharmacyId || ''}
                onChange={(e) => {
                  const selectedPharmacy = pharmacies.find(p => (p.id || p._id) === e.target.value)
                  setFormData({
                    ...formData,
                    pharmacyId: e.target.value || undefined,
                    pharmacyName: selectedPharmacy?.name,
                  })
                }}
                options={[
                  { label: t('prescriptions.noPharmacy', 'No Pharmacy'), value: '' },
                  ...pharmacies.map((pharmacy) => ({
                    label: pharmacy.name,
                    value: pharmacy.id || pharmacy._id || '',
                  })),
                ]}
                isEditable
              />
            </Column>
          </Row>
          <Row>
            <Column md={12}>
              <TextInputWithLabelFormGroup
                label={String(t('prescriptions.instructions', 'Instructions'))}
                name="instructions"
                type="text"
                value={formData.instructions || ''}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <Button color="success" type="submit">
                {String(t('actions.save', 'Save'))}
              </Button>
              <Button
                outlined
                color="secondary"
                onClick={() => navigate('/prescriptions')}
                className="ml-2"
              >
                {String(t('actions.cancel', 'Cancel'))}
              </Button>
            </Column>
          </Row>
        </form>
      </Panel>
    </Container>
  )
}

export default NewPrescription

