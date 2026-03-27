import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, Badge, Alert, Spinner } from '@lahim/components'
import { useStockLevels } from '../../hooks/useInventory'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.inventory.stockLevels', location: '/lims/inventory/stock-levels' }]

const StockLevels = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.inventory.stockLevels', 'Stock Levels'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [locationFilter, setLocationFilter] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [expiringSoon, setExpiringSoon] = useState(false)

  const { data: stockLevels = [], isLoading, error } = useStockLevels({
    location: locationFilter || undefined,
    lowStockOnly,
    expiringSoon,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="receiveButton"
        color="primary"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/inventory/receive')}
      >
        {String(t('lims.inventory.receive', 'Receive Inventory'))}
      </Button>,
      <Button
        key="issueButton"
        color="secondary"
        icon="remove"
        iconLocation="left"
        onClick={() => navigate('/lims/inventory/issue')}
      >
        {String(t('lims.inventory.issue', 'Issue Inventory'))}
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
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error.message || t('lims.inventory.stockLevelsLoadError', 'Failed to load stock levels'))} />
      </Container>
    )
  }

  const lowStockCount = stockLevels.filter((level) => level.status === 'low_stock' || level.status === 'out_of_stock').length

  return (
    <Container>
      {lowStockCount > 0 && (
        <Row>
          <Column>
            <Alert color="warning" title={String(t('lims.inventory.lowStockAlert', 'Low Stock Alert'))} message={String(t('lims.inventory.lowStockMessage', '{{count}} item(s) are low or out of stock', { count: lowStockCount }))} />
          </Column>
        </Row>
      )}

      <Row>
        <Column md={4}>
          <select
            className="form-control"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">{String(t('lims.inventory.allLocations', 'All Locations'))}</option>
            <option value="main">{String(t('lims.inventory.locationValues.main', 'Main'))}</option>
            <option value="chemistry">{String(t('lims.inventory.locationValues.chemistry', 'Chemistry'))}</option>
            <option value="hematology">{String(t('lims.inventory.locationValues.hematology', 'Hematology'))}</option>
            <option value="microbiology">{String(t('lims.inventory.locationValues.microbiology', 'Microbiology'))}</option>
            <option value="storage">{String(t('lims.inventory.locationValues.storage', 'Storage'))}</option>
          </select>
        </Column>
        <Column md={4}>
          <label>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />{' '}
            {String(t('lims.inventory.lowStockOnly', 'Low Stock Only'))}
          </label>
        </Column>
        <Column md={4}>
          <label>
            <input
              type="checkbox"
              checked={expiringSoon}
              onChange={(e) => setExpiringSoon(e.target.checked)}
            />{' '}
            {String(t('lims.inventory.expiringSoon', 'Expiring Soon'))}
          </label>
        </Column>
      </Row>

      <Row>
        <Column>
          {stockLevels.length === 0 ? (
            <div>{String(t('lims.inventory.noStockLevels', 'No stock levels found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.inventory.itemCode', 'Item Code'))}</th>
                  <th>{String(t('lims.inventory.itemName', 'Item Name'))}</th>
                  <th>{String(t('lims.inventory.location', 'Location'))}</th>
                  <th>{String(t('lims.inventory.quantity', 'Quantity'))}</th>
                  <th>{String(t('lims.inventory.unit', 'Unit'))}</th>
                  <th>{String(t('lims.inventory.lotNumber', 'Lot Number'))}</th>
                  <th>{String(t('lims.inventory.expirationDate', 'Expiration Date'))}</th>
                  <th>{String(t('lims.inventory.status', 'Status'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {stockLevels.map((level, index) => (
                  <tr key={index}>
                    <td>{level.itemCode || '-'}</td>
                    <td>{level.itemName || '-'}</td>
                    <td>{level.location || '-'}</td>
                    <td>{level.quantity || 0}</td>
                    <td>{level.unit || '-'}</td>
                    <td>{level.lotNumber || '-'}</td>
                    <td>{level.expirationDate ? new Date(level.expirationDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <Badge color={level.status === 'in_stock' ? 'success' : level.status === 'low_stock' ? 'warning' : 'danger'}>
                        {level.status || '-'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/inventory/items/${level.itemId}`)}
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

export default StockLevels

