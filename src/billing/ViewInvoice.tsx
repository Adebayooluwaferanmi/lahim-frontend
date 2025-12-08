import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column, Table } from '@hospitalrun/components'
import { useInvoice, useAddPayment } from '../hooks/useBilling'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import TextInputWithLabelFormGroup from '../components/input/TextInputWithLabelFormGroup'
import DatePickerWithLabelFormGroup from '../components/input/DatePickerWithLabelFormGroup'
import SelectWithLableFormGroup from '../components/input/SelectWithLableFormGroup'
import { Invoice, Payment, PaymentMethod } from '../model/Billing'

const ViewInvoice = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: invoice, isLoading, error } = useInvoice(id)
  const { mutate: addPayment, isPending: isAddingPayment } = useAddPayment(id || '')

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentData, setPaymentData] = useState<Partial<Payment>>({
    amount: 0,
    paymentDate: new Date().toISOString(),
    paymentMethod: 'cash',
  })

  useTitle(invoice ? t('billing.invoices.view', 'View Invoice') : t('billing.invoices.loading', 'Loading Invoice'))
  useAddBreadcrumbs(
    [
      { i18nKey: 'billing.invoices.label', location: '/billing/invoices' },
      { i18nKey: 'billing.invoices.view', location: `/billing/invoices/${id}` },
    ],
    true
  )
  const setButtonToolBar = useButtonToolbarSetter()

  useEffect(() => {
    const buttons = [
      <Button
        key="backButton"
        outlined
        color="secondary"
        onClick={() => navigate('/billing/invoices')}
      >
        {String(t('actions.back', 'Back'))}
      </Button>,
    ]

    if (invoice && invoice.balance > 0) {
      buttons.unshift(
        <Button
          key="addPaymentButton"
          color="success"
          onClick={() => setShowPaymentForm(!showPaymentForm)}
        >
          {String(t('billing.payments.add', 'Add Payment'))}
        </Button>
      )
    }

    setButtonToolBar(buttons)

    return () => {
      setButtonToolBar([])
    }
  }, [invoice, showPaymentForm, setButtonToolBar, navigate, t])

  const handleAddPayment = () => {
    if (!paymentData.amount || !paymentData.paymentDate) {
      return
    }

    addPayment(paymentData, {
      onSuccess: () => {
        setShowPaymentForm(false)
        setPaymentData({
          amount: 0,
          paymentDate: new Date().toISOString(),
          paymentMethod: 'cash',
        })
      },
    })
  }

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error || !invoice) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error?.message || t('billing.invoices.notFound', 'Invoice not found'))}
        />
      </Container>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Container>
      <Panel title={String(t('billing.invoices.view', 'View Invoice'))}>
        <Row>
          <Column md={6}>
            <p><strong>{t('billing.invoices.invoiceNumber', 'Invoice Number')}:</strong> {invoice.invoiceNumber || '-'}</p>
            <p><strong>{t('billing.invoices.patientId', 'Patient ID')}:</strong> {invoice.patientId}</p>
            <p><strong>{t('billing.invoices.billDate', 'Bill Date')}:</strong> {formatDate(invoice.billDate)}</p>
            <p><strong>{t('billing.invoices.status', 'Status')}:</strong> {invoice.status}</p>
          </Column>
          <Column md={6}>
            <p><strong>{t('billing.invoices.subtotal', 'Subtotal')}:</strong> {formatCurrency(invoice.subtotal)}</p>
            <p><strong>{t('billing.invoices.tax', 'Tax')}:</strong> {formatCurrency(invoice.tax || 0)}</p>
            <p><strong>{t('billing.invoices.discount', 'Discount')}:</strong> {formatCurrency(invoice.discount || 0)}</p>
            <p><strong>{t('billing.invoices.total', 'Total')}:</strong> {formatCurrency(invoice.total)}</p>
            <p><strong>{t('billing.invoices.paid', 'Paid')}:</strong> {formatCurrency(invoice.paidTotal)}</p>
            <p><strong>{t('billing.invoices.balance', 'Balance')}:</strong> {formatCurrency(invoice.balance)}</p>
          </Column>
        </Row>

        {showPaymentForm && (
          <Panel title={String(t('billing.payments.add', 'Add Payment'))} className="mt-3">
            <Row>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={String(t('billing.payments.amount', 'Amount'))}
                  name="amount"
                  type="number"
                  value={String(paymentData.amount || 0)}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  isRequired
                />
              </Column>
              <Column md={6}>
                <DatePickerWithLabelFormGroup
                  label={String(t('billing.payments.paymentDate', 'Payment Date'))}
                  name="paymentDate"
                  value={paymentData.paymentDate ? new Date(paymentData.paymentDate) : new Date()}
                  onChange={(date) => setPaymentData({ ...paymentData, paymentDate: date.toISOString() })}
                  isRequired
                />
              </Column>
            </Row>
            <Row>
              <Column md={6}>
                <SelectWithLableFormGroup
                  label={String(t('billing.payments.paymentMethod', 'Payment Method'))}
                  name="paymentMethod"
                  value={paymentData.paymentMethod || 'cash'}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as PaymentMethod })}
                  options={[
                    { label: 'Cash', value: 'cash' },
                    { label: 'Card', value: 'card' },
                    { label: 'Check', value: 'check' },
                    { label: 'Bank Transfer', value: 'bank_transfer' },
                    { label: 'Insurance', value: 'insurance' },
                    { label: 'Other', value: 'other' },
                  ]}
                />
              </Column>
              <Column md={6}>
                <TextInputWithLabelFormGroup
                  label={String(t('billing.payments.referenceNumber', 'Reference Number'))}
                  name="referenceNumber"
                  type="text"
                  value={paymentData.referenceNumber || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                />
              </Column>
            </Row>
            <Row>
              <Column>
                <Button color="success" onClick={handleAddPayment} disabled={isAddingPayment}>
                  {String(t('actions.save', 'Save'))}
                </Button>
                <Button
                  outlined
                  color="secondary"
                  onClick={() => setShowPaymentForm(false)}
                  className="ml-2"
                >
                  {String(t('actions.cancel', 'Cancel'))}
                </Button>
              </Column>
            </Row>
          </Panel>
        )}

        {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
          <Panel title={String(t('billing.payments.history', 'Payment History'))} className="mt-3">
            <Table
              data={invoice.paymentHistory.map((payment) => ({
                id: payment.id || payment._id,
                paymentDate: formatDate(payment.paymentDate),
                amount: formatCurrency(payment.amount),
                paymentMethod: payment.paymentMethod,
                referenceNumber: payment.referenceNumber || '-',
              }))}
              columns={[
                { label: t('billing.payments.paymentDate', 'Payment Date'), key: 'paymentDate' },
                { label: t('billing.payments.amount', 'Amount'), key: 'amount' },
                { label: t('billing.payments.paymentMethod', 'Payment Method'), key: 'paymentMethod' },
                { label: t('billing.payments.referenceNumber', 'Reference Number'), key: 'referenceNumber' },
              ]}
            />
          </Panel>
        )}

        {invoice.charges && invoice.charges.length > 0 && (
          <Panel title={String(t('billing.charges.label', 'Charges'))} className="mt-3">
            <Table
              data={invoice.charges.map((charge) => ({
                id: charge.id || charge._id,
                description: charge.description,
                quantity: charge.quantity,
                unitPrice: formatCurrency(charge.unitPrice),
                totalAmount: formatCurrency(charge.totalAmount),
                date: formatDate(charge.date),
              }))}
              columns={[
                { label: t('billing.charges.description', 'Description'), key: 'description' },
                { label: t('billing.charges.quantity', 'Quantity'), key: 'quantity' },
                { label: t('billing.charges.unitPrice', 'Unit Price'), key: 'unitPrice' },
                { label: t('billing.charges.totalAmount', 'Total'), key: 'totalAmount' },
                { label: t('billing.charges.date', 'Date'), key: 'date' },
              ]}
            />
          </Panel>
        )}
      </Panel>
    </Container>
  )
}

export default ViewInvoice


