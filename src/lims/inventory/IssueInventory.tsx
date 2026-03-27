import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Panel, Alert, Spinner, Container, Row, Column } from '@lahim/components'
import { useIssueInventory } from '../../hooks/useInventory'
import { useInventoryItems } from '../../hooks/useInventory'
import useTitle from '../../page-header/useTitle'
import useAddBreadcrumbs from '../../breadcrumbs/useAddBreadcrumbs'
import { useButtonToolbarSetter } from '../../page-header/ButtonBarProvider'
import SelectWithLabelFormGroup from '../../components/input/SelectWithLableFormGroup'
import TextInputWithLabelFormGroup from '../../components/input/TextInputWithLabelFormGroup'
import TextFieldWithLabelFormGroup from '../../components/input/TextFieldWithLabelFormGroup'

const breadcrumbs = [{ i18nKey: 'lims.inventory.issue', location: '/lims/inventory/issue' }]

const IssueInventory = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  useTitle(t('lims.inventory.issue', 'Issue Inventory'))
  useAddBreadcrumbs(breadcrumbs, true)
  const setButtonToolBar = useButtonToolbarSetter()
  const { mutate: issueInventory, isPending: isLoading, error } = useIssueInventory()
  const { data: items = [] } = useInventoryItems({})

  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    location: '',
    reference: '',
    notes: '',
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!formData.itemId || !formData.quantity || !formData.location) {
      setSubmitError(t('lims.inventory.requiredFieldsIssue', 'Item, quantity, and location are required'))
      return
    }

    issueInventory(
      {
        itemId: formData.itemId,
        quantity: parseFloat(formData.quantity),
        location: formData.location,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          navigate('/lims/inventory/stock-levels')
        },
        onError: (err: any) => {
          setSubmitError(err.message || t('lims.inventory.issueError', 'Failed to issue inventory'))
        },
      }
    )
  }

  useEffect(() => {
    setButtonToolBar([
      <Button
        key="cancelButton"
        outlined
        color="secondary"
        onClick={() => navigate('/lims/inventory/stock-levels')}
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
      <Panel title={String(t('lims.inventory.issue', 'Issue Inventory'))}>
        {(submitError || error) && (
          <Alert color="danger" title={String(t('states.error', 'Error'))} message={String(submitError || (error as any)?.message || '')} />
        )}

        <form onSubmit={handleSubmit}>
          <Row>
            <Column md={6}>
              <SelectWithLabelFormGroup
                label={String(t('lims.inventory.item', 'Item'))}
                name="itemId"
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                options={[
                  { value: '', label: String(t('lims.inventory.selectItem', 'Select Item')) },
                ].concat(items.map((item) => ({
                  value: item.id || item._id || '',
                  label: `${item.itemCode} - ${item.itemName}`,
                })))}
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.inventory.quantity', 'Quantity'))}
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                isRequired
              />
            </Column>
          </Row>

          <Row>
            <Column md={6}>
              <SelectWithLabelFormGroup
                label={String(t('lims.inventory.location', 'Location'))}
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                options={[
                  { value: '', label: String(t('lims.inventory.selectLocation', 'Select Location')) },
                  { value: 'main', label: String(t('lims.inventory.locationValues.main', 'Main')) },
                  { value: 'chemistry', label: String(t('lims.inventory.locationValues.chemistry', 'Chemistry')) },
                  { value: 'hematology', label: String(t('lims.inventory.locationValues.hematology', 'Hematology')) },
                  { value: 'microbiology', label: String(t('lims.inventory.locationValues.microbiology', 'Microbiology')) },
                  { value: 'storage', label: String(t('lims.inventory.locationValues.storage', 'Storage')) },
                ]}
              />
            </Column>
            <Column md={6}>
              <TextInputWithLabelFormGroup
                label={String(t('lims.inventory.reference', 'Reference'))}
                name="reference"
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder={String(t('lims.inventory.referencePlaceholder', 'e.g., Worklist ID, Order ID'))}
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <TextFieldWithLabelFormGroup
                label={String(t('lims.inventory.notes', 'Notes'))}
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Column>
          </Row>

          <Row>
            <Column md={12}>
              <Button color="success" icon="save" iconLocation="left" disabled={isLoading}>
                {isLoading ? String(t('lims.inventory.issuing', 'Issuing...')) : String(t('lims.inventory.issue', 'Issue Inventory'))}
              </Button>
            </Column>
          </Row>
        </form>
      </Panel>
    </Container>
  )
}

export default IssueInventory

