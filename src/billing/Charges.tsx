import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Spinner, Alert, Table } from '@hospitalrun/components'
import { useCharges, useCreateCharge } from '../hooks/useBilling'
import { useButtonToolbarSetter } from '../page-header/ButtonBarProvider'
import useTitle from '../page-header/useTitle'
import useAddBreadcrumbs from '../breadcrumbs/useAddBreadcrumbs'
import { Charge } from '../model/Billing'

const breadcrumbs = [{ i18nKey: 'billing.charges.label', location: '/billing/charges' }]

const Charges = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('billing.charges.label', 'Charges'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [patientIdFilter, setPatientIdFilter] = useState('')

  const { data: charges = [], isLoading, error } = useCharges({
    status: statusFilter || undefined,
    patientId: patientIdFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newChargeButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/billing/charges/new')}
      >
        {String(t('billing.charges.new', 'New Charge'))}
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
          message={String(error.message || t('billing.charges.loadError', 'Failed to load charges'))}
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
      <Row>
        <Column md={4}>
          <input
            type="text"
            className="form-control"
            placeholder={String(t('billing.charges.searchPatientId', 'Search by Patient ID'))}
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
            <option value="">{String(t('billing.charges.allStatus', 'All Status'))}</option>
            <option value="pending">{String(t('billing.charges.statusValues.pending', 'Pending'))}</option>
            <option value="billed">{String(t('billing.charges.statusValues.billed', 'Billed'))}</option>
            <option value="cancelled">{String(t('billing.charges.statusValues.cancelled', 'Cancelled'))}</option>
          </select>
        </Column>
      </Row>

      <Row className="mt-3">
        <Column>
          <Table
            data={charges.map((charge: Charge) => ({
              id: charge.id || charge._id,
              patientId: charge.patientId,
              description: charge.description,
              quantity: charge.quantity,
              unitPrice: formatCurrency(charge.unitPrice),
              totalAmount: formatCurrency(charge.totalAmount),
              date: formatDate(charge.date),
              status: charge.status,
            }))}
            columns={[
              { label: t('billing.charges.patientId', 'Patient ID'), key: 'patientId' },
              { label: t('billing.charges.description', 'Description'), key: 'description' },
              { label: t('billing.charges.quantity', 'Quantity'), key: 'quantity' },
              { label: t('billing.charges.unitPrice', 'Unit Price'), key: 'unitPrice' },
              { label: t('billing.charges.totalAmount', 'Total'), key: 'totalAmount' },
              { label: t('billing.charges.date', 'Date'), key: 'date' },
              { label: t('billing.charges.status', 'Status'), key: 'status' },
            ]}
          />
        </Column>
      </Row>
    </Container>
  )
}

export default Charges


