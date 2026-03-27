import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Container, Row, Column, TextInput, Spinner, Alert } from '@lahim/components'
import { useInventoryItems } from '../../hooks/useInventory'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'

const breadcrumbs = [{ i18nKey: 'lims.inventory.items', location: '/lims/inventory/items' }]

const InventoryItems = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.inventory.items', 'Inventory Items'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()

  const [itemCodeFilter, setItemCodeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data: items = [], isLoading, error } = useInventoryItems({
    itemCode: itemCodeFilter || undefined,
    category: categoryFilter || undefined,
  })

  React.useEffect(() => {
    setButtonToolBar([
      <Button
        key="newItemButton"
        color="success"
        icon="add"
        iconLocation="left"
        onClick={() => navigate('/lims/inventory/items/new')}
      >
        {String(t('lims.inventory.newItem', 'New Inventory Item'))}
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
        <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(error.message || t('lims.inventory.loadError', 'Failed to load inventory items'))} />
      </Container>
    )
  }

  return (
    <Container>
      <Row>
        <Column md={6}>
          <TextInput
            placeholder={String(t('lims.inventory.searchItemCode', 'Search by Item Code'))}
            value={itemCodeFilter}
            onChange={(e) => setItemCodeFilter(e.target.value)}
          />
        </Column>
        <Column md={6}>
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{String(t('lims.inventory.allCategories', 'All Categories'))}</option>
            <option value="reagent">{String(t('lims.inventory.category.reagent', 'Reagent'))}</option>
            <option value="consumable">{String(t('lims.inventory.category.consumable', 'Consumable'))}</option>
            <option value="supply">{String(t('lims.inventory.category.supply', 'Supply'))}</option>
            <option value="equipment">{String(t('lims.inventory.category.equipment', 'Equipment'))}</option>
            <option value="other">{String(t('lims.inventory.category.other', 'Other'))}</option>
          </select>
        </Column>
      </Row>

      <Row>
        <Column>
          {items.length === 0 ? (
            <div>{String(t('lims.inventory.noItems', 'No inventory items found'))}</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>{String(t('lims.inventory.itemCode', 'Item Code'))}</th>
                  <th>{String(t('lims.inventory.itemName', 'Item Name'))}</th>
                  <th>{String(t('lims.inventory.category', 'Category'))}</th>
                  <th>{String(t('lims.inventory.unit', 'Unit'))}</th>
                  <th>{String(t('lims.inventory.unitCost', 'Unit Cost'))}</th>
                  <th>{String(t('lims.inventory.reorderPoint', 'Reorder Point'))}</th>
                  <th>{String(t('lims.inventory.status', 'Status'))}</th>
                  <th>{String(t('actions.view', 'View'))}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id || item._id}>
                    <td>{item.itemCode || '-'}</td>
                    <td>{item.itemName || '-'}</td>
                    <td>{item.category || '-'}</td>
                    <td>{item.unit || '-'}</td>
                    <td>{item.unitCost ? `$${item.unitCost.toFixed(2)}` : '-'}</td>
                    <td>{item.reorderPoint || '-'}</td>
                    <td>
                      <span className={`badge badge-${item.active ? 'success' : 'secondary'}`}>
                        {item.active ? String(t('lims.inventory.active', 'Active')) : String(t('lims.inventory.inactive', 'Inactive'))}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/lims/inventory/items/${item.id || item._id}`)}
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

export default InventoryItems

