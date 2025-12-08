import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert } from '@hospitalrun/components'
import { useSpecimenTransports } from '../../hooks/useSpecimenTransport'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.logistics.specimenTransport', location: '/lims/logistics/transport' }]

const SpecimenTransport = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.logistics.specimenTransport', 'Specimen Transport'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [transportTypeFilter, setTransportTypeFilter] = useState('')

  const { data, isLoading, error } = useSpecimenTransports({
    status: statusFilter || undefined,
    transportType: transportTypeFilter || undefined,
  })

  const transports = data?.transports || []

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newTransportButton"
        color="primary"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/logistics/transport/new')}
      >
        {String(t('lims.logistics.newTransport', 'New Transport'))}
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
          message={String(error.message || t('lims.logistics.loadError', 'Failed to load transports'))}
        />
      </Container>
    )
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success'
      case 'in-transit':
        return 'info'
      case 'failed':
      case 'cancelled':
        return 'danger'
      default:
        return 'warning'
    }
  }

  return (
    <Container>
      <Row>
        <Column md={6}>
          <label>{String(t('lims.logistics.status', 'Status'))}</label>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{String(t('lims.logistics.allStatus', 'All Status'))}</option>
            <option value="scheduled">{String(t('lims.logistics.status.scheduled', 'Scheduled'))}</option>
            <option value="in-transit">{String(t('lims.logistics.status.inTransit', 'In Transit'))}</option>
            <option value="delivered">{String(t('lims.logistics.status.delivered', 'Delivered'))}</option>
            <option value="failed">{String(t('lims.logistics.status.failed', 'Failed'))}</option>
            <option value="cancelled">{String(t('lims.logistics.status.cancelled', 'Cancelled'))}</option>
          </select>
        </Column>
        <Column md={6}>
          <label>{String(t('lims.logistics.transportType', 'Transport Type'))}</label>
          <select
            className="form-control"
            value={transportTypeFilter}
            onChange={(e) => setTransportTypeFilter(e.target.value)}
          >
            <option value="">{String(t('lims.logistics.allTypes', 'All Types'))}</option>
            <option value="internal">{String(t('lims.logistics.type.internal', 'Internal'))}</option>
            <option value="external">{String(t('lims.logistics.type.external', 'External'))}</option>
            <option value="courier">{String(t('lims.logistics.type.courier', 'Courier'))}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {transports.length === 0 ? (
            <div>{String(t('lims.logistics.noTransports', 'No transports found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.logistics.trackingNumber', 'Tracking Number'))}</th>
                  <th>{String(t('lims.logistics.origin', 'Origin'))}</th>
                  <th>{String(t('lims.logistics.destination', 'Destination'))}</th>
                  <th>{String(t('lims.logistics.transportType', 'Transport Type'))}</th>
                  <th>{String(t('lims.logistics.status', 'Status'))}</th>
                  <th>{String(t('lims.logistics.scheduledAt', 'Scheduled At'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {transports.map((transport) => (
                  <tr key={transport.id || transport._id}>
                    <td>{transport.trackingNumber || '-'}</td>
                    <td>{transport.origin || '-'}</td>
                    <td>{transport.destination || '-'}</td>
                    <td>{transport.transportType || '-'}</td>
                    <td>
                      <span className={`badge badge-${getStatusBadgeColor(transport.status || 'scheduled')}`}>
                        {transport.status || '-'}
                      </span>
                    </td>
                    <td>
                      {transport.scheduledAt
                        ? new Date(transport.scheduledAt).toLocaleString()
                        : '-'}
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/logistics/transport/${transport.id || transport._id}`)}
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

export default SpecimenTransport

