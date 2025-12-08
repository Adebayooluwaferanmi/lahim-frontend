import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@hospitalrun/components'
import { useCreateInvoice, useCharges } from '../hooks/useBilling'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import { Invoice, InvoiceStatus } from '../model/Billing'

const breadcrumbs = [{ i18nKey: 'billing.invoices.new', location: '/billing/invoices/new' }]

const NewInvoice = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('billing.invoices.new', 'New Invoice'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: createInvoice, isPending: isLoading, error } = useCreateInvoice()

  // Get patientId and visitId from URL query params if present
  const searchParams = new URLSearchParams(window.location.search)
  const patientIdFromUrl = searchParams.get('patientId') || ''
  const visitIdFromUrl = searchParams.get('visitId') || ''

  const [formData, setFormData] = useState<Partial<Invoice>>({
    patientId: patientIdFromUrl,
    visitId: visitIdFromUrl || undefined,
    billDate: new Date().toISOString(),
    status: 'Draft',
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paidTotal: 0,
    balance: 0,
    lineItems: [],
    payments: [],
    archived: false,
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  // Load charges for the patient/visit if provided
  const { data: charges = [] } = useCharges({
    patientId: patientIdFromUrl || undefined,
    visitId: visitIdFromUrl || undefined,
    status: 'pending',
  })

  useEffect(() => {
    // Auto-calculate totals when charges are loaded
    if (charges.length > 0) {
      const subtotal = charges.reduce((sum, charge) => sum + (charge.totalAmount || 0), 0)
      const total = subtotal + (formData.tax || 0) - (formData.discount || 0)
      setFormData({
        ...formData,
        subtotal,
        total,
        balance: total,
        lineItems: charges.map((c) => c.id || c._id || '').filter(Boolean),
      })
    }
  }, [charges])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.patientId || !formData.billDate) {
      setSubmitError(t('billing.invoices.requiredFields', 'Patient ID and bill date are required'))
      return
    }

    createInvoice(formData as Invoice, {
      onSuccess: (data) => {
        navigate(`/billing/invoices/${data.id || data._id}`)
      },
      onError: (err: any) => {
        setSubmitError(err.message || t('billing.invoices.createError', 'Failed to create invoice'))
      },
    })
  }

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/billing/invoices')}
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
      <Panel title={String(t('billing.invoices.new', 'New Invoice'))}>
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
                label={String(t('billing.invoices.patientId', 'Patient ID'))}
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
                label={String(t('billing.invoices.billDate', 'Bill Date'))}
                name="billDate"
                value={formData.billDate ? new Date(formData.billDate) : new Date()}
                onChange={(date) => setFormData({ ...formData, billDate: date.toISOString() })}
                isRequired
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <SelectWithLableFormGroup
                label={String(t('billing.invoices.status', 'Status'))}
                name="status"
                value={formData.status || 'Draft'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}
                options={[
                  { label: t('billing.invoices.statusValues.draft', 'Draft'), value: 'Draft' },
                  { label: t('billing.invoices.statusValues.billed', 'Billed'), value: 'Billed' },
                ]}
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.invoices.subtotal', 'Subtotal'))}
                name="subtotal"
                type="number"
                value={String(formData.subtotal || 0)}
                onChange={(e) => {
                  const subtotal = parseFloat(e.target.value) || 0
                  const total = subtotal + (formData.tax || 0) - (formData.discount || 0)
                  setFormData({ ...formData, subtotal, total, balance: total })
                }}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.invoices.tax', 'Tax'))}
                name="tax"
                type="number"
                value={String(formData.tax || 0)}
                onChange={(e) => {
                  const tax = parseFloat(e.target.value) || 0
                  const total = (formData.subtotal || 0) + tax - (formData.discount || 0)
                  setFormData({ ...formData, tax, total, balance: total })
                }}
                isEditable
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.invoices.discount', 'Discount'))}
                name="discount"
                type="number"
                value={String(formData.discount || 0)}
                onChange={(e) => {
                  const discount = parseFloat(e.target.value) || 0
                  const total = (formData.subtotal || 0) + (formData.tax || 0) - discount
                  setFormData({ ...formData, discount, total, balance: total })
                }}
                isEditable
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('billing.invoices.total', 'Total'))}
                name="total"
                type="number"
                value={String(formData.total || 0)}
                onChange={(e) => {
                  const total = parseFloat(e.target.value) || 0
                  setFormData({ ...formData, total, balance: total })
                }}
                isEditable
              />
            </Column>
          </Row>

          {charges.length > 0 && (
            <Row>
              <Column>
                <p>{String(t('billing.invoices.chargesFound', `Found ${charges.length} pending charge(s)`))}</p>
              </Column>
            </Row>
          )}

          <Row>
            <Column>
              <Button color="success" type="submit">
                {String(t('actions.save', 'Save'))}
              </Button>
              <Button
                outlined
                color="secondary"
                onClick={() => navigate('/billing/invoices')}
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

export default NewInvoice


