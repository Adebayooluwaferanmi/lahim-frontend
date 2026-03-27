import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert, Table } from '@lahim/components'
import { useInvoices } from '../hooks/useBilling'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { Invoice } from '../model/Billing'

const breadcrumbs = [{ i18nKey: 'billing.invoices.label', location: '/billing/invoices' }]

const Invoices = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('billing.invoices.label', 'Invoices'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [patientIdFilter, setPatientIdFilter] = useState('')

  const { data: invoices = [], isLoading, error } = useInvoices({
    status: statusFilter || undefined,
    patientId: patientIdFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newInvoiceButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/billing/invoices/new')}
      >
        {String(t('billing.invoices.new', 'New Invoice'))}
      </Button>,
    ])

    return () => {
      setButtonToolBar([])
    }
  }, [setButtonToolBar, navigate, t])

  if (isLoading) {
    return (
      <Container>
        <Spinner color="blue" loading size={[10, 25]} type="ScaleLoader" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Alert
          color="danger"
          title={String(t('states.error', 'Error'))}
          message={String(error.message || t('billing.invoices.loadError', 'Failed to load invoices'))}
        />
      </Container>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'success'
      case 'PartiallyPaid':
        return 'warning'
      case 'Billed':
        return 'info'
      case 'Draft':
        return 'secondary'
      case 'Cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  return (
    <Container>
      <Row>
        <Column md={4}>
          <input
            type="text"
            className="form-control"
            placeholder={String(t('billing.invoices.searchPatientId', 'Search by Patient ID'))}
            value={patientIdFilter}
            onChange={(e) => setPatientIdFilter(e.target.value)}
          />
        </Column>
        <Column md={4}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{String(t('billing.invoices.allStatus', 'All Status'))}</option>
            <option value="Draft">{String(t('billing.invoices.statusValues.draft', 'Draft'))}</option>
            <option value="Billed">{String(t('billing.invoices.statusValues.billed', 'Billed'))}</option>
            <option value="Paid">{String(t('billing.invoices.statusValues.paid', 'Paid'))}</option>
            <option value="PartiallyPaid">{String(t('billing.invoices.statusValues.partiallyPaid', 'Partially Paid'))}</option>
            <option value="Cancelled">{String(t('billing.invoices.statusValues.cancelled', 'Cancelled'))}</option>
          </select>
        </Column>
      </Row>

      <Row className="mt-3">
        <Column>
          <Table
            data={invoices.map((invoice: Invoice) => ({
              id: invoice.id || invoice._id,
              invoiceNumber: invoice.invoiceNumber || '-',
              patientId: invoice.patientId,
              billDate: formatDate(invoice.billDate),
              total: formatCurrency(invoice.total),
              paidTotal: formatCurrency(invoice.paidTotal),
              balance: formatCurrency(invoice.balance),
              status: invoice.status,
              actions: (
                <Button
                  color="primary"
                  onClick={() => navigate(`/billing/invoices/${invoice.id || invoice._id}`)}
                >
                  {String(t('actions.view', 'View'))}
                </Button>
              ),
            }))}
            columns={[
              { label: t('billing.invoices.invoiceNumber', 'Invoice #'), key: 'invoiceNumber' },
              { label: t('billing.invoices.patientId', 'Patient ID'), key: 'patientId' },
              { label: t('billing.invoices.billDate', 'Bill Date'), key: 'billDate' },
              { label: t('billing.invoices.total', 'Total'), key: 'total' },
              { label: t('billing.invoices.paid', 'Paid'), key: 'paidTotal' },
              { label: t('billing.invoices.balance', 'Balance'), key: 'balance' },
              { label: t('billing.invoices.status', 'Status'), key: 'status' },
              { label: t('actions.label', 'Actions'), key: 'actions' },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Invoices


