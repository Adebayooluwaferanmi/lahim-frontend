import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert } from '@lahim/components'
import { useEquipment } from '../../hooks/useEquipment'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.logistics.equipment', location: '/lims/logistics/equipment' }]

const Equipment = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.logistics.equipment', 'Equipment'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  const { data, isLoading, error } = useEquipment({
    status: statusFilter || undefined,
    equipmentType: typeFilter || undefined,
    location: locationFilter || undefined,
  })

  const equipmentList = data?.equipment || []

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newEquipmentButton"
        color="primary"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/logistics/equipment/new')}
      >
        {String(t('lims.logistics.newEquipment', 'New Equipment'))}
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
          message={String(error.message || t('lims.logistics.loadError', 'Failed to load equipment'))}
        />
      </Container>
    )
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'maintenance':
        return 'warning'
      case 'retired':
      case 'decommissioned':
        return 'secondary'
      default:
        return 'info'
    }
  }

  return (
    <Container>
      <Row>
        <Column md={4}>
          <label>{String(t('lims.logistics.status', 'Status'))}</label>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{String(t('lims.logistics.allStatus', 'All Status'))}</option>
            <option value="active">{String(t('lims.logistics.status.active', 'Active'))}</option>
            <option value="maintenance">{String(t('lims.logistics.status.maintenance', 'Maintenance'))}</option>
            <option value="retired">{String(t('lims.logistics.status.retired', 'Retired'))}</option>
            <option value="decommissioned">{String(t('lims.logistics.status.decommissioned', 'Decommissioned'))}</option>
          </select>
        </Column>
        <Column md={4}>
          <label>{String(t('lims.logistics.equipmentType', 'Equipment Type'))}</label>
          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">{String(t('lims.logistics.allTypes', 'All Types'))}</option>
            <option value="analyzer">{String(t('lims.logistics.type.analyzer', 'Analyzer'))}</option>
            <option value="centrifuge">{String(t('lims.logistics.type.centrifuge', 'Centrifuge'))}</option>
            <option value="microscope">{String(t('lims.logistics.type.microscope', 'Microscope'))}</option>
            <option value="refrigerator">{String(t('lims.logistics.type.refrigerator', 'Refrigerator'))}</option>
            <option value="freezer">{String(t('lims.logistics.type.freezer', 'Freezer'))}</option>
          </select>
        </Column>
        <Column md={4}>
          <label>{String(t('lims.logistics.location', 'Location'))}</label>
          <TextInput
            placeholder={String(t('lims.logistics.filterByLocation', 'Filter by location'))}
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          {equipmentList.length === 0 ? (
            <div>{String(t('lims.logistics.noEquipment', 'No equipment found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.logistics.name', 'Name'))}</th>
                  <th>{String(t('lims.logistics.equipmentType', 'Equipment Type'))}</th>
                  <th>{String(t('lims.logistics.manufacturer', 'Manufacturer'))}</th>
                  <th>{String(t('lims.logistics.model', 'Model'))}</th>
                  <th>{String(t('lims.logistics.location', 'Location'))}</th>
                  <th>{String(t('lims.logistics.status', 'Status'))}</th>
                  <th>{String(t('lims.logistics.nextMaintenance', 'Next Maintenance'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {equipmentList.map((item) => (
                  <tr key={item.id || item._id}>
                    <td>{item.name || '-'}</td>
                    <td>{item.equipmentType || '-'}</td>
                    <td>{item.manufacturer || '-'}</td>
                    <td>{item.model || '-'}</td>
                    <td>{item.location || '-'}</td>
                    <td>
                      <span className={`badge badge-${getStatusBadgeColor(item.status || 'active')}`}>
                        {item.status || '-'}
                      </span>
                    </td>
                    <td>
                      {item.nextMaintenance
                        ? new Date(item.nextMaintenance).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/logistics/equipment/${item.id || item._id}`)}
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

export default Equipment

