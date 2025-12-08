import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@hospitalrun/components'
import { useCreateCharge } from '../hooks/useBilling'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import { Charge } from '../model/Billing'

const breadcrumbs = [{ i18nKey: 'billing.charges.new', location: '/billing/charges/new' }]

const NewCharge = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('billing.charges.new', 'New Charge'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createCharge, isPending: isLoading, error } = useCreateCharge()

  // Get patientId and visitId from URL query params if present
  const searchParams = new URLSearchParams(window.location.search)
  const patientIdFromUrl = searchParams.get('patientId') || ''
  const visitIdFromUrl = searchParams.get('visitId') || ''

  const [formData, setFormData] = useState<Partial<Charge>>({
    patientId: patientIdFromUrl,
    visitId: visitIdFromUrl || undefined,
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    date: new Date().toISOString(),
    status: 'pending',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  // Auto-calculate total when quantity or unitPrice changes
  useEffect(() => {
    const total = (formData.quantity || 0) * (formData.unitPrice || 0)
    setFormData({ ...formData, totalAmount: total })
  }, [formData.quantity, formData.unitPrice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.patientId || !formData.description || !formData.quantity || formData.unitPrice === undefined) {
      setSubmitError(t('billing.charges.requiredFields', 'Please fill in all required fields'))
      return
    }

    createCharge(formData as Charge, {
      onSuccess: () => {
        navigate('/billing/charges')
      },
      onError: (err: any) => {
        setSubmitError(err.message || t('billing.charges.createError', 'Failed to create charge'))
      },
    })
  }

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/billing/charges')}
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
      <Panel title={String(t('billing.charges.new', 'New Charge'))}>
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
                label={String(t('billing.charges.patientId', 'Patient ID'))}
                name="patientId"
                type="text"
                value={formData.patientId || ''}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                isRequired
              />
            </Column>
            <Column md={6}>
              <DatePickerWithLabelFormGroup
                label={String(t('billing.charges.date', 'Date'))}
                name="date"
                value={formData.date ? new Date(formData.date) : new Date()}
                onChange={(date) => setFormData({ ...formData, date: date.toISOString() })}
                isRequired
              />
            </Column>
          </Row>

          <Row>
            <Column>
              <TextInputWithLabelFormGroup
                label={String(t('billing.charges.description', 'Description'))}
                name="description"
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                isRequired
              />
            </Column>
          </Row>

          <Row>
            <Column md={4}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.charges.quantity', 'Quantity'))}
                name="quantity"
                type="number"
                value={String(formData.quantity || 1)}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                isRequired
              />
            </Column>
            <Column md={4}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.charges.unitPrice', 'Unit Price'))}
                name="unitPrice"
                type="number"
                step="0.01"
                value={String(formData.unitPrice || 0)}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                isRequired
              />
            </Column>
            <Column md={4}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.charges.totalAmount', 'Total Amount'))}
                name="totalAmount"
                type="number"
                value={String(formData.totalAmount || 0)}
                disabled
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
                onClick={() => navigate('/billing/charges')}
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

export default NewCharge


