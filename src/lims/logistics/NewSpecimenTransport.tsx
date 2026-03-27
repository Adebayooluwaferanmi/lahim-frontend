import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert, Panel } from '@lahim/components'
import { useCreateSpecimenTransport } from '../../hooks/useSpecimenTransport'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import SelectWithLableFormGroup from '../../components/input/SelectWithLableFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'
import DatePickerWithLabelFormGroup from '../../components/input/DatePickerWithLabelFormGroup'

const NewSpecimenTransport = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMutation = useCreateSpecimenTransport()
  const setButtonToolBar = useButtonToolbarSetter()

  const [formData, setFormData] = useState({
    specimenId: '',
    orderId: '',
    transportType: 'internal',
    origin: '',
    destination: '',
    carrier: '',
    trackingNumber: '',
    scheduledAt: new Date().toISOString().split('T')[0],
    cost: '',
    notes: '',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  useTitle(t('lims.logistics.newTransport', 'New Transport'))
  useAddBreadcrumbs(
    [
      { i18nKey: 'lims.logistics.specimenTransport', location: '/lims/logistics/transport' },
      { i18nKey: 'lims.logistics.newTransport', location: '/lims/logistics/transport/new' },
    ],
    true
  )

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="backButton"
        outlined
        color="secondary"
        icon="left-arrow"
        iconLocation="left"
        onClick={() => navigate('/lims/logistics/transport')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ])
    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.specimenId || !formData.orderId || !formData.origin || !formData.destination) {
      setSubmitError(t('lims.logistics.requiredFields', 'Please fill in all required fields'))
      return
    }

    try {
      const result = await createMutation.mutateAsync({
        specimenId: formData.specimenId,
        orderId: formData.orderId,
        transportType: formData.transportType as 'internal' | 'external' | 'courier',
        origin: formData.origin,
        destination: formData.destination,
        carrier: formData.carrier || undefined,
        trackingNumber: formData.trackingNumber || undefined,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
        status: 'scheduled',
      })
      navigate(`/lims/logistics/transport/${result.id || result._id}`)
    } catch (err: any) {
      setSubmitError(err.message || t('lims.logistics.createError', 'Failed to create transport'))
    }
  }

  return (
    <Container>
      <Row>
        <Column md={12}>
          <Panel>
            <Panel.Header title={String(t('lims.logistics.newTransport', 'New Transport'))} />
            <Panel.Body>
              {submitError && (
                <Alert color="danger" title={String(t('states.error', 'Error'))} message={submitError} />
              )}

              <form onSubmit={handleSubmit}>
                <Row>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.specimenId', 'Specimen ID'))}
                      name="specimenId"
                      value={formData.specimenId}
                      onChange={(e) => handleFieldChange('specimenId', e.target.value)}
                      isRequired
                      isEditable={true}
                    />
                  </Column>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.orderId', 'Order ID'))}
                      name="orderId"
                      value={formData.orderId}
                      onChange={(e) => handleFieldChange('orderId', e.target.value)}
                      isRequired
                      isEditable={true}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column md={6}>
                    <SelectWithLableFormGroup
                      label={String(t('lims.logistics.transportType', 'Transport Type'))}
                      name="transportType"
                      value={formData.transportType}
                      onChange={(e) => handleFieldChange('transportType', e.target.value)}
                      isRequired
                      isEditable={true}
                    >
                      <option value="internal">{String(t('lims.logistics.type.internal', 'Internal'))}</option>
                      <option value="external">{String(t('lims.logistics.type.external', 'External'))}</option>
                      <option value="courier">{String(t('lims.logistics.type.courier', 'Courier'))}</option>
                    </SelectWithLableFormGroup>
                  </Column>
                  <Column md={6}>
                    <DatePickerWithLabelFormGroup
                      label={String(t('lims.logistics.scheduledAt', 'Scheduled At'))}
                      name="scheduledAt"
                      value={formData.scheduledAt}
                      onChange={(date) => handleFieldChange('scheduledAt', date)}
                      isRequired
                      isEditable={true}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.origin', 'Origin'))}
                      name="origin"
                      value={formData.origin}
                      onChange={(e) => handleFieldChange('origin', e.target.value)}
                      isRequired
                      isEditable={true}
                    />
                  </Column>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.destination', 'Destination'))}
                      name="destination"
                      value={formData.destination}
                      onChange={(e) => handleFieldChange('destination', e.target.value)}
                      isRequired
                      isEditable={true}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.carrier', 'Carrier'))}
                      name="carrier"
                      value={formData.carrier}
                      onChange={(e) => handleFieldChange('carrier', e.target.value)}
                      isEditable={true}
                    />
                  </Column>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.trackingNumber', 'Tracking Number'))}
                      name="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={(e) => handleFieldChange('trackingNumber', e.target.value)}
                      isEditable={true}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column md={6}>
                    <TextInputWithLabelFormGroup
                      label={String(t('lims.logistics.cost', 'Cost'))}
                      name="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => handleFieldChange('cost', e.target.value)}
                      isEditable={true}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column md={12}>
                    <TextFieldWithLabelFormGroup
                      label={String(t('lims.logistics.notes', 'Notes'))}
                      name="notes"
                      value={formData.notes}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      isEditable={true}
                    />
                  </Column>
                </Row>

                <Row>
                  <Column md={12}>
                    <Button type="submit" color="primary" icon="save" iconLocation="left">
                      {String(t('actions.save', 'Save'))}
                    </Button>
                  </Column>
                </Row>
              </form>
            </Panel.Body>
          </Panel>
        </Column>
      </Row>
    </Container>
  )
}

export default NewSpecimenTransport

