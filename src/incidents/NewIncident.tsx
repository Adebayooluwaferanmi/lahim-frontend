import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
import { useCreateIncident } from '../hooks/useIncidents'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../components/input/TextFieldWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import { Incident, IncidentSeverity, IncidentCategory } from '../model/Incident'

const breadcrumbs = [{ i18nKey: 'incidents.new', location: '/incidents/new' }]

const NewIncident = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('incidents.new', 'New Incident'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createIncident, isPending: isLoading, error } = useCreateIncident()

  // Get patientId and visitId from URL query params if present
  const searchParams = new URLSearchParams(window.location.search)
  const patientIdFromUrl = searchParams.get('patientId') || ''
  const visitIdFromUrl = searchParams.get('visitId') || ''

  const [formData, setFormData] = useState<Partial<Incident>>({
    reportedBy: 'system', // TODO: Get from auth context
    reportedDate: new Date().toISOString(),
    status: 'Reported',
    severity: 'Medium',
    category: 'Patient Safety',
    patientId: patientIdFromUrl || undefined,
    visitId: visitIdFromUrl || undefined,
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.description || !formData.severity || !formData.category) {
      setSubmitError(t('incidents.requiredFields', 'Description, severity, and category are required'))
      return
    }

    createIncident(
      {
        ...formData,
      } as Incident,
      {
        onSuccess: (data) => {
          navigate(`/incidents/${data.id || data._id}`)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('incidents.createError', 'Failed to create incident'))
        },
      }
    )
  }

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/incidents')}
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
      <Panel title={String(t('incidents.new', 'New Incident'))}>
        {(submitError || error) && (
          <Alert
            color="danger"
            title={String(t('states.error', 'Error'))}
            message={String(submitError || (error as any)?.message || t('incidents.createError', 'Failed to create incident'))}
          />
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                name="patientId"
                label={t('incidents.patientId', 'Patient ID (Optional)')}
                value={formData.patientId || ''}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value || undefined })}
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                name="visitId"
                label={t('incidents.visitId', 'Visit ID (Optional)')}
                value={formData.visitId || ''}
                onChange={(e) => setFormData({ ...formData, visitId: e.target.value || undefined })}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <SelectWithLableFormGroup
                name="category"
                label={t('incidents.category', 'Category')}
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as IncidentCategory })}
                options={[
                  { value: 'Patient Safety', label: t('incidents.category.patientSafety', 'Patient Safety') },
                  { value: 'Medication Error', label: t('incidents.category.medicationError', 'Medication Error') },
                  { value: 'Equipment Failure', label: t('incidents.category.equipmentFailure', 'Equipment Failure') },
                  { value: 'Infection Control', label: t('incidents.category.infectionControl', 'Infection Control') },
                  { value: 'Staff Safety', label: t('incidents.category.staffSafety', 'Staff Safety') },
                  { value: 'Environmental', label: t('incidents.category.environmental', 'Environmental') },
                  { value: 'Documentation Error', label: t('incidents.category.documentationError', 'Documentation Error') },
                  { value: 'Other', label: t('incidents.category.other', 'Other') },
                ]}
                isRequired
                isEditable
              />
            </Column>
            <Column md={6}>
              <SelectWithLableFormGroup
                name="severity"
                label={t('incidents.severity', 'Severity')}
                value={formData.severity || 'Medium'}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentSeverity })}
                options={[
                  { value: 'Low', label: t('incidents.severity.low', 'Low') },
                  { value: 'Medium', label: t('incidents.severity.medium', 'Medium') },
                  { value: 'High', label: t('incidents.severity.high', 'High') },
                  { value: 'Critical', label: t('incidents.severity.critical', 'Critical') },
                ]}
                isRequired
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                name="location"
                label={t('incidents.location', 'Location')}
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                name="department"
                label={t('incidents.department', 'Department')}
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <DatePickerWithLabelFormGroup
                name="reportedDate"
                label={t('incidents.reportedDate', 'Reported Date')}
                value={formData.reportedDate ? new Date(formData.reportedDate) : new Date()}
                onChange={(date) => setFormData({ ...formData, reportedDate: date.toISOString() })}
                isRequired
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <TextFieldWithLabelFormGroup
                name="description"
                label={t('incidents.description', 'Description')}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                isRequired
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <Button type="submit" color="success">
                {String(t('actions.save', 'Save'))}
              </Button>
              <Button
                type="button"
                outlined
                color="secondary"
                onClick={() => navigate('/incidents')}
                style={{ marginLeft: '10px' }}
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

export default NewIncident

