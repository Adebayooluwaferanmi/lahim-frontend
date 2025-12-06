import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert } from '@hospitalrun/components'
import { useLabOrders } from '../../hooks/useLabOrders'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.labOrders.label', location: '/lims/lab-orders' }]

const LabOrders = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.labOrders.label', 'Lab Orders'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: labOrders = [], isLoading, error } = useLabOrders({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newLabOrderButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/lab-orders/new')}
      >
        {String(t('lims.labOrders.new', 'New Lab Order'))}
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
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error.message || t('lims.labOrders.loadError', 'Failed to load lab orders'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={6}>
          <TextInput
            placeholder={String(t('lims.labOrders.searchPlaceholder', 'Search by order number or patient name'))}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Column>
        <Column md={6}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{String(t('lims.labOrders.allStatus', 'All Status'))}</option>
            <option value="pending">{String(t('lims.labOrders.statusValues.pending', 'Pending'))}</option>
            <option value="collected">{String(t('lims.labOrders.statusValues.collected', 'Collected'))}</option>
            <option value="received">{String(t('lims.labOrders.statusValues.received', 'Received'))}</option>
            <option value="processing">{String(t('lims.labOrders.statusValues.processing', 'Processing'))}</option>
            <option value="completed">{String(t('lims.labOrders.statusValues.completed', 'Completed'))}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {labOrders.length === 0 ? (
            <div>{String(t('lims.labOrders.noOrders', 'No lab orders found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.labOrders.orderNumber', 'Order Number'))}</th>
                  <th>{String(t('lims.labOrders.patientName', 'Patient Name'))}</th>
                  <th>{String(t('lims.labOrders.status', 'Status'))}</th>
                  <th>{String(t('lims.labOrders.priority', 'Priority'))}</th>
                  <th>{String(t('lims.labOrders.orderedDate', 'Ordered Date'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {labOrders.map((order) => (
                  <tr key={order.id || order._id}>
                    <td>{order.orderNumber || '-'}</td>
                    <td>{order.patientName || '-'}</td>
                    <td>
                      <span className={`badge badge-${order.status === 'completed' ? 'success' : 'warning'}`}>
                        {order.status ? String(t(`lims.labOrders.statusValues.${order.status}`, order.status)) : '-'}
                      </span>
                    </td>
                    <td>{order.priority ? String(t(`lims.labOrders.priorityValues.${order.priority}`, order.priority)) : '-'}</td>
                    <td>{order.orderedDate ? new Date(order.orderedDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/lab-orders/${order.id || order._id}`)}
                      >
                        {String(t('actions.view', 'View'))}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Column>
      </Row>
    </Container>
  )
}

export default LabOrders

