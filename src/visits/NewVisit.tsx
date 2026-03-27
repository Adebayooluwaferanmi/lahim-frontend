import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
import { useCreateVisit } from '../hooks/useVisits'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup' // Note: filename has typo "Lable" instead of "Label"
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import Visit, { VisitType } from '../model/Visit'

const breadcrumbs = [{ i18nKey: 'visits.new', location: '/visits/new' }]

const NewVisit = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('visits.new', 'New Visit'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createVisit, isPending: isLoading, error } = useCreateVisit()

  // Get patientId from URL query params if present
  const searchParams = new URLSearchParams(window.location.search)
  const patientIdFromUrl = searchParams.get('patientId') || ''

  const [formData, setFormData] = useState<Partial<Visit>>({
    patientId: patientIdFromUrl,
    startDate: new Date().toISOString(),
    visitType: 'Outpatient',
    status: 'InProgress',
    location: '',
    paymentState: 'pending',
    outPatient: true,
    hasAppointment: false,
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.patientId) {
      setSubmitError(t('visits.patientIdRequired', 'Patient ID is required'))
      return
    }

    if (!formData.startDate) {
      setSubmitError(t('visits.startDateRequired', 'Start date is required'))
      return
    }

    if (!formData.visitType) {
      setSubmitError(t('visits.visitTypeRequired', 'Visit type is required'))
      return
    }

    createVisit(
      {
        ...formData,
        outPatient: formData.visitType !== 'Inpatient',
      } as Visit,
      {
        onSuccess: (data) => {
          navigate(`/visits/${data.id || data._id}`)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('visits.createError', 'Failed to create visit'))
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
        onClick={() => navigate('/visits')}
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
      <Panel title={String(t('visits.new', 'New Visit'))}>
        {(submitError || error) && (
          <Alert
            color="danger"
            title={String(t('states.error', 'Error'))}
            message={String(submitError || (error as any)?.message || '')}
          />
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('visits.patientId', 'Patient ID'))}
                name="patientId"
                type="text"
                value={formData.patientId || ''}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                isRequired
                isEditable
              />
            </Column>
            <Column md={6}>
              <DatePickerWithLabelFormGroup
                label={String(t('visits.startDate', 'Start Date'))}
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
              <SelectWithLableFormGroup
                label={String(t('visits.visitType', 'Visit Type'))}
                name="visitType"
                value={formData.visitType || 'Outpatient'}
                onChange={(e) => {
                  const visitType = e.target.value as VisitType
                  setFormData({
                    ...formData,
                    visitType,
                    outPatient: visitType !== 'Inpatient',
                  })
                }}
                options={[
                  { label: t('visits.visitTypes.emergency', 'Emergency'), value: 'Emergency' },
                  { label: t('visits.visitTypes.outpatient', 'Outpatient'), value: 'Outpatient' },
                  { label: t('visits.visitTypes.inpatient', 'Inpatient'), value: 'Inpatient' },
                  { label: t('visits.visitTypes.clinic', 'Clinic'), value: 'Clinic' },
                  { label: t('visits.visitTypes.walkIn', 'Walk-in'), value: 'Walk-in' },
                ]}
                isRequired
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('visits.location', 'Location'))}
                name="location"
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('visits.reasonForVisit', 'Reason for Visit'))}
                name="reasonForVisit"
                type="text"
                value={formData.reasonForVisit || ''}
                onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('visits.examiner', 'Examiner'))}
                name="examiner"
                type="text"
                value={formData.examiner || ''}
                onChange={(e) => setFormData({ ...formData, examiner: e.target.value })}
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
                onClick={() => navigate('/visits')}
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

export default NewVisit

