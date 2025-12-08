import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@hospitalrun/components'
import { useCreateImaging, useImagingTypes } from '../hooks/useImaging'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import { Imaging } from '../model/Imaging'

const breadcrumbs = [{ i18nKey: 'imaging.new', location: '/imaging/new' }]

const NewImaging = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('imaging.new', 'New Imaging Order'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createImaging, isPending: isLoading, error } = useCreateImaging()
  const { data: imagingTypes = [], isLoading: typesLoading } = useImagingTypes({ active: true })

  // Get patientId and visitId from URL query params if present
  const searchParams = new URLSearchParams(window.location.search)
  const patientIdFromUrl = searchParams.get('patientId') || ''
  const visitIdFromUrl = searchParams.get('visitId') || ''

  const [formData, setFormData] = useState<Partial<Imaging>>({
    patientId: patientIdFromUrl,
    visitId: visitIdFromUrl || undefined,
    imagingType: '',
    status: 'Requested',
    requestedBy: 'system', // TODO: Get from auth context
    requestedDate: new Date().toISOString(),
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.patientId) {
      setSubmitError(t('imaging.patientIdRequired', 'Patient ID is required'))
      return
    }

    if (!formData.imagingType) {
      setSubmitError(t('imaging.imagingTypeRequired', 'Imaging type is required'))
      return
    }

    createImaging(
      {
        ...formData,
      } as Imaging,
      {
        onSuccess: (data) => {
          navigate(`/imaging/${data.id || data._id}`)
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('imaging.createError', 'Failed to create imaging order'))
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
        onClick={() => navigate('/imaging')}
      >
        {String(t('actions.cancel', 'Cancel'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (isLoading || typesLoading) {
    return <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
  }

  return (
    <Container>
      <Panel title={String(t('imaging.new', 'New Imaging Order'))}>
        {(submitError || error) && (
          <Alert
            color="danger"
            title={String(t('states.error', 'Error'))}
            message={String(submitError || (error as any)?.message || t('imaging.createError', 'Failed to create imaging order'))}
          />
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                id="patientId"
                label={t('imaging.patientId', 'Patient ID')}
                value={formData.patientId || ''}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                id="visitId"
                label={t('imaging.visitId', 'Visit ID (Optional)')}
                value={formData.visitId || ''}
                onChange={(e) => setFormData({ ...formData, visitId: e.target.value || undefined })}
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <SelectWithLableFormGroup
                id="imagingType"
                label={t('imaging.imagingType', 'Imaging Type')}
                value={formData.imagingType || ''}
                onChange={(e) => {
                  const selectedType = imagingTypes.find((t) => t.id === e.target.value)
                  setFormData({
                    ...formData,
                    imagingType: e.target.value,
                    imagingTypeName: selectedType?.name,
                  })
                }}
                options={imagingTypes.map((type) => ({
                  value: type.id,
                  label: type.name,
                }))}
                required
              />
            </Column>
            <Column md={6}>
              <DatePickerWithLabelFormGroup
                id="requestedDate"
                label={t('imaging.requestedDate', 'Requested Date')}
                value={formData.requestedDate ? new Date(formData.requestedDate) : new Date()}
                onChange={(date) => setFormData({ ...formData, requestedDate: date.toISOString() })}
                required
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <TextInputWithLabelFormGroup
                id="notes"
                label={t('imaging.notes', 'Notes')}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                isTextArea
                rows={4}
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
                onClick={() => navigate('/imaging')}
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

export default NewImaging

